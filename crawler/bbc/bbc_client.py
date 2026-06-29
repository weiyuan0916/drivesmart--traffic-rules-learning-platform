"""Async HTTP client for BBC 6-Minute English crawler.

Features:
- Async I/O via httpx
- Token-bucket-style rate limiting
- Exponential backoff retry on 5xx / connection errors
- Custom user-agent
- Streaming download for large files
- Graceful handling of geo-block / SSL errors
"""
from __future__ import annotations

import asyncio
import logging
from typing import AsyncIterator, Optional

import httpx

from crawler.bbc.config import (
    MAX_CONCURRENCY,
    RATE_LIMIT_SECONDS,
    REQUEST_TIMEOUT,
    RETRY_ATTEMPTS,
    RETRY_BACKOFF_BASE,
    USER_AGENT,
)

logger = logging.getLogger(__name__)


class BBCClientError(Exception):
    """Raised when BBC fetch fails after all retries."""


class RateLimiter:
    """Simple time-window rate limiter — at most 1 request per RATE_LIMIT_SECONDS."""

    def __init__(self, min_interval: float = RATE_LIMIT_SECONDS):
        self._min_interval = min_interval
        self._lock = asyncio.Lock()
        self._last_call = 0.0

    async def acquire(self) -> None:
        async with self._lock:
            now = asyncio.get_event_loop().time()
            wait = self._min_interval - (now - self._last_call)
            if wait > 0:
                await asyncio.sleep(wait)
            self._last_call = asyncio.get_event_loop().time()


class BBCClient:
    """Async HTTP client wrapping httpx with rate limit + retry."""

    def __init__(
        self,
        user_agent: str = USER_AGENT,
        timeout: float = REQUEST_TIMEOUT,
        retries: int = RETRY_ATTEMPTS,
        rate_limit: float = RATE_LIMIT_SECONDS,
    ):
        self._user_agent = user_agent
        self._timeout = timeout
        self._retries = retries
        self._limiter = RateLimiter(rate_limit)
        self._semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self) -> "BBCClient":
        self._client = httpx.AsyncClient(
            headers={"User-Agent": self._user_agent},
            timeout=self._timeout,
            follow_redirects=True,
            http2=False,
        )
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    async def get_html(self, url: str) -> str:
        """Fetch a page and return its HTML body."""
        response = await self._request("GET", url)
        return response.text

    async def get_bytes(self, url: str) -> bytes:
        """Fetch a binary resource (audio/pdf)."""
        response = await self._request("GET", url)
        return response.content

    async def stream_bytes(self, url: str) -> AsyncIterator[bytes]:
        """Stream a binary resource in chunks (for large MP3s)."""
        await self._limiter.acquire()
        if self._client is None:
            raise BBCClientError("Client not initialized — use 'async with'")

        async with self._semaphore:
            for attempt in range(self._retries):
                try:
                    async with self._client.stream("GET", url) as response:
                        response.raise_for_status()
                        async for chunk in response.aiter_bytes(chunk_size=64 * 1024):
                            yield chunk
                        return
                except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
                    backoff = RETRY_BACKOFF_BASE ** attempt
                    logger.warning(
                        "Stream %s attempt %d/%d failed: %s — retrying in %.1fs",
                        url, attempt + 1, self._retries, exc, backoff,
                    )
                    if attempt + 1 == self._retries:
                        raise BBCClientError(f"Stream failed: {url}") from exc
                    await asyncio.sleep(backoff)
                except httpx.HTTPStatusError as exc:
                    if 500 <= exc.response.status_code < 600 and attempt + 1 < self._retries:
                        backoff = RETRY_BACKOFF_BASE ** attempt
                        logger.warning(
                            "Stream %s got %d — retrying in %.1fs",
                            url, exc.response.status_code, backoff,
                        )
                        await asyncio.sleep(backoff)
                    else:
                        raise BBCClientError(
                            f"Stream HTTP {exc.response.status_code}: {url}"
                        ) from exc

    async def _request(self, method: str, url: str) -> httpx.Response:
        if self._client is None:
            raise BBCClientError("Client not initialized — use 'async with'")
        await self._limiter.acquire()
        async with self._semaphore:
            for attempt in range(self._retries):
                try:
                    response = await self._client.request(method, url)
                    response.raise_for_status()
                    return response
                except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
                    backoff = RETRY_BACKOFF_BASE ** attempt
                    logger.warning(
                        "%s %s attempt %d/%d failed: %s — retrying in %.1fs",
                        method, url, attempt + 1, self._retries, exc, backoff,
                    )
                    if attempt + 1 == self._retries:
                        raise BBCClientError(f"Request failed: {url}") from exc
                    await asyncio.sleep(backoff)
                except httpx.HTTPStatusError as exc:
                    if 500 <= exc.response.status_code < 600 and attempt + 1 < self._retries:
                        backoff = RETRY_BACKOFF_BASE ** attempt
                        logger.warning(
                            "%s %s got %d — retrying in %.1fs",
                            method, url, exc.response.status_code, backoff,
                        )
                        await asyncio.sleep(backoff)
                    else:
                        raise BBCClientError(
                            f"HTTP {exc.response.status_code}: {url}"
                        ) from exc


__all__ = ["BBCClient", "BBCClientError", "RateLimiter"]

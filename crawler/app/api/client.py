"""HTTP client wrapper with retry, rate-limiting, and async support."""
from __future__ import annotations

import asyncio
import logging
import random
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 30.0
DEFAULT_MAX_RETRIES = 3
DEFAULT_RATE_LIMIT = 10
BASE_URL = "https://dailydictation.com"


class RateLimiter:
    """Token bucket rate limiter."""

    def __init__(self, rate: int, period: float = 1.0):
        self.rate = rate
        self.period = period
        self.tokens = rate
        self.last_update = asyncio.get_event_loop().time()

    async def acquire(self):
        while True:
            now = asyncio.get_event_loop().time()
            elapsed = now - self.last_update
            self.tokens = min(self.rate, self.tokens + elapsed * (self.rate / self.period))
            self.last_update = now
            if self.tokens >= 1:
                self.tokens -= 1
                return
            await asyncio.sleep(0.05)


class HTTPClient:
    """Async HTTP client with retry, timeout, and rate limiting."""

    def __init__(
        self,
        base_url: str = BASE_URL,
        max_retries: int = DEFAULT_MAX_RETRIES,
        rate_limit: int = DEFAULT_RATE_LIMIT,
        timeout: float = DEFAULT_TIMEOUT,
        user_agent: str | None = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.max_retries = max_retries
        self.timeout = timeout
        self._client: httpx.AsyncClient | None = None
        self._rate_limiter = RateLimiter(rate=rate_limit)
        self._user_agent = user_agent or (
            "Mozilla/5.0 (compatible; DailyDictationCrawler/1.0; +https://github.com/example)"
        )

    async def __aenter__(self):
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=httpx.Timeout(self.timeout, connect=10.0),
            headers={"User-Agent": self._user_agent},
            follow_redirects=True,
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()
        return False

    async def get(self, path: str, **kwargs: Any) -> httpx.Response:
        await self._rate_limiter.acquire()
        if self._client is None:
            raise RuntimeError("HTTPClient must be used as async context manager")
        path = "/" + path.lstrip("/")
        for attempt in range(self.max_retries):
            try:
                response = await self._client.get(path, **kwargs)
                if response.status_code == 200:
                    return response
                if response.status_code >= 500 and attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
                    continue
                response.raise_for_status()
                return response
            except (httpx.TimeoutException, httpx.ConnectError) as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
                    continue
                logger.error("Failed to fetch %s after %d attempts: %s", path, self.max_retries, e)
                raise
        raise RuntimeError(f"Unreachable: exhausted retries for {path}")

    async def get_json(self, path: str, **kwargs: Any) -> dict[str, Any]:
        response = await self.get(path, **kwargs)
        return response.json()

    async def get_text(self, path: str, **kwargs: Any) -> str:
        response = await self.get(path, **kwargs)
        return response.text

    async def download_bytes(self, url: str) -> bytes:
        if self._client is None:
            raise RuntimeError("HTTPClient must be used as async context manager")
        await self._rate_limiter.acquire()
        for attempt in range(self.max_retries):
            try:
                response = await self._client.get(url)
                response.raise_for_status()
                return response.content
            except (httpx.TimeoutException, httpx.ConnectError) as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
                    continue
                logger.error("Failed to download %s after %d attempts: %s", url, self.max_retries, e)
                raise
        raise RuntimeError(f"Unreachable: exhausted retries for {url}")

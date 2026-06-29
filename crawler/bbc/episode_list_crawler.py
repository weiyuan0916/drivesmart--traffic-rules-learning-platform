"""Episode list discovery.

BBC does not expose a single archive index page. The most reliable discovery
mechanism is the sidebar on any episode page, which lists ~50 recent episodes
under "Latest 6 Minute English". The list mixes two URL formats:

- Old: /english/features/6-minute-english/ep-YYMMDD
- New: /english/features/6-minute-english_YYYY/ep-YYMMDD
"""
from __future__ import annotations

import logging
import re
from typing import List
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from crawler.bbc.bbc_client import BBCClient
from crawler.bbc.config import BBC_BASE, LEARNING_ENGLISH_BASE, SEED_EPISODE_URLS

logger = logging.getLogger(__name__)

# Regex to extract a /ep-YYMMDD slug from any URL path
EPISODE_SLUG_RE = re.compile(r"ep-(\d{6})", re.IGNORECASE)

# Markers in the page that confirm we're looking at the right sidebar
SIDEBAR_MARKERS = (
    "Latest 6 Minute English",
    "6 Minute English",
)


def _normalize_url(href: str) -> str:
    """Resolve a possibly-relative href to a full BBC URL."""
    if not href:
        return ""
    if href.startswith(("http://", "https://")):
        return href
    if href.startswith("/"):
        # BBC's absolute hrefs already include /learningenglish as their first
        # path segment, so prepend the bare domain.
        return BBC_BASE + href
    return urljoin(LEARNING_ENGLISH_BASE, href)


def _is_episode_url(url: str) -> bool:
    """True if URL points to a 6-minute-english episode page."""
    if not url:
        return False
    if "6-minute-english" not in url:
        return False
    if not EPISODE_SLUG_RE.search(url):
        return False
    # Reject search results, topic pages, etc.
    if any(bad in url for bad in ("/search", "/topics/", "/podcasts/")):
        return False
    return True


def _extract_episode_urls_from_html(html: str) -> List[str]:
    """Parse the sidebar and return a list of unique episode URLs."""
    soup = BeautifulSoup(html, "lxml")
    candidates: List[str] = []

    # Strategy: find any element containing the marker text, then look at the
    # ancestor/descendant links. The BBC site wraps the sidebar in a
    # <nav> or <aside> with a heading "Latest 6 Minute English".
    sidebar_containers: list = []

    for marker in SIDEBAR_MARKERS:
        # Find headings/text nodes containing the marker
        for tag in soup.find_all(string=re.compile(re.escape(marker), re.IGNORECASE)):
            parent = tag.parent
            if parent is None:
                continue
            # Walk up to the nearest section/div/aside/nav (the container)
            for ancestor in parent.parents:
                if ancestor.name in ("aside", "nav", "section", "div"):
                    sidebar_containers.append(ancestor)
                    break

    # Deduplicate containers
    sidebar_containers = list({id(c): c for c in sidebar_containers}.values())

    for container in sidebar_containers:
        for a in container.find_all("a", href=True):
            url = _normalize_url(a["href"])
            if _is_episode_url(url):
                candidates.append(url)

    # Fallback: if no sidebar found, scan the entire page
    if not candidates:
        logger.warning("Sidebar not found — falling back to page-wide scan")
        for a in soup.find_all("a", href=True):
            url = _normalize_url(a["href"])
            if _is_episode_url(url):
                candidates.append(url)

    # Deduplicate while preserving order
    seen: set = set()
    unique: List[str] = []
    for url in candidates:
        if url not in seen:
            seen.add(url)
            unique.append(url)
    return unique


async def get_episode_urls(
    client: BBCClient,
    seed_urls: List[str] = None,
    max_episodes: int = 50,
) -> List[str]:
    """Fetch a seed episode page, extract the sidebar list, return URLs.

    Args:
        client: An active BBCClient (use `async with BBCClient() as client`).
        seed_urls: Episode URLs to bootstrap discovery. Defaults to SEED_EPISODE_URLS.
        max_episodes: Cap the returned list to this size (oldest are dropped).

    Returns:
        List of unique episode URLs (most recent first).
    """
    seed_urls = seed_urls or SEED_EPISODE_URLS
    all_urls: List[str] = []

    for seed in seed_urls:
        try:
            logger.info("Fetching seed: %s", seed)
            html = await client.get_html(seed)
            urls = _extract_episode_urls_from_html(html)
            logger.info("  Found %d episode URLs from %s", len(urls), seed)
            all_urls.extend(urls)
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to fetch seed %s: %s", seed, exc)
            continue

    # Deduplicate globally
    seen: set = set()
    unique: List[str] = []
    for url in all_urls:
        if url not in seen:
            seen.add(url)
            unique.append(url)

    logger.info("Total unique episode URLs discovered: %d", len(unique))
    return unique[:max_episodes]


__all__ = ["get_episode_urls", "_extract_episode_urls_from_html"]

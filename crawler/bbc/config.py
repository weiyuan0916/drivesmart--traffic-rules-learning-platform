"""BBC 6-Minute English crawler configuration."""
from __future__ import annotations

import re
from pathlib import Path

# Output paths (relative to project root where the crawler is invoked)
OUTPUT_ROOT: Path = Path("bbc_listening")
MASTER_INDEX: Path = OUTPUT_ROOT / "episodes.json"

# HTTP settings
USER_AGENT: str = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)
RATE_LIMIT_SECONDS: float = 1.5
MAX_CONCURRENCY: int = 2
REQUEST_TIMEOUT: float = 30.0
RETRY_ATTEMPTS: int = 3
RETRY_BACKOFF_BASE: float = 2.0

# BBC base — domain only; all paths are explicitly added.
BBC_BASE: str = "https://www.bbc.co.uk"
LEARNING_ENGLISH_BASE: str = "https://www.bbc.co.uk/learningenglish"
EPISODE_URL_PATTERNS: list[str] = [
    # New year-based format (2024+)
    f"{LEARNING_ENGLISH_BASE}/english/features/6-minute-english_YYYY/ep-YYMMDD",
    # Old format (pre-2024)
    f"{LEARNING_ENGLISH_BASE}/english/features/6-minute-english/ep-YYMMDD",
]

# Seed URLs used to discover the sidebar "Latest 6 Minute English" list.
# The current BBC site uses the year-suffixed path; old format returns 404
# from 2024 onward, so we only seed the working format here.
SEED_EPISODE_URLS: list[str] = [
    f"{LEARNING_ENGLISH_BASE}/english/features/6-minute-english_2025/ep-250508",
]

# Audio split defaults
SPLIT_CHUNK_SECONDS: int = 30

# Filename slugification
_NON_SLUG_RE = re.compile(r"[^a-z0-9]+")
_SLUG_DASH_RE = re.compile(r"-+")


def slugify(value: str, max_length: int = 80) -> str:
    """Convert a string into a filesystem-safe slug.

    Examples:
        >>> slugify("Should animals be kept in zoos?")
        'should-animals-be-kept-in-zoos'
        >>> slugify("Café — résumé")
        'cafe-resume'
    """
    text = (value or "").lower().strip()
    # Normalize common accented characters
    replacements = {
        "á": "a", "à": "a", "â": "a", "ä": "a", "ã": "a", "å": "a",
        "é": "e", "è": "e", "ê": "e", "ë": "e",
        "í": "i", "ì": "i", "î": "i", "ï": "i",
        "ó": "o", "ò": "o", "ô": "o", "ö": "o", "õ": "o", "ø": "o",
        "ú": "u", "ù": "u", "û": "u", "ü": "u",
        "ñ": "n", "ç": "c", "ß": "ss",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = _NON_SLUG_RE.sub("-", text)
    text = _SLUG_DASH_RE.sub("-", text).strip("-")
    return text[:max_length] or "untitled"


__all__ = [
    "OUTPUT_ROOT",
    "MASTER_INDEX",
    "USER_AGENT",
    "RATE_LIMIT_SECONDS",
    "MAX_CONCURRENCY",
    "REQUEST_TIMEOUT",
    "RETRY_ATTEMPTS",
    "RETRY_BACKOFF_BASE",
    "BBC_BASE",
    "LEARNING_ENGLISH_BASE",
    "EPISODE_URL_PATTERNS",
    "SEED_EPISODE_URLS",
    "SPLIT_CHUNK_SECONDS",
    "slugify",
]

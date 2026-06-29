"""Episode page parser.

Parses a single BBC 6-Minute English episode page and extracts:
- title, episode code, source URL
- audio URL (from <audio src> or any .mp3 link)
- PDF transcript URL
- thumbnail URL (og:image)
- vocabulary list (word + brief meaning)
- published date
- level (beginner/intermediate/advanced) — best-effort

Returns a structured EpisodeData dataclass.
"""
from __future__ import annotations

import logging
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

from bs4 import BeautifulSoup, Tag

from crawler.bbc.config import BBC_BASE, LEARNING_ENGLISH_BASE

logger = logging.getLogger(__name__)

# Vocabulary section markers in BBC HTML
VOCAB_HEADING_RE = re.compile(
    r"^\s*(vocabulary|key vocabulary|new words?|words? in the show|today's words?)\s*$",
    re.IGNORECASE,
)

# Published date patterns
DATE_PATTERNS = [
    re.compile(r"\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b", re.IGNORECASE),
    re.compile(r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b", re.IGNORECASE),
    re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b"),
]

MONTH_TO_NUM = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


@dataclass
class EpisodeData:
    """Structured data extracted from a single BBC 6-Minute English episode page."""

    source_url: str
    episode_code: Optional[str] = None
    title: Optional[str] = None
    published_at: Optional[str] = None  # ISO 8601 date
    level: Optional[str] = None
    duration_seconds: Optional[int] = None
    thumbnail_url: Optional[str] = None
    audio_url: Optional[str] = None
    pdf_url: Optional[str] = None
    description: Optional[str] = None
    bbc_programme_id: Optional[str] = None  # e.g. p0mm9kc1
    iframe_url: Optional[str] = None        # https://www.bbc.co.uk/programmes/{pid}/player
    introduction: Optional[str] = None
    question: Optional[Dict[str, Any]] = None  # {prompt, options: [...], answer_listen_for}
    vocabulary: List[Dict[str, Any]] = field(default_factory=list)
    transcript: Optional[str] = None


def _normalize_url(href: str) -> str:
    if not href:
        return ""
    href = href.strip()
    if href.startswith(("http://", "https://")):
        return href
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        # BBC's absolute hrefs already include /learningenglish as their first
        # path segment, so prepend the bare domain.
        return BBC_BASE + href
    return urljoin(LEARNING_ENGLISH_BASE, href)


def _extract_episode_code(url: str) -> Optional[str]:
    """Extract `ep-YYMMDD` from a BBC episode URL."""
    match = re.search(r"ep-(\d{6})", url, re.IGNORECASE)
    return f"ep-{match.group(1)}" if match else None


def _find_first(pattern: re.Pattern, text: str) -> Optional[re.Match]:
    return pattern.search(text or "")


def _parse_published_date(text: str) -> Optional[str]:
    """Try common BBC date formats, return ISO 8601 (YYYY-MM-DD) or None."""
    for pattern in DATE_PATTERNS:
        match = pattern.search(text)
        if not match:
            continue
        try:
            if pattern is DATE_PATTERNS[0]:  # 8 May 2025
                day, mon, year = match.groups()
                month = MONTH_TO_NUM[mon.lower()[:3]]
                return f"{int(year):04d}-{month:02d}-{int(day):02d}"
            elif pattern is DATE_PATTERNS[1]:  # May 8, 2025
                mon, day, year = match.groups()
                month = MONTH_TO_NUM[mon.lower()[:3]]
                return f"{int(year):04d}-{month:02d}-{int(day):02d}"
            elif pattern is DATE_PATTERNS[2]:  # 2025-05-08
                year, mon, day = match.groups()
                return f"{int(year):04d}-{int(mon):02d}-{int(day):02d}"
        except (KeyError, ValueError):
            continue
    return None


def _extract_title(soup: BeautifulSoup) -> Optional[str]:
    """Episode title from og:title, then <title>, then <h1>.

    BBC's <h1> is the site brand ("Learning English"), not the episode
    title. The episode title lives in <title> and og:title with the
    prefix "BBC Learning English - 6 Minute English / ".
    """
    # 1) og:title — most reliable; format: "BBC Learning English - 6 Minute English / <title>"
    og = soup.find("meta", attrs={"property": "og:title"})
    if og and og.get("content"):
        cleaned = _strip_og_title(og["content"])
        if cleaned:
            return cleaned
    # 2) <title> tag
    title = soup.find("title")
    if title and title.string:
        cleaned = _strip_og_title(title.string)
        if cleaned:
            return cleaned
    # 3) <h1> — fallback (rarely the episode title on BBC Learning English)
    h1 = soup.find("h1")
    if h1:
        text = h1.get_text(strip=True)
        if text and text.lower() != "learning english":
            return text
    return None


_OG_TITLE_PREFIXES = (
    "BBC Learning English - 6 Minute English / ",
    "BBC Learning English - ",
    "BBC - ",
)


def _strip_og_title(raw: str) -> Optional[str]:
    """Strip the BBC site prefix from an og:title / <title> string."""
    if not raw:
        return None
    text = raw.strip()
    for prefix in _OG_TITLE_PREFIXES:
        if text.startswith(prefix):
            text = text[len(prefix):]
            break
    text = text.strip()
    return text or None


def _extract_thumbnail(soup: BeautifulSoup) -> Optional[str]:
    og = soup.find("meta", attrs={"property": "og:image"})
    if og and og.get("content"):
        return og["content"].strip()
    return None


def _extract_audio_url(soup: BeautifulSoup) -> Optional[str]:
    """Find the first MP3 link (audio source, embed, or any link to .mp3)."""
    # 1) <audio src="..."> or <audio><source src="..." /></audio>
    for audio in soup.find_all("audio"):
        src = audio.get("src")
        if src:
            url = _normalize_url(src)
            if url.lower().endswith(".mp3"):
                return url
        for source in audio.find_all("source"):
            s = source.get("src")
            if s and s.lower().endswith(".mp3"):
                return _normalize_url(s)
    # 2) Any anchor with .mp3 href
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".mp3"):
            return _normalize_url(href)
    return None


def _extract_pdf_url(soup: BeautifulSoup) -> Optional[str]:
    """Find the first PDF link (download transcript)."""
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".pdf"):
            return _normalize_url(href)
    return None


def _extract_description(soup: BeautifulSoup) -> Optional[str]:
    og = soup.find("meta", attrs={"property": "og:description"})
    if og and og.get("content"):
        return og["content"].strip()
    # Fallback: <meta name="description">
    desc = soup.find("meta", attrs={"name": "description"})
    if desc and desc.get("content"):
        return desc["content"].strip()
    return None


def _extract_level(soup: BeautifulSoup, description: Optional[str]) -> Optional[str]:
    """Best-effort level detection. BBC sometimes labels the level inline."""
    candidates = [soup.get_text(" ", strip=True)[:5000]]
    if description:
        candidates.insert(0, description)
    for text in candidates:
        low = text.lower()
        for level in ("beginner", "intermediate", "advanced"):
            if re.search(rf"\b{level}\b", low):
                return level
    return None


def _is_in_vocabulary_section(tag: Tag, marker_text_lower: str) -> bool:
    """Heuristic: tag is in a vocab section if it follows a vocab heading."""
    if tag is None:
        return False
    parent_text = ""
    for ancestor in tag.parents:
        if ancestor.name in ("aside", "section", "div", "article"):
            # If we hit a "Vocabulary" header inside this container, count us in
            headings = ancestor.find_all(["h2", "h3", "h4", "strong"])
            for h in headings:
                h_text = h.get_text(" ", strip=True).lower()
                if "vocabulary" in h_text and "quiz" not in h_text and "review" not in h_text:
                    return True
        # Stop at body
        if ancestor.name == "body":
            break
    return False


# BBC programme player base — used to build an embeddable iframe URL.
BBC_PROGRAMME_PLAYER = "https://www.bbc.co.uk/programmes/{pid}/player"

# Section header patterns
_SECTION_HEADERS: Dict[str, re.Pattern] = {
    "introduction": re.compile(r"^\s*introduction\s*$", re.IGNORECASE),
    "question": re.compile(
        r"^\s*(this week'?s question|quiz question|question)\s*$", re.IGNORECASE
    ),
    "vocabulary": re.compile(
        r"^\s*(vocabulary|key vocabulary|new words?|words? in the show|today's words?)\s*$",
        re.IGNORECASE,
    ),
    "transcript": re.compile(r"^\s*transcript\s*$", re.IGNORECASE),
    "next": re.compile(r"^\s*next\s*$", re.IGNORECASE),
}


def _find_content_div(soup: BeautifulSoup) -> Tag:
    """Return the lesson-content container.

    BBC renders lesson body in <div class="text">. We pick the largest
    such div to avoid sidebar / footer text divs. If none is found
    (e.g. a stripped-down test fixture), fall back to <body> so the
    section extractors still work.
    """
    candidates = soup.find_all("div", class_="text")
    if candidates:
        return max(candidates, key=lambda d: len(d.get_text(" ", strip=True)))
    return soup.body or soup


def _find_section_heading(
    text_div: Tag, name: str
) -> Optional[Tag]:
    """Locate the heading <h2>/<h3>/<h4> for a given section inside text_div."""
    pattern = _SECTION_HEADERS[name]
    for h in text_div.find_all(["h2", "h3", "h4"]):
        if pattern.match(h.get_text(" ", strip=True)):
            return h
    return None


def _section_text_after(heading: Tag) -> str:
    """Return concatenated <p> text that follows a section heading, stopping
    at the next same-or-higher-level heading."""
    parts: list = []
    sibling = heading.find_next_sibling()
    while sibling is not None:
        if isinstance(sibling, Tag) and sibling.name in ("h2", "h3", "h4"):
            break
        if isinstance(sibling, Tag) and sibling.name == "p":
            txt = sibling.get_text(" ", strip=True)
            # Skip placeholder underlines
            if txt and not set(txt) <= {"_", " "}:
                parts.append(txt)
        sibling = sibling.find_next_sibling()
    return "\n\n".join(parts).strip()


# Markers that end the vocabulary / introduction / question sections.
# BBC uses <h3> for some markers and a bare <p>TRANSCRIPT</p> for others,
# so we also detect standalone <p> blocks whose stripped text equals a
# known end marker.
_SECTION_END_TEXT = frozenset({"transcript", "next"})


def _is_section_end(p: Tag) -> bool:
    """True if a <p> block is a standalone section marker (TRANSCRIPT, Next)."""
    if p.name not in ("p", "h2", "h3", "h4"):
        return False
    txt = p.get_text(" ", strip=True).lower()
    return txt in _SECTION_END_TEXT


def _section_block_after(heading: Tag) -> List[Tag]:
    """Return all sibling <p> elements until the next section marker."""
    blocks: list = []
    sibling = heading.find_next_sibling()
    while sibling is not None:
        if isinstance(sibling, Tag):
            if sibling.name in ("h2", "h3", "h4"):
                break
            if sibling.name == "p" and _is_section_end(sibling):
                break
            if sibling.name == "p":
                blocks.append(sibling)
        sibling = sibling.find_next_sibling()
    return blocks


def _extract_bbc_programme_id(soup: BeautifulSoup) -> Optional[str]:
    """Extract the BBC programme id (data-pid) from <div class="video" data-pid="...">."""
    video_div = soup.find("div", class_="video")
    if video_div and video_div.get("data-pid"):
        return video_div["data-pid"].strip()
    return None


def _build_iframe_url(programme_id: Optional[str]) -> Optional[str]:
    if not programme_id:
        return None
    return BBC_PROGRAMME_PLAYER.format(pid=programme_id)


def _extract_introduction(text_div: Tag) -> Optional[str]:
    heading = _find_section_heading(text_div, "introduction")
    if heading is None:
        return None
    text = _section_text_after(heading)
    return text or None


_QUESTION_OPTION_SPLIT_RE = re.compile(
    r"(?=[a-c]\s*\))", re.IGNORECASE
)
_QUESTION_OPTION_LETTER_RE = re.compile(r"^\s*([a-c])\s*\)\s*(.+)$", re.IGNORECASE)


def _extract_question(text_div: Tag) -> Optional[Dict[str, Any]]:
    heading = _find_section_heading(text_div, "question")
    if heading is None:
        return None
    blocks = _section_block_after(heading)
    prompt_parts: list = []
    options: List[Dict[str, Any]] = []
    listen_for: Optional[str] = None
    for p in blocks:
        txt = p.get_text(" ", strip=True)
        if not txt or set(txt) <= {"_", " "}:
            continue

        # Try to extract options from this paragraph. BBC sometimes puts
        # all three options on one line: "a) x b) y c) z"; other times
        # one per paragraph. We handle both.
        extracted = _extract_options_from_text(txt)
        if extracted:
            options.extend(extracted)
            continue

        if "listen to the programme" in txt.lower() or "find out" in txt.lower():
            listen_for = txt
            continue
        prompt_parts.append(txt)

    if not prompt_parts and not options:
        return None
    return {
        "prompt": "\n\n".join(prompt_parts).strip() or None,
        "options": options,
        "answer_listen_for": listen_for,
    }


def _extract_options_from_text(text: str) -> List[Dict[str, Any]]:
    """Parse `a) ... b) ... c) ...` (inline) or single-line options.

    Splits the text on `letter)` boundaries, then parses each chunk.
    """
    parts = _QUESTION_OPTION_SPLIT_RE.split(text)
    options: List[Dict[str, Any]] = []
    for raw in parts:
        chunk = raw.strip()
        if not chunk:
            continue
        m = _QUESTION_OPTION_LETTER_RE.match(chunk)
        if m:
            options.append({
                "letter": m.group(1).lower(),
                "text": m.group(2).strip(),
            })
    return options


def _extract_vocabulary_from_text_div(text_div: Tag) -> List[Dict[str, Any]]:
    """Extract vocabulary from BBC's <h3>Vocabulary</h3> section.

    BBC structure (verified 2025-12):
      <h3>Vocabulary</h3>
      <p><strong>word</strong> meaning</p>
      <p><strong>word2</strong> meaning2</p>
      ...
      <p>TRANSCRIPT</p>      ← sometimes a bare <p>
      <h3>TRANSCRIPT</h3>    ← sometimes a heading

    Word is the <strong> content; meaning is the inline text after the
    strong in the same <p>. Section ends at any <h2>/<h3>/<h4> or at
    a bare <p> whose text is exactly "TRANSCRIPT" / "Next".
    """
    heading = _find_section_heading(text_div, "vocabulary")
    if heading is None:
        return []

    entries: List[Dict[str, Any]] = []
    seen: set = set()
    sibling = heading.find_next_sibling()
    while sibling is not None:
        if isinstance(sibling, Tag):
            if sibling.name in ("h2", "h3", "h4"):
                break
            if sibling.name == "p" and _is_section_end(sibling):
                break
            if sibling.name == "p":
                strong = sibling.find("strong")
                if strong is None:
                    sibling = sibling.find_next_sibling()
                    continue
                word_text = strong.get_text(" ", strip=True)
                if not word_text:
                    sibling = sibling.find_next_sibling()
                    continue
                if len(word_text) > 80:
                    sibling = sibling.find_next_sibling()
                    continue
                if word_text.lower().startswith(("http", "www", "try ", "learn more", "watch ")):
                    sibling = sibling.find_next_sibling()
                    continue
                if word_text in ("Beth", "Neil", "Sam", "Rob", "Finn", "Alice", "Phil"):
                    sibling = sibling.find_next_sibling()
                    continue
                if word_text.lower() in seen:
                    sibling = sibling.find_next_sibling()
                    continue
                full = sibling.get_text(" ", strip=True)
                if full.startswith(word_text):
                    meaning = full[len(word_text):].lstrip(" :—-").strip()
                else:
                    meaning = ""
                seen.add(word_text.lower())
                entries.append({
                    "word": word_text,
                    "meaning": meaning[:500] if meaning else "(see transcript)",
                    "position": len(entries),
                })
        sibling = sibling.find_next_sibling()
    return entries


def _extract_transcript(text_div: Tag) -> Optional[str]:
    """Extract transcript text following the TRANSCRIPT marker.

    BBC sometimes uses <h3>TRANSCRIPT</h3> as the marker, sometimes
    a bare <p>TRANSCRIPT</p>. We accept either and collect all <p>
    content until the next section marker.
    """
    heading = _find_section_heading(text_div, "transcript")
    if heading is None:
        # Fallback: look for a bare <p>TRANSCRIPT</p>
        for p in text_div.find_all("p"):
            if p.get_text(" ", strip=True).lower() == "transcript":
                heading = p
                break
    if heading is None:
        return None

    # If the marker is a <p>, skip a sibling <p>Note: This is not ...</p> if any
    blocks: list = []
    sibling = heading.find_next_sibling()
    skip_next = isinstance(heading, Tag) and heading.name == "p"
    while sibling is not None:
        if isinstance(sibling, Tag):
            if sibling.name in ("h2", "h3", "h4"):
                break
            if sibling.name == "p" and _is_section_end(sibling):
                break
            if sibling.name == "p":
                if skip_next:
                    skip_next = False
                else:
                    blocks.append(sibling)
        sibling = sibling.find_next_sibling()
    parts: list = []
    for p in blocks:
        txt = p.get_text("\n", strip=True)
        if txt and not set(txt) <= {"_", " "}:
            parts.append(txt)
    return "\n\n".join(parts).strip() or None


def _extract_published_date(soup: BeautifulSoup) -> Optional[str]:
    """Look for a date in metadata or visible text."""
    # 1) <time datetime="...">
    time_tag = soup.find("time", attrs={"datetime": True})
    if time_tag and time_tag.get("datetime"):
        return _parse_published_date(time_tag["datetime"])
    # 2) <meta property="article:published_time">
    meta = soup.find("meta", attrs={"property": "article:published_time"})
    if meta and meta.get("content"):
        iso = _parse_published_date(meta["content"])
        if iso:
            return iso
    # 3) Scan visible text
    text = soup.get_text(" ", strip=True)
    return _parse_published_date(text)


def parse_episode_page(url: str, html: str) -> EpisodeData:
    """Parse a BBC 6-Minute English episode page.

    Args:
        url: The canonical episode URL (used to extract episode code).
        html: Raw HTML body.

    Returns:
        EpisodeData with all extractable fields populated.
    """
    soup = BeautifulSoup(html or "", "lxml")

    episode_code = _extract_episode_code(url)
    title = _extract_title(soup)
    thumbnail_url = _extract_thumbnail(soup)
    audio_url = _extract_audio_url(soup)
    pdf_url = _extract_pdf_url(soup)
    description = _extract_description(soup)
    published_at = _extract_published_date(soup)
    level = _extract_level(soup, description)
    bbc_programme_id = _extract_bbc_programme_id(soup)
    iframe_url = _build_iframe_url(bbc_programme_id)

    text_div = _find_content_div(soup)
    introduction = _extract_introduction(text_div)
    question = _extract_question(text_div)
    vocabulary = _extract_vocabulary_from_text_div(text_div)
    transcript = _extract_transcript(text_div)

    return EpisodeData(
        source_url=url,
        episode_code=episode_code,
        title=title,
        published_at=published_at,
        level=level,
        thumbnail_url=thumbnail_url,
        audio_url=audio_url,
        pdf_url=pdf_url,
        description=description,
        bbc_programme_id=bbc_programme_id,
        iframe_url=iframe_url,
        introduction=introduction,
        question=question,
        vocabulary=vocabulary,
        transcript=transcript,
    )


def episode_data_to_dict(data: EpisodeData) -> Dict[str, Any]:
    """Convert EpisodeData to a JSON-serializable dict (drop None values)."""
    d = asdict(data)
    return {k: v for k, v in d.items() if v is not None and v != "" and v != []}


__all__ = [
    "EpisodeData",
    "episode_data_to_dict",
    "parse_episode_page",
]

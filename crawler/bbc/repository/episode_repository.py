"""Repository layer — single home for all PostgreSQL writes & reads.

Every public function is a discrete unit of work on top of an active
SQLAlchemy Session.  Callers (the orchestrator in main.py) manage the
transaction lifetime explicitly via `session_scope()`.

Naming convention:
- `upsert_*`  → create-or-update by natural key
- `replace_*` → delete-then-insert (used for child collections so we
                stay aligned with the source-of-truth page even if the
                upstream data shape changes)
- `get_*`     → read-only fetchers
- `count_*`   → aggregate counters (used by --stats)
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from crawler.bbc.config import slugify
from crawler.bbc.db.models import (
    BbcAsset,
    BbcCrawlRun,
    BbcEpisode,
    BbcLevel,
    BbcQuestion,
    BbcQuizOption,
    BbcSource,
    BbcTranscriptSegment,
    BbcVocabulary)
from crawler.bbc.episode_parser import EpisodeData

logger = logging.getLogger(__name__)

DEFAULT_SOURCE_CODE = "bbc-learning-english"

# Map raw BBC string to our level code (case-insensitive match in repository)
_LEVEL_ALIASES = {
    "beginner": "beginner",
    "elementary": "beginner",
    "a1": "beginner",
    "a2": "beginner",
    "intermediate": "intermediate",
    "b1": "intermediate",
    "b2": "intermediate",
    "upper-intermediate": "intermediate",
    "advanced": "advanced",
    "c1": "advanced",
    "c2": "advanced",
}


# ---------------------------------------------------------------------
# Source / Level
# ---------------------------------------------------------------------

def upsert_source(
    session: Session,
    *,
    code: str,
    name: str,
    base_url: str,
    description: Optional[str] = None,
) -> BbcSource:
    """Create a source row if missing; return the row either way."""
    stmt = pg_insert(BbcSource).values(
        code=code, name=name, base_url=base_url, description=description
    ).on_conflict_do_update(
        index_elements=[BbcSource.code],
        set_={
            "name": name,
            "base_url": base_url,
            "description": description,
            "updated_at": func.now(),
        },
    )
    session.execute(stmt)
    return session.execute(
        select(BbcSource).where(BbcSource.code == code)
    ).scalar_one()


def get_source_by_code(session: Session, code: str) -> Optional[BbcSource]:
    return session.execute(
        select(BbcSource).where(BbcSource.code == code)
    ).scalar_one_or_none()


def get_or_create_default_source(session: Session) -> BbcSource:
    """Convenience for the CLI — single source for now."""
    existing = get_source_by_code(session, DEFAULT_SOURCE_CODE)
    if existing:
        return existing
    return upsert_source(
        session,
        code=DEFAULT_SOURCE_CODE,
        name="BBC Learning English - 6 Minute English",
        base_url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
        description=(
            "BBC's weekly 6-minute English listening series. "
            "Metadata + audio + transcripts stored locally for personal study use."
        ),
    )


# ---------------------------------------------------------------------
# Episode — the heart of the dedup logic
# ---------------------------------------------------------------------

def _parse_published(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except (ValueError, TypeError):
        return None


def _normalize_level(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    return _LEVEL_ALIASES.get(raw.strip().lower())


def get_episode_by_source_url(
    session: Session, source_id: int, source_url: str
) -> Optional[BbcEpisode]:
    return session.execute(
        select(BbcEpisode).where(
            BbcEpisode.source_id == source_id,
            BbcEpisode.source_url == source_url,
        )
    ).scalar_one_or_none()


def upsert_episode_from_episode_data(
    session: Session,
    *,
    source_id: int,
    data: EpisodeData,
    crawl_run_id: Optional[int] = None,
) -> Tuple[BbcEpisode, bool]:
    """Upsert one episode by its (source_id, source_url) natural key.

    Returns:
        (episode, created) where `created` is True if a new row was
        inserted, False if an existing row was updated in place.

    The implementation strategy is "fetch then conditional insert" so
    we keep the public Python API simple (no PG-specific ON CONFLICT
    branches leaking out of this module).  Inside a single transaction
    the row lock from SELECT … FOR UPDATE is not required because the
    crawler is single-process by design.
    """
    if not data.title or not data.source_url:
        raise ValueError("EpisodeData must have title and source_url")

    title = data.title.strip()
    episode_code = (data.episode_code or "").strip() or slugify(title)[:32]
    slug = slugify(title)

    existing = get_episode_by_source_url(session, source_id, data.source_url)
    created = existing is None

    if existing is None:
        existing = BbcEpisode(
            source_id=source_id,
            episode_code=episode_code,
            title=title,
            slug=slug,
            source_url=data.source_url,
        )
        session.add(existing)
        session.flush()
    else:
        # Always refresh mutable fields; first_crawled_at untouched.
        existing.title = title
        existing.episode_code = episode_code
        existing.slug = slug

    existing.published_at = _parse_published(data.published_at)
    existing.level_code = _normalize_level(data.level)
    existing.duration_seconds = data.duration_seconds
    existing.thumbnail_url = data.thumbnail_url
    existing.audio_url = data.audio_url
    existing.pdf_url = data.pdf_url
    existing.iframe_url = data.iframe_url
    existing.bbc_programme_id = data.bbc_programme_id
    existing.description = data.description
    existing.introduction = data.introduction
    existing.transcript = data.transcript
    existing.vocabulary_count = len(data.vocabulary or [])
    existing.raw_metadata = json.loads(json.dumps(data.__dict__, default=str))
    if crawl_run_id is not None:
        existing.last_crawl_run_id = crawl_run_id

    return existing, created


# ---------------------------------------------------------------------
# Child collections
# ---------------------------------------------------------------------

def replace_vocabulary(
    session: Session,
    *,
    episode_id: int,
    entries: Sequence[Dict[str, Any]],
) -> int:
    """Replace the vocabulary list for an episode.  Returns the new count.

    Strategy: delete all then re-insert.  Vocabulary is small
    (typically 5-10 words/episode) so the cost is negligible and we
    get clean semantics if BBC re-shuffles order or removes words.
    """
    session.execute(
        delete(BbcVocabulary).where(BbcVocabulary.episode_id == episode_id)
    )
    for i, entry in enumerate(entries):
        word = (entry.get("word") or "").strip()
        if not word:
            continue
        session.add(
            BbcVocabulary(
                episode_id=episode_id,
                position=entry.get("position", i),
                word=word[:255],
                meaning=(entry.get("meaning") or "").strip() or None,
            )
        )
    return len(entries)


def replace_question(
    session: Session,
    *,
    episode_id: int,
    question: Optional[Dict[str, Any]],
) -> Optional[int]:
    """Replace the single quiz question for an episode.  Returns the
    new question id, or None if there is no question."""
    session.execute(
        delete(BbcQuestion).where(BbcQuestion.episode_id == episode_id)
    )
    if not question:
        return None
    prompt = (question.get("prompt") or "").strip() or "(no prompt)"
    q = BbcQuestion(
        episode_id=episode_id,
        prompt=prompt,
        answer_listen_for=(question.get("answer_listen_for") or "").strip() or None,
    )
    session.add(q)
    session.flush()
    for i, opt in enumerate(question.get("options") or []):
        letter = (opt.get("letter") or "").strip().lower()[:1]
        text = (opt.get("text") or "").strip()
        if not letter or not text or letter not in {"a", "b", "c"}:
            continue
        session.add(
            BbcQuizOption(
                question_id=q.id,
                letter=letter,
                text=text,
                position=i,
            )
        )
    return q.id


_SPEAKER_LINE_RE = re.compile(r"^([A-Z][A-Za-z .'\-]{0,63})\s*\n(.*)$", re.DOTALL)

# Heuristic: a "speaker label" is a short line (≤ 25 chars) that
# - contains NO space, OR
# - is a known multi-word BBC host name (e.g. "Dr Karan Rajan")
# and does not end with sentence punctuation.
# Single-word speaker labels in the BBC 6-Minute English series
# (2020+).  BBC rotates among a small set of hosts, so we can
# enumerate them and reject everything else as sentence content.
# When a new host is introduced, add them here.
_KNOWN_SINGLEWORD_SPEAKERS = frozenset({
    "Neil", "Georgie", "Sam", "Rob", "Finn", "Alice", "Phil", "Beth",
    "Dan", "Catherine", "Chris", "Clare", "Oliver", "Sian", "Tom",
    "Jack", "Sophie", "Niall", "Eve", "Adam", "Liam", "Maddy",
    "Cushla", "Sarah", "Mark", "Sarah", "Rebecca",
})

# Multi-word names are rare in BBC 6-Minute English; when they appear
# the name is rendered with title case so we match exactly.
_KNOWN_MULTIWORD_SPEAKERS = {
    "Dr Karan Rajan",
    "Ruth Alexander",
    "Scott Dicker",
    "Beth and Simon",
    "Phil and Sophie",
    "Neil and Georgie",
}


def _looks_like_speaker_label(text: str) -> bool:
    """Return True if `text` looks like a BBC transcript speaker label.

    Two flavours are accepted:

    - **Single-word**: text is in the curated list of BBC host names
      (e.g. "Neil", "Georgie", "Sam").  Generic words like "Reply"
      or "Hello" are rejected — they look like single-word sentences.
    - **Multi-word (whitelist only)**: known hosts like "Dr Karan Rajan",
      "Ruth Alexander".  Anything else multi-word is treated as content.
    """
    if not text or text != text.strip():
        return False
    if len(text) > 30:
        return False
    if text.endswith((".", "?", "!", ":", ",")):
        return False
    if " " not in text:
        return text in _KNOWN_SINGLEWORD_SPEAKERS
    return text in _KNOWN_MULTIWORD_SPEAKERS


def _split_transcript_into_segments(transcript: Optional[str]) -> List[Dict[str, Any]]:
    """Best-effort split of the transcript blob into speaker turns.

    The BBC transcript is rendered as alternating lines that look like::

        Neil
        Hello, this is 6 Minute English …

        Georgie
        And I'm Georgie. …

    Some lines wrap across multiple newlines (one speaker, several
    paragraphs).  We pair each "Name\\n…" block as a single segment.
    Returns [{"position": 0, "speaker": "Neil", "text": "..."}, ...].
    """
    if not transcript:
        return []
    lines = transcript.splitlines()
    segments: List[Dict[str, Any]] = []
    current_speaker: Optional[str] = None
    current_buf: List[str] = []

    def flush() -> None:
        nonlocal current_speaker, current_buf
        if current_speaker is not None and current_buf:
            text = "\n".join(current_buf).strip()
            if text:
                segments.append({
                    "position": len(segments),
                    "speaker": current_speaker,
                    "text": text,
                })
        current_speaker = None
        current_buf = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if _looks_like_speaker_label(stripped):
            flush()
            current_speaker = stripped
        else:
            current_buf.append(stripped)
    flush()
    return segments


def replace_transcript_segments(
    session: Session,
    *,
    episode_id: int,
    transcript: Optional[str],
) -> int:
    """Split transcript into speaker turns and persist. Returns #segments."""
    session.execute(
        delete(BbcTranscriptSegment).where(BbcTranscriptSegment.episode_id == episode_id)
    )
    segments = _split_transcript_into_segments(transcript)
    for s in segments:
        session.add(
            BbcTranscriptSegment(
                episode_id=episode_id,
                position=s["position"],
                speaker=s["speaker"],
                text=s["text"],
            )
        )
    return len(segments)


# ---------------------------------------------------------------------
# Assets
# ---------------------------------------------------------------------

def upsert_asset(
    session: Session,
    *,
    episode_id: int,
    asset_kind: str,
    storage_backend: str = "local",
    storage_path: Optional[str] = None,
    remote_url: Optional[str] = None,
    byte_size: Optional[int] = None,
    mime_type: Optional[str] = None,
    checksum_sha256: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> BbcAsset:
    """Upsert a single asset row keyed by (episode_id, kind, storage_path).

    A None storage_path is normalized to '' so the unique constraint
    can still match between re-runs.
    """
    storage_path = storage_path or ""
    # `pg_insert` is PostgreSQL-only; we use the dialect-specific
    # `insert()` so we can express the ON CONFLICT clause cleanly.
    stmt = pg_insert(BbcAsset).values(
        episode_id=episode_id,
        asset_kind=asset_kind,
        storage_backend=storage_backend,
        storage_path=storage_path or None,
        remote_url=remote_url,
        byte_size=byte_size,
        mime_type=mime_type,
        checksum_sha256=checksum_sha256,
        downloaded_at=func.now() if remote_url else None,
        meta=metadata or {},
    ).on_conflict_do_update(
        index_elements=[BbcAsset.episode_id, BbcAsset.asset_kind, BbcAsset.storage_path],
        set_={
            "remote_url": remote_url,
            "byte_size": byte_size,
            "mime_type": mime_type,
            "checksum_sha256": checksum_sha256,
            "downloaded_at": func.now(),
            "metadata": metadata or {},
        },
    )
    session.execute(stmt)
    return session.execute(
        select(BbcAsset).where(
            BbcAsset.episode_id == episode_id,
            BbcAsset.asset_kind == asset_kind,
            BbcAsset.storage_path == (storage_path or None),
        )
    ).scalar_one()


# ---------------------------------------------------------------------
# Crawl runs (operational telemetry)
# ---------------------------------------------------------------------

def start_crawl_run(
    session: Session,
    *,
    source_id: int,
    cli_args: Optional[Dict[str, Any]] = None,
) -> BbcCrawlRun:
    run = BbcCrawlRun(
        source_id=source_id,
        status="running",
        cli_args=cli_args or {},
    )
    session.add(run)
    session.flush()
    return run


def finish_crawl_run(
    session: Session,
    *,
    run_id: int,
    status: str,
    episodes_seen: int,
    episodes_inserted: int,
    episodes_updated: int,
    episodes_skipped: int,
    assets_downloaded: int,
    error_message: Optional[str] = None,
) -> BbcCrawlRun:
    run = session.get(BbcCrawlRun, run_id)
    if not run:
        raise ValueError(f"crawl run {run_id} not found")
    run.status = status
    run.finished_at = datetime.utcnow()
    run.episodes_seen = episodes_seen
    run.episodes_inserted = episodes_inserted
    run.episodes_updated = episodes_updated
    run.episodes_skipped = episodes_skipped
    run.assets_downloaded = assets_downloaded
    run.error_message = error_message
    return run


# ---------------------------------------------------------------------
# Stats / listings
# ---------------------------------------------------------------------

def get_stats(session: Session) -> Dict[str, Any]:
    """Return a snapshot of the BBC tables for the CLI --stats view."""
    total = session.scalar(select(func.count(BbcEpisode.id))) or 0
    with_audio = session.scalar(
        select(func.count(BbcEpisode.id)).where(BbcEpisode.audio_url.is_not(None))
    ) or 0
    with_transcript = session.scalar(
        select(func.count(BbcEpisode.id)).where(BbcEpisode.transcript.is_not(None))
    ) or 0
    vocab_total = session.scalar(select(func.count(BbcVocabulary.id))) or 0
    last_run = session.execute(
        select(BbcCrawlRun).order_by(BbcCrawlRun.id.desc()).limit(1)
    ).scalar_one_or_none()
    return {
        "total_episodes": total,
        "with_audio_url": with_audio,
        "with_transcript": with_transcript,
        "vocab_total": vocab_total,
        "last_run": {
            "id": last_run.id,
            "started_at": last_run.started_at.isoformat() if last_run and last_run.started_at else None,
            "status": last_run.status if last_run else None,
            "inserted": last_run.episodes_inserted if last_run else 0,
            "updated": last_run.episodes_updated if last_run else 0,
        } if last_run else None,
    }


def list_episodes(
    session: Session, limit: int = 50, offset: int = 0
) -> List[BbcEpisode]:
    return list(
        session.execute(
            select(BbcEpisode)
            .order_by(BbcEpisode.published_at.desc().nulls_last(), BbcEpisode.id.desc())
            .limit(limit)
            .offset(offset)
        ).scalars()
    )


__all__ = [
    "DEFAULT_SOURCE_CODE",
    "upsert_source",
    "get_source_by_code",
    "get_or_create_default_source",
    "get_episode_by_source_url",
    "upsert_episode_from_episode_data",
    "replace_vocabulary",
    "replace_question",
    "replace_transcript_segments",
    "upsert_asset",
    "start_crawl_run",
    "finish_crawl_run",
    "get_stats",
    "list_episodes",
]

"""FastAPI server for BBC 6-Minute English episodes — serves the frontend.

Usage::

    # Development
    BBC_DB_NAME=bbc BBC_DB_PASSWORD=postgres python -m crawler.bbc.api_server

    # Production
    BBC_DB_HOST=... BBC_DB_PORT=5432 BBC_DB_NAME=bbc BBC_DB_PASSWORD=... \
      uvicorn crawler.bbc.api_server:app --host 0.0.0.0 --port 3003

Environment variables (all optional, sensible local defaults):

    BBC_API_HOST      default: 127.0.0.1
    BBC_API_PORT      default: 3003
    BBC_DB_HOST       default: 127.0.0.1
    BBC_DB_PORT       default: 5432
    BBC_DB_NAME       default: bbc
    BBC_DB_USER       default: postgres
    BBC_DB_PASSWORD   default: postgres
    BBC_DB_SCHEMA     default: public
    BBC_DB_ECHO       default: 0  (set 1 to log SQL)

Endpoints
---------
GET /                          Health check
GET /api/v1/bbc                List episodes (paginated, filterable)
GET /api/v1/bbc/{slug}         Episode detail
GET /api/v1/bbc/{slug}/audio  Redirect to audio file
GET /api/v1/bbc/{slug}/transcript  Get transcript text
GET /api/v1/bbc/stats          Aggregate stats
"""
from __future__ import annotations

import logging
import os
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from crawler.bbc.db import BbcEpisode, BbcLevel, BbcSource
from crawler.bbc.db.session import get_engine, session_scope, verify_connection
from crawler.bbc.repository import get_stats, list_episodes

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="BBC 6-Minute English API",
    description="BBC Learning English episode metadata, audio, and transcripts.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_PROJECT_ROOT = Path(__file__).parent.parent.parent
_AUDIO_ROOT = _PROJECT_ROOT / "bbc_listening"


def _clips_dir(slug: str) -> Path:
    """Return the folder containing segments.json for a given episode slug."""
    clips_dir = _AUDIO_ROOT / slug / "audio" / "clips"
    if clips_dir.exists():
        return clips_dir
    return _AUDIO_ROOT / slug / "clips"


def _local_audio_path(slug: str) -> Optional[Path]:
    """Return the local audio file path for an episode, or None if missing.

    Looks at the conventional layout first, then any other MP3 in the
    episode's `audio/` folder (covers lessons that were downloaded under
    slightly different names like `<slug>.mp3`).
    """
    audio_dir = _AUDIO_ROOT / slug / "audio"
    if not audio_dir.exists():
        return None
    candidate = audio_dir / f"{slug}.mp3"
    if candidate.exists():
        return candidate
    # Fall back to the first .mp3 we find
    for mp3 in sorted(audio_dir.glob("*.mp3")):
        return mp3
    return None


def _local_transcript_segments(slug: str) -> list[dict[str, Any]]:
    """Build transcript_segments from local files when the DB is empty.

    Priority:
      1. `clips/segments.json`  — best source (already has start/end times + text)
      2. `timings.json`         — whisperx timings (has start/end/speaker/text)
      3. `transcript.txt`       — raw transcript (no timings, no speakers)
    """
    import json as _json

    # 1. clips/segments.json — already has {id, start, end, text, file}
    segments_path = _clips_dir(slug) / "segments.json"
    if segments_path.exists():
        try:
            data = _json.loads(segments_path.read_text(encoding="utf-8"))
            if isinstance(data, list) and data:
                return [
                    {
                        "id": seg.get("id", idx),
                        "position": idx,
                        "speaker": None,
                        "text": seg.get("text", ""),
                    }
                    for idx, seg in enumerate(data)
                    if seg.get("text")
                ]
        except Exception:
            pass

    # 2. timings.json
    timings_path = _AUDIO_ROOT / slug / "timings.json"
    if timings_path.exists():
        try:
            data = _json.loads(timings_path.read_text(encoding="utf-8"))
            segs = data.get("segments", []) if isinstance(data, dict) else []
            if segs:
                return [
                    {
                        "id": seg.get("id", idx),
                        "position": seg.get("position", idx),
                        "speaker": seg.get("speaker"),
                        "text": seg.get("text", ""),
                    }
                    for idx, seg in enumerate(segs)
                    if seg.get("text")
                ]
        except Exception:
            pass

    # 3. transcript.txt — split on double newline into paragraphs
    transcript_path = _AUDIO_ROOT / slug / "transcript.txt"
    if transcript_path.exists():
        try:
            text = transcript_path.read_text(encoding="utf-8").strip()
            if text:
                paras = [p.strip() for p in text.split("\n\n") if p.strip()]
                # Many BBC transcripts follow "Beth:\n\nparagraph\n\nNeil:\n\nparagraph"
                # strip the speaker prefix lines so we end up with one seg per paragraph
                cleaned: list[str] = []
                for p in paras:
                    lines = [ln.strip() for ln in p.splitlines() if ln.strip()]
                    if lines and ":" in lines[0] and len(lines[0]) < 30:
                        # first line is a speaker tag, drop it
                        body = " ".join(lines[1:]).strip()
                    else:
                        body = " ".join(lines).strip()
                    if body:
                        cleaned.append(body)
                if not cleaned:
                    cleaned = [text]
                return [
                    {
                        "id": idx,
                        "position": idx,
                        "speaker": None,
                        "text": seg,
                    }
                    for idx, seg in enumerate(cleaned)
                ]
        except Exception:
            pass

    return []


def _local_vocabulary(slug: str) -> list[dict[str, Any]]:
    """Build the vocabulary array from local files when the DB is empty.

    Priority:
      1. `metadata.json` — best source (already has structured
         `[{word, meaning}, ...]` array).
      2. `content.md`    — Markdown table under "## Vocabulary" section.

    The vocab rows in `bbc_vocabulary` are not always populated (some
    lessons were crawled before the vocab extractor was added), but the
    data exists locally.  This fallback keeps the lesson page usable.
    """
    import json as _json

    # 1. metadata.json
    metadata_path = _AUDIO_ROOT / slug / "metadata.json"
    if metadata_path.exists():
        try:
            data = _json.loads(metadata_path.read_text(encoding="utf-8"))
            vocab = data.get("vocabulary", []) if isinstance(data, dict) else []
            if isinstance(vocab, list) and vocab:
                result: list[dict[str, Any]] = []
                for idx, v in enumerate(vocab):
                    if not isinstance(v, dict):
                        continue
                    word = v.get("word")
                    if not word:
                        continue
                    result.append(
                        {
                            "id": idx,
                            "position": idx,
                            "word": word,
                            "meaning": v.get("meaning"),
                        }
                    )
                if result:
                    return result
        except Exception:
            pass

    # 2. content.md — parse the "## Vocabulary" table
    content_path = _AUDIO_ROOT / slug / "content.md"
    if content_path.exists():
        try:
            text = content_path.read_text(encoding="utf-8")
            # Find the Vocabulary section
            lower = text.lower()
            start = lower.find("## vocabulary")
            if start == -1:
                return []
            # Slice from there to the next "## " heading
            after = text[start:]
            next_heading = after.find("\n## ", 2)
            section = after if next_heading == -1 else after[:next_heading]
            # Parse Markdown table rows
            rows = [
                ln.strip()
                for ln in section.splitlines()
                if ln.strip().startswith("|")
                and not ln.strip().startswith("|---")
                and not ln.strip().startswith("| #")
                and not ln.strip().startswith("|Word")
                and not ln.strip().startswith("| ---")
            ]
            result: list[dict[str, Any]] = []
            for idx, row in enumerate(rows):
                # Split on "|" and clean up cells
                cells = [c.strip() for c in row.split("|") if c.strip()]
                if len(cells) < 2:
                    continue
                # Cells: [#] [Word] [Meaning]  (or just [Word] [Meaning])
                if len(cells) >= 3 and cells[0].isdigit():
                    word = cells[1]
                    meaning = cells[2]
                else:
                    word = cells[0]
                    meaning = cells[1]
                if word:
                    result.append(
                        {
                            "id": idx,
                            "position": idx,
                            "word": word,
                            "meaning": meaning or None,
                        }
                    )
            return result
        except Exception:
            pass

    return []


def _format_episode(ep: BbcEpisode) -> dict[str, Any]:
    return {
        "id": ep.id,
        "source_id": ep.source_id,
        "title": ep.title,
        "slug": ep.slug,
        "source_url": ep.source_url,
        "thumbnail_url": ep.thumbnail_url,
        "level": ep.level_code,
        "duration_seconds": ep.duration_seconds,
        "published_at": str(ep.published_at) if ep.published_at else None,
        "description": ep.description,
        "introduction": ep.introduction,
        "vocabulary_count": ep.vocabulary_count,
        "first_crawled_at": ep.first_crawled_at.isoformat() if ep.first_crawled_at else None,
        "last_crawled_at": ep.last_crawled_at.isoformat() if ep.last_crawled_at else None,
    }


def _pagination_meta(total: int, page: int, per_page: int) -> dict[str, Any]:
    total_pages = (total + per_page - 1) // per_page
    return {
        "total": total,
        "current_page": page,
        "last_page": total_pages,
        "per_page": per_page,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    """Health check."""
    return {
        "status": "ok",
        "service": "BBC 6-Minute English API",
        "version": "1.0.0",
        "db_connected": verify_connection(),
    }


@app.get("/api/v1/bbc/levels")
async def list_levels():
    """Available CEFR levels."""
    if not verify_connection():
        raise HTTPException(status_code=503, detail="Database not connected")
    with session_scope() as session:
        from sqlalchemy import select
        from crawler.bbc.db import BbcLevel
        levels = session.execute(
            select(BbcLevel).order_by(BbcLevel.sort_order)
        ).scalars().all()
    return {
        "data": [
            {"code": l.code, "description": l.description, "sort_order": l.sort_order}
            for l in levels
        ]
    }


@app.get("/api/v1/bbc/stats")
async def stats():
    """Aggregate stats."""
    if not verify_connection():
        raise HTTPException(status_code=503, detail="Database not connected")
    with session_scope() as session:
        stats = get_stats(session)
    return {"data": stats}


@app.get("/api/v1/bbc")
async def list_episodes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """List BBC episodes with pagination and optional filtering."""
    return await _list_episodes(page, per_page, level, search)


@app.get("/api/v1/bbc/episodes")
async def list_episodes_alias(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Alias for /api/v1/bbc — the Vite proxy rewrites /api/bbc/episodes
    (called by the frontend) to /api/v1/bbc/episodes."""
    return await _list_episodes(page, per_page, level, search)


async def _list_episodes(
    page: int,
    per_page: int,
    level: Optional[str],
    search: Optional[str],
) -> dict[str, Any]:
    """Shared implementation for list endpoints."""
    if not verify_connection():
        raise HTTPException(status_code=503, detail="Database not connected")

    with session_scope() as session:
        from sqlalchemy import func, select
        from crawler.bbc.db import BbcEpisode

        query = select(BbcEpisode)
        count_query = select(func.count(BbcEpisode.id))

        if level:
            query = query.where(BbcEpisode.level_code == level)
            count_query = count_query.where(BbcEpisode.level_code == level)

        if search:
            search_pattern = f"%{search}%"
            query = query.where(BbcEpisode.title.ilike(search_pattern))
            count_query = count_query.where(BbcEpisode.title.ilike(search_pattern))

        total = session.execute(count_query).scalar_one()

        from sqlalchemy.orm import selectinload
        query = query.options(selectinload(BbcEpisode.level))
        query = query.order_by(BbcEpisode.published_at.desc().nullslast())
        query = query.offset((page - 1) * per_page).limit(per_page)
        episodes = session.execute(query).scalars().all()

    return {
        "data": [_format_episode(ep) for ep in episodes],
        "source": {
            "id": 1,
            "code": "bbc-learning-english",
            "name": "BBC Learning English",
            "slug": "bbc-learning-english",
            "lesson_count": total,
        },
        "pagination": _pagination_meta(total, page, per_page),
    }


# IMPORTANT: Clips sub-routes MUST be defined BEFORE the generic {slug} route.
# FastAPI matches routes in definition order; the greedy {slug} parameter
# would otherwise swallow /clips/segments and /clips/{filename} paths.


@app.get("/api/v1/bbc/{slug}/clips/segments")
async def episode_clips_segments(slug: str):
    """Serve the local clips/segments.json file for dictation practice.

    This file is generated by tools/bbc_audio_segmenter.py and contains
    per-segment audio timings + text for micro-dictation.  Returns 404
    when the file does not exist so the frontend can fall back gracefully.
    """
    segments_path = _clips_dir(slug) / "segments.json"
    if not segments_path.exists():
        raise HTTPException(status_code=404, detail="Clips segments not found")
    return FileResponse(segments_path, media_type="application/json")


@app.get("/api/v1/bbc/{slug}/clips/{filename:path}")
async def episode_clip_file(slug: str, filename: str):
    """Serve individual audio clip files (e.g. 00.mp3, 01.mp3...).

    These are the pre-sliced per-segment MP3 files generated by
    tools/bbc_audio_segmenter.py.  The `segments.json` references
    clips with a relative path like ``audio_clips/00.mp3`` so we use
    the ``:path`` converter to allow nested subdirectories.
    Returns 404 when the file does not exist so the frontend can fall
    back to the full audio or BBC embed.
    """
    # Security: resolve the path and ensure it stays inside the
    # episode's clips directory (defeats `..` traversal even though
    # `filename:path` allows slashes).
    clips_root = _clips_dir(slug).resolve()
    clip_path = (clips_root / filename).resolve()
    try:
        clip_path.relative_to(clips_root)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid clip path")
    if not clip_path.is_file():
        raise HTTPException(status_code=404, detail="Clip file not found")
    return FileResponse(clip_path, media_type="audio/mpeg")


@app.get("/api/v1/bbc/{slug}/audio")
async def episode_audio(slug: str):
    """Redirect to local audio file or remote URL."""
    if not verify_connection():
        raise HTTPException(status_code=503, detail="Database not connected")

    with session_scope() as session:
        from sqlalchemy import select
        from crawler.bbc.db import BbcEpisode, BbcAsset

        ep = session.execute(
            select(BbcEpisode).where(BbcEpisode.slug == slug)
        ).scalars().first()

        if not ep:
            raise HTTPException(status_code=404, detail="Episode not found")

        # Try local audio asset first
        audio_asset = session.execute(
            select(BbcAsset).where(
                BbcAsset.episode_id == ep.id,
                BbcAsset.asset_kind == "audio",
            )
        ).scalars().first()

    # Serve local file
    if audio_asset and audio_asset.storage_path:
        local_path = _PROJECT_ROOT / audio_asset.storage_path
        if local_path.exists():
            return FileResponse(
                local_path,
                media_type="audio/mpeg",
                filename=f"{slug}.mp3",
            )

    # Fallback to remote URL
    if ep.audio_url:
        return RedirectResponse(ep.audio_url, status_code=302)

    raise HTTPException(status_code=404, detail="Audio not found")


@app.get("/api/v1/bbc/{slug}")
async def episode_detail(slug: str):
    """Episode detail including vocabulary and transcript segments.

    When the DB has no transcript segments for this episode, fall back to
    the local files (clips/segments.json → timings.json → transcript.txt)
    so lessons that were downloaded but not ingested still render the
    DailyDictation-style player.
    """
    if not verify_connection():
        raise HTTPException(status_code=503, detail="Database not connected")

    with session_scope() as session:
        from sqlalchemy import select
        from crawler.bbc.db import BbcEpisode, BbcAsset

        ep = session.execute(
            select(BbcEpisode).where(BbcEpisode.slug == slug)
        ).scalars().first()

        if not ep:
            raise HTTPException(status_code=404, detail="Episode not found")

        # Load relationships
        _ = ep.source
        _ = ep.level
        _ = ep.vocabulary
        _ = ep.segments
        _ = ep.assets

        # Audio URL — prefer the local /audio endpoint when we have a local file
        audio_asset = next(
            (a for a in ep.assets if a.asset_kind == "audio"),
            None,
        )
        local_audio = _local_audio_path(slug)
        if local_audio is not None:
            audio_url = f"/api/v1/bbc/{slug}/audio"
        elif audio_asset and audio_asset.remote_url:
            audio_url = audio_asset.remote_url
        else:
            audio_url = None

    result = _format_episode(ep)
    result["audio_url"] = audio_url
    db_vocabulary = [
        {"id": v.id, "position": v.position, "word": v.word, "meaning": v.meaning}
        for v in ep.vocabulary
    ]
    if db_vocabulary:
        result["vocabulary"] = db_vocabulary
    else:
        # Fall back to local metadata.json / content.md when the DB
        # vocab rows weren't populated by the crawler.
        result["vocabulary"] = _local_vocabulary(slug)
    db_segments = [
        {"id": s.id, "position": s.position, "speaker": s.speaker, "text": s.text}
        for s in ep.segments
    ]
    if db_segments:
        result["transcript_segments"] = db_segments
    else:
        # Fall back to local files so the player has something to render
        result["transcript_segments"] = _local_transcript_segments(slug)
    result["assets"] = [
        {
            "asset_kind": a.asset_kind,
            "storage_path": a.storage_path,
            "remote_url": a.remote_url,
            "mime_type": a.mime_type,
            "byte_size": a.byte_size,
        }
        for a in ep.assets
    ]
    return {"data": result}


@app.get("/api/v1/bbc/{slug}/transcript")
async def episode_transcript(slug: str, format: str = Query("text")):
    """Get episode transcript."""
    if not verify_connection():
        raise HTTPException(status_code=503, detail="Database not connected")

    with session_scope() as session:
        from sqlalchemy import select
        from crawler.bbc.db import BbcEpisode, BbcTranscriptSegment

        ep = session.execute(
            select(BbcEpisode).where(BbcEpisode.slug == slug)
        ).scalars().first()

        if not ep:
            raise HTTPException(status_code=404, detail="Episode not found")

        segments = session.execute(
            select(BbcTranscriptSegment)
            .where(BbcTranscriptSegment.episode_id == ep.id)
            .order_by(BbcTranscriptSegment.position)
        ).scalars().all()

    if format == "segments":
        return {
            "data": [
                {"position": s.position, "speaker": s.speaker, "text": s.text}
                for s in segments
            ]
        }

    # Plain text
    transcript = "\n\n".join(
        f"[{s.speaker}] {s.text}" if s.speaker else s.text
        for s in segments
    )
    return Response(content=transcript, media_type="text/plain; charset=utf-8")


@app.get("/api/v1/bbc/{slug}/clips/segments")
async def episode_clips_segments(slug: str):
    """Serve the local clips/segments.json file for dictation practice.

    This file is generated by tools/bbc_audio_segmenter.py and contains
    per-segment audio timings + text for micro-dictation.  Returns 404
    when the file does not exist so the frontend can fall back gracefully.
    """
    segments_path = _clips_dir(slug) / "segments.json"
    if not segments_path.exists():
        raise HTTPException(status_code=404, detail="Clips segments not found")
    return FileResponse(segments_path, media_type="application/json")


@app.get("/api/v1/bbc/{slug}/clips/{filename:path}")
async def episode_clip_file(slug: str, filename: str):
    """Serve individual audio clip files (e.g. 00.mp3, 01.mp3...).

    These are the pre-sliced per-segment MP3 files generated by
    tools/bbc_audio_segmenter.py.  The `segments.json` references
    clips with a relative path like ``audio_clips/00.mp3`` so we use
    the ``:path`` converter to allow nested subdirectories.
    Returns 404 when the file does not exist so the frontend can fall
    back to the full audio or BBC embed.
    """
    # Security: resolve the path and ensure it stays inside the
    # episode's clips directory (defeats `..` traversal even though
    # `filename:path` allows slashes).
    clips_root = _clips_dir(slug).resolve()
    clip_path = (clips_root / filename).resolve()
    try:
        clip_path.relative_to(clips_root)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid clip path")
    if not clip_path.is_file():
        raise HTTPException(status_code=404, detail="Clip file not found")
    return FileResponse(clip_path, media_type="audio/mpeg")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def run():
    host = os.environ.get("BBC_API_HOST", "127.0.0.1")
    port = int(os.environ.get("BBC_API_PORT", "3003"))
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logger.info("Starting BBC API server on http://%s:%d", host, port)
    uvicorn.run(
        "crawler.bbc.api_server:app",
        host=host,
        port=port,
        reload=False,
        factory=False,
    )


if __name__ == "__main__":
    run()

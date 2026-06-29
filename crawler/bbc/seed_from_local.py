"""Import existing bbc_listening/ local data into the PostgreSQL database.

Usage::

    # Import all episodes from bbc_listening/ into DB
    python -m crawler.bbc.seed_from_local

    # Dry run (print only)
    python -m crawler.bbc.seed_from_local --dry-run

    # Limit to N episodes
    python -m crawler.bbc.seed_from_local --limit 10
"""
from __future__ import annotations

import argparse
import datetime
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).parent.parent.parent
BBC_LISTENING_ROOT = PROJECT_ROOT / "bbc_listening"


def load_metadata(folder: Path) -> Optional[dict]:
    meta_path = folder / "metadata.json"
    if not meta_path.exists():
        return None
    try:
        return json.loads(meta_path.read_text(encoding="utf-8"))
    except Exception as exc:
        logger.warning("Failed to load metadata for %s: %s", folder.name, exc)
        return None


def load_transcript(folder: Path) -> Optional[str]:
    txt_path = folder / "transcript.txt"
    if txt_path.exists():
        return txt_path.read_text(encoding="utf-8").strip()
    return None


def load_content_md(folder: Path) -> Optional[str]:
    md_path = folder / "content.md"
    if md_path.exists():
        return md_path.read_text(encoding="utf-8").strip()
    return None


def import_episode(
    session,
    source_id: int,
    folder: Path,
    *,
    crawl_run_id: int,
) -> bool:
    """Import one episode folder into the DB. Returns True if inserted."""
    from crawler.bbc.episode_parser import EpisodeData
    from crawler.bbc.repository import (
        replace_transcript_segments,
        upsert_asset,
        upsert_episode_from_episode_data,
    )

    meta = load_metadata(folder)
    if not meta:
        return False

    slug = folder.name
    source_url = meta.get("source_url", f"https://www.bbc.co.uk/learningenglish/english/features/6-minute-english/{slug}")
    title = meta.get("title", slug.replace("-", " ").title())
    audio_url = meta.get("audio_url")
    pdf_url = meta.get("pdf_url")
    thumbnail_url = meta.get("thumbnail_url")
    duration_seconds = meta.get("duration_seconds")
    level_code = meta.get("level", "").lower() or None
    published_at_str = meta.get("published_at")
    description = meta.get("description")
    introduction = meta.get("introduction")
    transcript = load_transcript(folder)
    content_md = load_content_md(folder)
    vocabulary_count = meta.get("vocabulary_count", 0)

    # published_at
    published_at = None
    if published_at_str:
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ"):
            try:
                published_at = datetime.date.fromisoformat(published_at_str[:10])
                break
            except (ValueError, TypeError):
                pass

    vocab_entries: list[dict[str, Any]] = []
    if vocabulary_count and vocabulary_count > 0 and content_md:
        for match in re.finditer(r'\*\*([^*]+)\*\*[:\-]?\s*([^\n]+)?', content_md):
            word = match.group(1).strip()
            meaning = match.group(2).strip() if match.group(2) else None
            if word and len(word) < 100:
                vocab_entries.append({"word": word, "meaning": meaning})

    data = EpisodeData(
        title=title,
        source_url=source_url,
        audio_url=audio_url,
        pdf_url=pdf_url,
        thumbnail_url=thumbnail_url,
        duration_seconds=duration_seconds,
        level=level_code or "intermediate",
        published_at=published_at_str,
        description=description,
        introduction=introduction,
        transcript=transcript,
        vocabulary=vocab_entries if vocab_entries else [],
        question=None,
    )

    episode, created = upsert_episode_from_episode_data(
        session,
        source_id=source_id,
        data=data,
        crawl_run_id=crawl_run_id,
    )

    if transcript:
        replace_transcript_segments(session, episode_id=episode.id, transcript=transcript)

    # Record local assets
    rel = lambda p: str(p.relative_to(PROJECT_ROOT)) if p.is_relative_to(PROJECT_ROOT) else str(p)

    audio_file = folder / "audio" / f"{slug}.mp3"
    if audio_file.exists():
        upsert_asset(
            session,
            episode_id=episode.id,
            asset_kind="audio",
            storage_backend="local",
            storage_path=rel(audio_file),
            remote_url=audio_url,
            byte_size=audio_file.stat().st_size,
            mime_type="audio/mpeg",
        )

    pdf_file = folder / "transcript.pdf"
    if pdf_file.exists():
        upsert_asset(
            session,
            episode_id=episode.id,
            asset_kind="transcript_pdf",
            storage_backend="local",
            storage_path=rel(pdf_file),
            remote_url=pdf_url,
            byte_size=pdf_file.stat().st_size,
            mime_type="application/pdf",
        )

    txt_file = folder / "transcript.txt"
    if txt_file.exists():
        upsert_asset(
            session,
            episode_id=episode.id,
            asset_kind="transcript_txt",
            storage_backend="local",
            storage_path=rel(txt_file),
            byte_size=txt_file.stat().st_size,
            mime_type="text/plain",
        )

    content_md_file = folder / "content.md"
    if content_md_file.exists():
        upsert_asset(
            session,
            episode_id=episode.id,
            asset_kind="content_md",
            storage_backend="local",
            storage_path=rel(content_md_file),
            byte_size=content_md_file.stat().st_size,
            mime_type="text/markdown",
        )

    return created


def run(args: argparse.Namespace) -> int:
    from crawler.bbc.db import verify_connection
    from crawler.bbc.db.session import session_scope
    from crawler.bbc.repository import (
        finish_crawl_run,
        get_or_create_default_source,
        start_crawl_run,
    )

    if not verify_connection():
        logger.error("Database not reachable. Check BBC_DB_* env vars.")
        return 2

    if not BBC_LISTENING_ROOT.exists():
        logger.error("bbc_listening/ folder not found at %s", BBC_LISTENING_ROOT)
        return 1

    folders = sorted([
        f for f in BBC_LISTENING_ROOT.iterdir()
        if f.is_dir() and not f.name.startswith("_") and (f / "metadata.json").exists()
    ])

    if args.limit:
        folders = folders[:args.limit]

    logger.info("Found %d episode folders (limit=%s)", len(folders), args.limit)

    if args.dry_run:
        for f in folders:
            meta = load_metadata(f)
            title = (meta or {}).get("title", f.name)
            print(f"  DRY: {f.name} — {title}")
        return 0

    cli_args = {"mode": "seed_from_local", "limit": args.limit, "dry_run": False}
    with session_scope() as session:
        source = get_or_create_default_source(session)
        run_row = start_crawl_run(session, source_id=source.id, cli_args=cli_args)
        crawl_run_id = run_row.id

    total = len(folders)
    inserted = 0
    updated = 0
    skipped = 0

    for i, folder in enumerate(folders, 1):
        try:
            with session_scope() as session:
                created = import_episode(
                    session,
                    source_id=source.id,
                    folder=folder,
                    crawl_run_id=crawl_run_id,
                )
            if created:
                inserted += 1
            else:
                updated += 1
            logger.info("[%d/%d] %s — %s", i, total, folder.name, "INSERTED" if created else "UPDATED")
        except Exception as exc:
            logger.error("[%d/%d] FAILED %s: %s", i, total, folder.name, exc)
            skipped += 1

    with session_scope() as session:
        finish_crawl_run(
            session,
            run_id=crawl_run_id,
            status="succeeded",
            episodes_seen=total,
            episodes_inserted=inserted,
            episodes_updated=updated,
            episodes_skipped=skipped,
            assets_downloaded=0,
        )

    print(f"\n=== Done: {inserted} inserted, {updated} updated, {skipped} skipped ===")
    return 0


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Import existing bbc_listening/ data into PostgreSQL.")
    p.add_argument("--dry-run", action="store_true", help="Print what would be imported, don't write to DB")
    p.add_argument("--limit", type=int, default=0, help="Limit number of episodes")
    return p.parse_args()


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    args = parse_args()
    return run(args)


if __name__ == "__main__":
    sys.exit(main())

"""BBC 6-Minute English crawler — CLI entry point.

Modes
-----
1. Filesystem-only (default, backward compatible)
   Crawls BBC episode pages, downloads audio + PDF + writes
   `metadata.json` / `content.md` into the local `bbc_listening/`
   folder. No DB writes. Re-runs are safe (file-existence checks).

2. Database-backed (--db)
   Same crawl pipeline, but in addition to the files we upsert:
   - episode metadata → bbc_episodes
   - vocabulary       → bbc_vocabulary
   - quiz + options    → bbc_questions / bbc_quiz_options
   - transcript turns  → bbc_transcript_segments
   - local assets      → bbc_assets

   Re-runs are deduplicated by the (source_id, source_url) unique
   constraint — only changed rows are updated, no duplicates.

3. Stats (--stats)
   Prints aggregate counts from the DB; no crawling.

4. Healthcheck (--check-db)
   Pings the DB and exits 0/2.

Examples
--------
    # Filesystem crawl (legacy behavior)
    python -m crawler.bbc.main --limit 10

    # Filesystem + DB
    python -m crawler.bbc.main --db --limit 10

    # DB only — write metadata into the database, skip the local folder
    python -m crawler.bbc.main --db --no-files --limit 5

    # Stats
    python -m crawler.bbc.main --stats

    # DB connection check
    python -m crawler.bbc.main --check-db
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from crawler.bbc.audio_downloader import download_audio
from crawler.bbc.audio_splitter import ffmpeg_available, split_audio
from crawler.bbc.bbc_client import BBCClient, BBCClientError
from crawler.bbc.config import (
    MASTER_INDEX,
    OUTPUT_ROOT,
    SPLIT_CHUNK_SECONDS,
    slugify,
)
from crawler.bbc.content_writer import write_content_md
from crawler.bbc.episode_list_crawler import get_episode_urls
from crawler.bbc.episode_parser import (
    EpisodeData,
    episode_data_to_dict,
    parse_episode_page,
)
from crawler.bbc.pdf_extractor import download_pdf

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------
# .env loading (best-effort)
# ---------------------------------------------------------------------

def _load_dotenv() -> None:
    """Load .env from the crawler/bbc/ folder if python-dotenv is present.

    We do not require it — the module is only an optional convenience.
    Production deployments should set the env vars via container
    orchestration / secrets manager.
    """
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=False)
        logger.debug("Loaded .env from %s", env_path)


_load_dotenv()


# ---------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------

def setup_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


# ---------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Crawl BBC 6-Minute English episodes (metadata + audio + PDF + transcript + optional DB).",
    )
    p.add_argument("--limit", type=int, default=int(os.environ.get("BBC_LIMIT", "50")),
                   help="Max episodes to process (default: 50, env: BBC_LIMIT)")
    p.add_argument("--skip-audio", action="store_true", help="Do not download audio")
    p.add_argument("--skip-pdf", action="store_true", help="Do not download PDF / extract transcript")
    p.add_argument("--split-audio", action="store_true",
                   help=f"Also produce split/*.mp3 ({SPLIT_CHUNK_SECONDS}s chunks, requires ffmpeg)")
    p.add_argument("--split-seconds", type=int, default=SPLIT_CHUNK_SECONDS,
                   help="Chunk length in seconds (default: 30)")
    p.add_argument("--dry-run", action="store_true", help="Print URLs only, do not download")
    p.add_argument("--output-dir", type=Path, default=OUTPUT_ROOT,
                   help=f"Output root (default: {OUTPUT_ROOT})")
    p.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")

    # --- New DB flags ---
    p.add_argument("--db", action="store_true",
                   help="Upsert episode metadata into PostgreSQL (bbc_* tables)")
    p.add_argument("--no-files", action="store_true",
                   help="Skip writing files to disk (combine with --db for a pure-DB run)")
    p.add_argument("--no-db", action="store_true",
                   help="Force filesystem-only crawl (default if --db is not passed)")
    p.add_argument("--stats", action="store_true", help="Print DB stats and exit")
    p.add_argument("--check-db", action="store_true", help="Verify DB connectivity and exit")
    return p.parse_args()


# ---------------------------------------------------------------------
# Filesystem helpers
# ---------------------------------------------------------------------

def episode_folder(root: Path, title: str) -> Path:
    """Compute per-episode folder path. Add numeric suffix on collision."""
    base = root / slugify(title)
    if not base.exists():
        return base
    i = 2
    while True:
        candidate = root / f"{slugify(title)}-{i}"
        if not candidate.exists():
            return candidate
        i += 1


# ---------------------------------------------------------------------
# DB pipeline
# ---------------------------------------------------------------------

class DbRunStats:
    """In-memory counters so we can close the run row in one shot."""

    def __init__(self) -> None:
        self.seen = 0
        self.inserted = 0
        self.updated = 0
        self.skipped = 0
        self.assets_downloaded = 0


def _save_to_db(
    data: EpisodeData,
    *,
    crawl_run_id: int,
    assets_to_record: List[dict],
) -> bool:
    """Upsert one episode + children into PostgreSQL.

    Returns True if a new row was inserted, False if updated.
    """
    # Lazy import so the legacy (no-DB) path doesn't pay the cost.
    from crawler.bbc.db.session import session_scope
    from crawler.bbc.repository import (
        get_or_create_default_source,
        replace_question,
        replace_transcript_segments,
        replace_vocabulary,
        upsert_asset,
        upsert_episode_from_episode_data,
    )

    with session_scope() as session:
        source = get_or_create_default_source(session)
        episode, created = upsert_episode_from_episode_data(
            session,
            source_id=source.id,
            data=data,
            crawl_run_id=crawl_run_id,
        )
        replace_vocabulary(
            session,
            episode_id=episode.id,
            entries=data.vocabulary or [],
        )
        replace_question(
            session,
            episode_id=episode.id,
            question=data.question,
        )
        replace_transcript_segments(
            session,
            episode_id=episode.id,
            transcript=data.transcript,
        )
        for asset in assets_to_record:
            upsert_asset(
                session,
                episode_id=episode.id,
                asset_kind=asset["kind"],
                storage_backend=asset.get("backend", "local"),
                storage_path=asset.get("path"),
                remote_url=asset.get("remote_url"),
                byte_size=asset.get("byte_size"),
                mime_type=asset.get("mime_type"),
                metadata=asset.get("metadata"),
            )
    return created


def _start_crawl_run(cli_args: dict) -> int:
    from crawler.bbc.db.session import session_scope
    from crawler.bbc.repository import get_or_create_default_source, start_crawl_run

    with session_scope() as session:
        source = get_or_create_default_source(session)
        run = start_crawl_run(session, source_id=source.id, cli_args=cli_args)
        return run.id


def _finish_crawl_run(run_id: int, stats: DbRunStats, *, error: Optional[str] = None) -> None:
    from crawler.bbc.db.session import session_scope
    from crawler.bbc.repository import finish_crawl_run

    status = "failed" if error else "succeeded"
    with session_scope() as session:
        finish_crawl_run(
            session,
            run_id=run_id,
            status=status,
            episodes_seen=stats.seen,
            episodes_inserted=stats.inserted,
            episodes_updated=stats.updated,
            episodes_skipped=stats.skipped,
            assets_downloaded=stats.assets_downloaded,
            error_message=error,
        )


# ---------------------------------------------------------------------
# Filesystem pipeline
# ---------------------------------------------------------------------

async def process_episode(
    client: BBCClient,
    url: str,
    args: argparse.Namespace,
    root: Path,
    *,
    db_run_id: Optional[int] = None,
    db_stats: Optional[DbRunStats] = None,
) -> Optional[dict]:
    """Crawl a single episode. Returns metadata dict, or None on skip/failure."""
    try:
        html = await client.get_html(url)
    except BBCClientError as exc:
        logger.error("Failed to fetch %s: %s", url, exc)
        return None

    data = parse_episode_page(url=url, html=html)
    if not data.title:
        logger.warning("No title found for %s — skipping", url)
        return None

    write_files = not args.no_files

    # ---- Filesystem artifacts ----
    if write_files:
        folder = episode_folder(root, data.title)
        folder.mkdir(parents=True, exist_ok=True)
        audio_dir = folder / "audio"
        split_dir = folder / "split"
        pdf_path = folder / "transcript.pdf"
        txt_path = folder / "transcript.txt"

        if not args.dry_run:
            if data.audio_url and not args.skip_audio:
                try:
                    await download_audio(
                        client,
                        data.audio_url,
                        audio_dir / f"{slugify(data.title)}.mp3",
                    )
                except BBCClientError as exc:
                    logger.error("Audio download failed for %s: %s", data.title, exc)
            elif not data.audio_url:
                logger.warning("No audio URL for %s", data.title)

            if data.pdf_url and not args.skip_pdf:
                try:
                    await download_pdf(
                        client,
                        data.pdf_url,
                        pdf_path,
                        target_txt=txt_path,
                    )
                except BBCClientError as exc:
                    logger.error("PDF download failed for %s: %s", data.title, exc)
            elif not data.pdf_url:
                logger.warning("No PDF URL for %s", data.title)

            audio_file = audio_dir / f"{slugify(data.title)}.mp3"
            if args.split_audio and audio_file.exists():
                if not ffmpeg_available():
                    logger.warning(
                        "Skipping split for %s — ffmpeg not installed. "
                        "Install with: brew install ffmpeg",
                        data.title,
                    )
                else:
                    try:
                        split_audio(audio_file, split_dir, chunk_seconds=args.split_seconds)
                    except Exception as exc:  # noqa: BLE001
                        logger.error("Audio split failed for %s: %s", data.title, exc)

            meta = episode_data_to_dict(data)
            meta["folder"] = str(folder.relative_to(root))
            meta["files"] = {
                "audio": str((audio_dir / f"{slugify(data.title)}.mp3").relative_to(folder))
                    if (audio_dir / f"{slugify(data.title)}.mp3").exists() else None,
                "transcript_pdf": "transcript.pdf" if pdf_path.exists() else None,
                "transcript_txt": "transcript.txt" if txt_path.exists() else None,
                "content_md": "content.md",
                "split_dir": "split" if split_dir.exists() and any(split_dir.iterdir()) else None,
            }
            meta["vocabulary_count"] = len(data.vocabulary)
            meta["crawled_at"] = datetime.now(timezone.utc).isoformat()

            meta_path = folder / "metadata.json"
            meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
            logger.info("Wrote metadata: %s", meta_path)

            try:
                write_content_md(folder, data)
                logger.info("Wrote content.md: %s", folder / "content.md")
            except Exception as exc:  # noqa: BLE001
                logger.error("content.md write failed for %s: %s", data.title, exc)
    else:
        # Filesystem skipped — synthesize a folder name for logging only
        folder = None  # type: ignore[assignment]

    # ---- DB upsert ----
    created_in_db: Optional[bool] = None
    if args.db and db_run_id is not None and db_stats is not None:
        try:
            assets_to_record: List[dict] = []
            if write_files and folder is not None:
                audio_file = folder / "audio" / f"{slugify(data.title)}.mp3"
                if audio_file.exists() and not args.skip_audio:
                    assets_to_record.append({
                        "kind": "audio",
                        "backend": "local",
                        "path": str(audio_file.relative_to(root)) if audio_file.is_relative_to(root) else str(audio_file),
                        "remote_url": data.audio_url,
                        "byte_size": audio_file.stat().st_size,
                        "mime_type": "audio/mpeg",
                    })
                if not args.skip_pdf:
                    pdf_file = folder / "transcript.pdf"
                    if pdf_file.exists():
                        assets_to_record.append({
                            "kind": "transcript_pdf",
                            "backend": "local",
                            "path": str(pdf_file.relative_to(root)) if pdf_file.is_relative_to(root) else str(pdf_file),
                            "remote_url": data.pdf_url,
                            "byte_size": pdf_file.stat().st_size,
                            "mime_type": "application/pdf",
                        })
                    txt_file = folder / "transcript.txt"
                    if txt_file.exists():
                        assets_to_record.append({
                            "kind": "transcript_txt",
                            "backend": "local",
                            "path": str(txt_file.relative_to(root)) if txt_file.is_relative_to(root) else str(txt_file),
                            "byte_size": txt_file.stat().st_size,
                            "mime_type": "text/plain",
                        })
                    content_md_file = folder / "content.md"
                    if content_md_file.exists():
                        assets_to_record.append({
                            "kind": "content_md",
                            "backend": "local",
                            "path": str(content_md_file.relative_to(root)) if content_md_file.is_relative_to(root) else str(content_md_file),
                            "byte_size": content_md_file.stat().st_size,
                            "mime_type": "text/markdown",
                        })

            created_in_db = _save_to_db(
                data,
                crawl_run_id=db_run_id,
                assets_to_record=assets_to_record,
            )
            db_stats.seen += 1
            if created_in_db:
                db_stats.inserted += 1
            else:
                db_stats.updated += 1
            db_stats.assets_downloaded += len(assets_to_record)
        except Exception as exc:  # noqa: BLE001
            logger.error("DB upsert failed for %s: %s", data.title, exc, exc_info=args.verbose)
            db_stats.skipped += 1
    elif args.db and (db_run_id is None or db_stats is None):
        # Defensive — should not happen because the caller wires both.
        logger.error("DB mode requested but run id / stats missing — skipping DB upsert for %s", data.title)

    return {
        "title": data.title,
        "source_url": url,
        "created_in_db": created_in_db,
    }


# ---------------------------------------------------------------------
# Top-level orchestrator
# ---------------------------------------------------------------------

async def run(args: argparse.Namespace) -> int:
    # --stats / --check-db are early exits with no crawling.
    if args.check_db:
        from crawler.bbc.db import verify_connection

        if verify_connection():
            print("OK — database is reachable.")
            return 0
        print("FAIL — database is not reachable. Check BBC_DB_* env vars.", file=sys.stderr)
        return 2

    if args.stats:
        from crawler.bbc.db import session_scope
        from crawler.bbc.repository import get_stats, list_episodes

        with session_scope() as s:
            stats = get_stats(s)
            print("\n=== BBC microservice stats ===")
            for k, v in stats.items():
                print(f"  {k}: {v}")
            print("\nLatest 10 episodes:")
            for ep in list_episodes(s, limit=10):
                title = (ep.title or "")[:60]
                print(f"  [{ep.id}] {ep.published_at} | {ep.level_code or '----'} | {title}")
        return 0

    root: Path = args.output_dir
    if not args.no_files:
        root.mkdir(parents=True, exist_ok=True)

    # Open crawl run row up front so the orchestrator can attribute work.
    db_run_id: Optional[int] = None
    db_stats: Optional[DbRunStats] = None
    if args.db:
        cli_args = {k: (str(v) if not isinstance(v, (int, float, bool, str, list, dict, type(None))) else v)
                    for k, v in vars(args).items()}
        try:
            db_run_id = _start_crawl_run(cli_args)
            db_stats = DbRunStats()
            logger.info("Started crawl run #%d", db_run_id)
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to open crawl run: %s", exc)
            if not args.no_files:
                logger.warning("Continuing in filesystem-only mode.")
            args.db = False

    error: Optional[str] = None
    try:
        async with BBCClient() as client:
            logger.info("Discovering episode URLs...")
            try:
                episode_urls = await get_episode_urls(client, max_episodes=args.limit)
            except BBCClientError as exc:
                logger.error("Discovery failed: %s", exc)
                logger.error(
                    "This may be due to geo-blocking. Check your network or "
                    "consider using a residential proxy."
                )
                error = f"discovery failed: {exc}"
                return 1

            if not episode_urls:
                logger.error("No episode URLs found. Cannot proceed.")
                error = "no episode URLs"
                return 1

            logger.info("Found %d episode URLs (limit: %d)", len(episode_urls), args.limit)

            if args.dry_run:
                print(f"\n=== DRY RUN: {len(episode_urls)} episodes discovered ===\n")
                for u in episode_urls:
                    print(u)
                return 0

            results: list[dict] = []
            for i, url in enumerate(episode_urls, 1):
                logger.info("=== [%d/%d] Processing %s", i, len(episode_urls), url)
                try:
                    result = await process_episode(
                        client,
                        url,
                        args,
                        root,
                        db_run_id=db_run_id,
                        db_stats=db_stats,
                    )
                    if result:
                        results.append(result)
                except Exception as exc:  # noqa: BLE001
                    logger.error("Unhandled error for %s: %s", url, exc, exc_info=args.verbose)
                    if db_stats is not None:
                        db_stats.skipped += 1
                    continue

        # ---- Filesystem master index ----
        if not args.no_files:
            master = {
                "crawled_at": datetime.now(timezone.utc).isoformat(),
                "source": "BBC Learning English - 6 Minute English",
                "source_url": "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
                "total_episodes": len(results),
                "episodes": results,
            }
            master_path = root / "episodes.json"
            master_path.write_text(
                json.dumps(master, indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
            logger.info("Wrote master index: %s", master_path)

        # ---- Summary ----
        if args.db and db_stats is not None:
            print(
                f"\n=== Done: {len(results)}/{len(episode_urls)} episodes processed | "
                f"DB inserted={db_stats.inserted} updated={db_stats.updated} "
                f"skipped={db_stats.skipped} assets={db_stats.assets_downloaded} ==="
            )
        else:
            print(f"\n=== Done: {len(results)}/{len(episode_urls)} episodes processed ===")
        if not args.no_files:
            print(f"Filesystem root: {root}")
        return 0
    except Exception as exc:  # noqa: BLE001
        error = str(exc)
        logger.exception("Crawl failed: %s", exc)
        return 1
    finally:
        if db_run_id is not None and db_stats is not None:
            try:
                _finish_crawl_run(db_run_id, db_stats, error=error)
            except Exception as exc:  # noqa: BLE001
                logger.error("Failed to close crawl run #%d: %s", db_run_id, exc)


def main() -> int:
    args = parse_args()
    setup_logging(args.verbose)
    try:
        return asyncio.run(run(args))
    except KeyboardInterrupt:
        logger.warning("Interrupted by user")
        return 130


if __name__ == "__main__":
    sys.exit(main())

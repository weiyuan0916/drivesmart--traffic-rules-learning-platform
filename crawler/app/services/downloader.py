"""Audio downloader - downloads MP3 files with retry and resume support."""
from __future__ import annotations

import asyncio
import logging
import os
import re
from pathlib import Path
from typing import Any

from app.api.client import HTTPClient
from app.db.models import Challenge, Lesson
from app.db.session import get_session

logger = logging.getLogger(__name__)

STORAGE_ROOT = Path(__file__).parent.parent.parent / "storage" / "audio"


def _sanitize_path_component(text: str) -> str:
    """Remove characters that are unsafe for filesystem paths."""
    text = re.sub(r'[<>:"/\\|?*]', "_", text)
    text = text.strip(". ")
    return text[: 200]


def get_lesson_audio_dir(topic_slug: str, section_slug: str) -> Path:
    """Return the directory path for a lesson's audio files."""
    topic_dir = STORAGE_ROOT / _sanitize_path_component(topic_slug)
    if section_slug:
        topic_dir = topic_dir / _sanitize_path_component(section_slug)
    topic_dir.mkdir(parents=True, exist_ok=True)
    return topic_dir


async def download_audio_file(
    client: HTTPClient,
    url: str,
    dest_path: Path,
) -> bool:
    """Download a single audio file. Returns True if downloaded or already exists."""
    if dest_path.exists() and dest_path.stat().st_size > 0:
        logger.debug("Skipping existing file: %s", dest_path)
        return True

    try:
        content = await client.download_bytes(url)
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.write_bytes(content)
        logger.info("Downloaded: %s (%d bytes)", dest_path.name, len(content))
        return True
    except Exception as e:
        logger.error("Failed to download %s: %s", url, e)
        return False


async def download_lesson_audio(
    client: HTTPClient,
    lesson: Lesson,
    topic_slug: str,
    section_slug: str = "",
) -> tuple[bool, str]:
    """
    Download the main lesson audio MP3.
    Returns (success, local_path).
    """
    if not lesson.audio_src:
        return False, ""

    audio_dir = get_lesson_audio_dir(topic_slug, section_slug)
    filename = f"{lesson.id}.mp3"
    dest = audio_dir / filename

    success = await download_audio_file(client, lesson.audio_src, dest)
    local_path = str(dest) if success else ""

    if success:
        with get_session() as session:
            db_lesson = session.query(Lesson).filter_by(id=lesson.id).first()
            if db_lesson:
                db_lesson.local_audio_path = local_path
                db_lesson.audio_downloaded = True
                session.commit()

    return success, local_path


async def download_challenge_audios(
    client: HTTPClient,
    lesson: Lesson,
    topic_slug: str,
    section_slug: str = "",
    max_concurrency: int = 5,
) -> int:
    """
    Download all individual challenge sentence audio files.
    Returns count of successfully downloaded files.
    """
    with get_session() as session:
        challenges = session.query(Challenge).filter_by(lesson_id=lesson.id).all()

    if not challenges:
        return 0

    audio_dir = get_lesson_audio_dir(topic_slug, section_slug) / f"challenges_{lesson.id}"
    audio_dir.mkdir(parents=True, exist_ok=True)

    semaphore = asyncio.Semaphore(max_concurrency)

    async def download_one(challenge: Challenge) -> bool:
        if not challenge.audio_src:
            return False
        filename = f"challenge_{challenge.position}.mp3"
        dest = audio_dir / filename
        async with semaphore:
            return await download_audio_file(client, challenge.audio_src, dest)

    results = await asyncio.gather(*[download_one(ch) for ch in challenges], return_exceptions=True)
    success_count = sum(1 for r in results if r is True)
    logger.info(
        "Downloaded %d/%d challenge audios for lesson %d",
        success_count,
        len(challenges),
        lesson.id,
    )
    return success_count


async def download_all_pending(
    client: HTTPClient,
    max_concurrency: int = 10,
) -> int:
    """
    Download audio for all lessons that have audio_src but not audio_downloaded.
    Returns count of successfully downloaded lessons.
    """
    with get_session() as session:
        pending = session.query(Lesson).filter(
            Lesson.audio_src.isnot(None),
            Lesson.audio_src != "",
            Lesson.audio_downloaded == False,  # noqa: E712
        ).all()

    logger.info("Found %d lessons with pending audio downloads", len(pending))

    semaphore = asyncio.Semaphore(max_concurrency)

    async def download_one(lesson: Lesson) -> bool:
        async with semaphore:
            success, _ = await download_lesson_audio(client, lesson, "", "")
            return success

    results = await asyncio.gather(*[download_one(l) for l in pending], return_exceptions=True)
    success_count = sum(1 for r in results if r is True)
    logger.info("Downloaded audio for %d/%d lessons", success_count, len(pending))
    return success_count

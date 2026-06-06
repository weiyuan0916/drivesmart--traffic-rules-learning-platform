"""Main crawler service - orchestrates the full crawl pipeline."""
import asyncio
import logging
import sys
from pathlib import Path

from app.api.client import HTTPClient
from app.db.session import create_tables, get_session, migrate_add_transcript
from app.services import topic_crawler, section_crawler, lesson_crawler, downloader

logger = logging.getLogger(__name__)


def setup_logging(verbose: bool = False):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout,
    )


async def run_full_crawl(
    max_concurrency: int = 10,
    skip_audio: bool = False,
    topics_only: bool = False,
    full_lesson_detail: bool = False,
):
    """
    Run the full crawler pipeline.

    Pipeline steps:
    1. Create database tables
    2. Crawl topics from /exercises HTML
    3. Crawl sections from each topic page HTML
    4. Crawl lesson IDs from the paginated /api/lessons API
    5. (Optional) Fetch full lesson details including challenges/transcripts
    6. (Optional) Download audio files for lessons
    """
    create_tables()
    migrate_add_transcript()
    logger.info("Database tables created/verified.")

    async with HTTPClient(rate_limit=8) as client:
        # Step 1: Crawl topics
        logger.info("=" * 50)
        logger.info("STEP 1: Crawling topics...")
        topics = await topic_crawler.crawl_topics(client)
        logger.info("STEP 1 complete: %d topics saved.", len(topics))

        if topics_only:
            return

        # Step 2: Crawl sections
        logger.info("=" * 50)
        logger.info("STEP 2: Crawling sections...")
        all_sections = await section_crawler.crawl_all_sections(client)
        logger.info("STEP 2 complete: %d sections saved.", len(all_sections))

        # Step 3: Crawl lesson list (paginated API)
        logger.info("=" * 50)
        logger.info("STEP 3: Crawling lesson list...")
        lesson_ids = await lesson_crawler.crawl_all_lessons(client)
        logger.info("STEP 3 complete: %d unique lessons in DB.", len(lesson_ids))

        # Step 3b: Re-link lessons to sections now that lesson IDs exist in DB
        # (Step 2 ran before lesson API, so section_id was None for all lessons)
        logger.info("=" * 50)
        logger.info("STEP 3b: Linking lessons to sections...")
        linked = await section_crawler.relink_all_lessons(client)
        logger.info("STEP 3b complete: %d lessons linked to sections.", linked)

        if full_lesson_detail:
            # Step 4: Fetch full lesson details (transcript, challenges, audio URLs)
            logger.info("=" * 50)
            logger.info("STEP 4: Fetching lesson details...")
            await lesson_crawler.crawl_lesson_details(client, lesson_ids, max_concurrency=max_concurrency)
            logger.info("STEP 4 complete.")

        if not skip_audio:
            # Step 5: Download audio files
            logger.info("=" * 50)
            logger.info("STEP 5: Downloading audio files...")
            await downloader.download_all_pending(client, max_concurrency=max_concurrency)
            logger.info("STEP 5 complete.")

    logger.info("=" * 50)
    logger.info("Crawl complete!")
    _print_stats()


def _print_stats():
    """Print final database statistics."""
    try:
        with get_session() as session:
            from app.db.models import Topic, Section, Lesson, Challenge

            topic_count = session.query(Topic).count()
            section_count = session.query(Section).count()
            lesson_count = session.query(Lesson).count()
            challenge_count = session.query(Challenge).count()
            downloaded = session.query(Lesson).filter_by(audio_downloaded=True).count()

            logger.info("--- Final Statistics ---")
            logger.info("Topics:    %d", topic_count)
            logger.info("Sections:  %d", section_count)
            logger.info("Lessons:   %d", lesson_count)
            logger.info("Challenges: %d", challenge_count)
            logger.info("Audio downloaded: %d lessons", downloaded)
    except Exception as e:
        logger.warning("Could not print stats: %s", e)

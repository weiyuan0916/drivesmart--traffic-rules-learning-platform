#!/usr/bin/env python3
"""CLI entry point for the Daily Dictation crawler."""
import argparse
import asyncio
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.services.crawler_service import run_full_crawl, setup_logging


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="daily-dictation-crawler",
        description="Crawl Daily Dictation (dailydictation.com) for topics, lessons, and audio.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Full crawl with everything (topics, sections, lessons, details, audio)
  python -m app.main --full

  # Topics and sections only (fast, no API calls for lessons)
  python -m app.main --topics-only

  # Crawl lessons and details, skip audio
  python -m app.main --lessons --full-detail --skip-audio

  # Verbose debug output
  python -m app.main --full --verbose
        """,
    )
    parser.add_argument("--topics-only", action="store_true", help="Only crawl topics and sections, skip lesson API")
    parser.add_argument("--lessons", action="store_true", help="Include lesson list crawling")
    parser.add_argument("--full-detail", action="store_true", help="Fetch full lesson details (transcripts, challenges)")
    parser.add_argument("--skip-audio", action="store_true", help="Skip audio download")
    parser.add_argument("--concurrency", type=int, default=10, help="Max concurrent requests (default: 10)")
    parser.add_argument("--rate-limit", type=int, default=8, help="Max requests per second (default: 8)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable debug logging")
    return parser.parse_args()


def main():
    args = parse_args()
    setup_logging(verbose=args.verbose)

    steps = []
    if args.topics_only:
        steps.append("topics")
        steps.append("sections")
    elif args.lessons:
        steps.append("topics")
        steps.append("sections")
        steps.append("lessons")
        if args.full_detail:
            steps.append("details")
        if not args.skip_audio:
            steps.append("audio")

    print(f"\n{'='*50}")
    print(f"  Daily Dictation Crawler")
    print(f"  Steps: {' -> '.join(steps) if steps else 'all'}")
    print(f"  Concurrency: {args.concurrency}")
    print(f"  Rate limit: {args.rate_limit} req/s")
    print(f"{'='*50}\n")

    try:
        asyncio.run(
            run_full_crawl(
                max_concurrency=args.concurrency,
                skip_audio=args.skip_audio,
                topics_only=args.topics_only,
                full_lesson_detail=args.full_detail,
            )
        )
    except KeyboardInterrupt:
        print("\nCrawl interrupted by user.")
        sys.exit(130)
    except Exception as e:
        logging.error("Fatal error: %s", e, exc_info=args.verbose)
        sys.exit(1)


if __name__ == "__main__":
    main()

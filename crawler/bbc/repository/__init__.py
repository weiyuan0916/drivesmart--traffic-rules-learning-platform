"""Repository package — single home for all DB writes & reads.

`episode_repository` is the only module that should call into
`db.models` directly. Everything else depends on the repository
functions, so the day we want to swap SQLAlchemy for something else,
we touch one file.
"""
from crawler.bbc.repository.episode_repository import (
    DEFAULT_SOURCE_CODE,
    finish_crawl_run,
    get_episode_by_source_url,
    get_or_create_default_source,
    get_source_by_code,
    get_stats,
    list_episodes,
    replace_question,
    replace_transcript_segments,
    replace_vocabulary,
    start_crawl_run,
    upsert_asset,
    upsert_episode_from_episode_data,
    upsert_source,
)

__all__ = [
    "DEFAULT_SOURCE_CODE",
    "finish_crawl_run",
    "get_episode_by_source_url",
    "get_or_create_default_source",
    "get_source_by_code",
    "get_stats",
    "list_episodes",
    "replace_question",
    "replace_transcript_segments",
    "replace_vocabulary",
    "start_crawl_run",
    "upsert_asset",
    "upsert_episode_from_episode_data",
    "upsert_source",
]

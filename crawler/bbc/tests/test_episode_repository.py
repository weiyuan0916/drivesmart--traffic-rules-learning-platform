"""Tests for episode_repository — focus on deduplication / upsert behavior.

These tests run against the live PostgreSQL at 127.0.0.1:5432 (the
project's local dev DB).  Each test uses a unique `source.code` so
parallel test runs do not collide.  `tests/conftest.py` (project root)
auto-skips the whole module if the DB is unreachable, so a missing
local PG never breaks CI for unrelated work.

What we cover:

* Upsert by (source_id, source_url) — second call returns the same row.
* Vocabulary, question, transcript, assets all upsert idempotently.
* Levels normalization (BBC's free-text "intermediate" → 'intermediate').
* Crawl-run lifecycle (start / finish / counters persisted).
* Speaker-turn splitter (transcript → segments).
"""
from __future__ import annotations

import os
import uuid
from datetime import date
from typing import Iterator

import pytest
from sqlalchemy import text

from crawler.bbc.db import session_scope
from crawler.bbc.db.models import (
    BbcAsset,
    BbcCrawlRun,
    BbcEpisode,
    BbcQuestion,
    BbcQuizOption,
    BbcSource,
    BbcTranscriptSegment,
    BbcVocabulary,
)
from crawler.bbc.episode_parser import EpisodeData
from crawler.bbc.repository import (
    DEFAULT_SOURCE_CODE,
    finish_crawl_run,
    get_or_create_default_source,
    get_stats,
    replace_question,
    replace_transcript_segments,
    replace_vocabulary,
    start_crawl_run,
    upsert_asset,
    upsert_episode_from_episode_data,
    upsert_source,
)


# ---------------------------------------------------------------------
# Test fixtures
# ---------------------------------------------------------------------

@pytest.fixture
def unique_source_code() -> str:
    """A unique source code per test, so parallel runs don't collide."""
    return f"test-source-{uuid.uuid4().hex[:10]}"


@pytest.fixture
def source(unique_source_code: str) -> Iterator[BbcSource]:
    with session_scope() as s:
        src = upsert_source(
            s,
            code=unique_source_code,
            name="Test Source",
            base_url="https://example.com/",
            description="Created by test_episode_repository",
        )
    yield src
    # Cleanup — cascade removes episodes / runs.
    with session_scope() as s:
        s.execute(
            text("DELETE FROM bbc_sources WHERE code = :code"),
            {"code": unique_source_code},
        )


def _make_episode(
    *,
    source_url: str,
    title: str = "Test Episode",
    level: str = "intermediate",
    transcript: str | None = "Neil\nHello world\n\nGeorgie\nAnd hello back\n",
) -> EpisodeData:
    # Derive a unique episode_code from the source_url so multiple
    # episodes can coexist under the same (source_id, episode_code)
    # unique constraint during tests.
    code = "ep-" + source_url.rsplit("/", 1)[-1].replace(".", "").replace("-", "")[:12]
    return EpisodeData(
        source_url=source_url,
        episode_code=code,
        title=title,
        published_at="2025-10-16",
        level=level,
        thumbnail_url="https://example.com/thumb.jpg",
        audio_url="https://example.com/audio.mp3",
        pdf_url="https://example.com/transcript.pdf",
        description="A test description.",
        bbc_programme_id="p0test0001",
        iframe_url="https://example.com/iframe",
        introduction="An introduction paragraph.",
        question={
            "prompt": "What is this?",
            "options": [
                {"letter": "a", "text": "Option A"},
                {"letter": "b", "text": "Option B"},
                {"letter": "c", "text": "Option C"},
            ],
            "answer_listen_for": "Listen to find out.",
        },
        vocabulary=[
            {"word": "hello", "meaning": "a greeting", "position": 0},
            {"word": "world", "meaning": "the earth", "position": 1},
        ],
        transcript=transcript,
    )


# ---------------------------------------------------------------------
# Source / dedup
# ---------------------------------------------------------------------

class TestSourceUpsert:
    def test_creates_when_missing(self, unique_source_code: str):
        with session_scope() as s:
            src = upsert_source(
                s,
                code=unique_source_code,
                name="S",
                base_url="https://x",
            )
            assert isinstance(src, BbcSource)
            assert src.code == unique_source_code

    def test_returns_existing_when_present(self, unique_source_code: str):
        with session_scope() as s:
            first = upsert_source(s, code=unique_source_code, name="S", base_url="https://x")
        with session_scope() as s:
            second = upsert_source(s, code=unique_source_code, name="S2", base_url="https://x2")
        # Same id — not duplicated.
        assert first.id == second.id

    def test_get_or_create_default(self):
        with session_scope() as s:
            src = get_or_create_default_source(s)
        assert src.code == DEFAULT_SOURCE_CODE


# ---------------------------------------------------------------------
# Episode upsert (the main dedup test)
# ---------------------------------------------------------------------

class TestEpisodeUpsert:
    def test_first_call_inserts(self, source: BbcSource):
        data = _make_episode(source_url="https://example.com/ep1")
        with session_scope() as s:
            ep, created = upsert_episode_from_episode_data(
                s, source_id=source.id, data=data
            )
        assert created is True
        assert ep.id is not None
        assert ep.title == "Test Episode"
        assert ep.level_code == "intermediate"
        assert ep.published_at == date(2025, 10, 16)
        assert ep.vocabulary_count == 2

    def test_second_call_updates_not_duplicates(self, source: BbcSource):
        data1 = _make_episode(source_url="https://example.com/ep2", title="Original Title")
        data2 = _make_episode(source_url="https://example.com/ep2", title="Updated Title")

        with session_scope() as s:
            ep1, c1 = upsert_episode_from_episode_data(s, source_id=source.id, data=data1)
        with session_scope() as s:
            ep2, c2 = upsert_episode_from_episode_data(s, source_id=source.id, data=data2)

        assert c1 is True
        assert c2 is False            # second call did not insert
        assert ep1.id == ep2.id       # same row
        assert ep2.title == "Updated Title"

    def test_different_urls_create_distinct_episodes(self, source: BbcSource):
        a = _make_episode(source_url="https://example.com/a")
        b = _make_episode(source_url="https://example.com/b")
        with session_scope() as s:
            ea, _ = upsert_episode_from_episode_data(s, source_id=source.id, data=a)
            eb, _ = upsert_episode_from_episode_data(s, source_id=source.id, data=b)
        assert ea.id != eb.id

    def test_normalizes_various_level_strings(self, source: BbcSource):
        # Test cases that pass the actual raw level string (no fallback).
        for raw, expected in [
            ("beginner", "beginner"),
            ("Beginner", "beginner"),
            ("B1", "intermediate"),
            ("upper-intermediate", "intermediate"),
            ("C1", "advanced"),
        ]:
            data = _make_episode(
                source_url=f"https://example.com/level-{raw}",
                level=raw,
            )
            with session_scope() as s:
                ep, _ = upsert_episode_from_episode_data(s, source_id=source.id, data=data)
                s.flush()
                s.expire_all()
                ep2 = s.get(BbcEpisode, ep.id)
            assert ep2.level_code == expected, f"{raw!r} → {ep2.level_code!r}"

        # None / empty → None
        data = _make_episode(source_url="https://example.com/level-none", level=None)
        with session_scope() as s:
            ep, _ = upsert_episode_from_episode_data(s, source_id=source.id, data=data)
            s.flush()
            s.expire_all()
            ep2 = s.get(BbcEpisode, ep.id)
        assert ep2.level_code is None

    def test_missing_title_raises(self, source: BbcSource):
        bad = EpisodeData(source_url="https://example.com/bad", title=None)
        with pytest.raises(ValueError):
            with session_scope() as s:
                upsert_episode_from_episode_data(s, source_id=source.id, data=bad)


# ---------------------------------------------------------------------
# Vocabulary / question / segments
# ---------------------------------------------------------------------

class TestChildCollections:
    def _make_episode(self, source: BbcSource, url: str) -> int:
        data = _make_episode(source_url=url)
        with session_scope() as s:
            ep, _ = upsert_episode_from_episode_data(s, source_id=source.id, data=data)
            return ep.id

    def test_vocabulary_replace(self, source: BbcSource):
        eid = self._make_episode(source, "https://example.com/v1")
        with session_scope() as s:
            n = replace_vocabulary(
                s,
                episode_id=eid,
                entries=[
                    {"word": "Hello", "meaning": "x", "position": 0},
                    {"word": "World", "meaning": "y", "position": 1},
                ],
            )
            s.flush()
        assert n == 2

        # Re-running with 1 word should drop the old list.
        with session_scope() as s:
            replace_vocabulary(
                s,
                episode_id=eid,
                entries=[{"word": "Goodbye", "meaning": "farewell", "position": 0}],
            )
            s.flush()
            count = s.scalar(
                text("SELECT count(*) FROM bbc_vocabulary WHERE episode_id = :eid"),
                {"eid": eid},
            )
        assert count == 1

    def test_question_replace_with_options(self, source: BbcSource):
        eid = self._make_episode(source, "https://example.com/q1")
        with session_scope() as s:
            replace_question(
                s,
                episode_id=eid,
                question={
                    "prompt": "Pick one",
                    "options": [
                        {"letter": "a", "text": "alpha"},
                        {"letter": "b", "text": "beta"},
                    ],
                    "answer_listen_for": "Listen!",
                },
            )
            s.flush()
            qid = s.scalar(
                text("SELECT id FROM bbc_questions WHERE episode_id = :eid"),
                {"eid": eid},
            )
            opt_count = s.scalar(
                text("SELECT count(*) FROM bbc_quiz_options WHERE question_id = :qid"),
                {"qid": qid},
            )
        assert qid is not None
        assert opt_count == 2

    def test_question_replace_with_none_deletes(self, source: BbcSource):
        eid = self._make_episode(source, "https://example.com/q2")
        # initial insert above; now wipe
        with session_scope() as s:
            replace_question(s, episode_id=eid, question=None)
            s.flush()
            count = s.scalar(
                text("SELECT count(*) FROM bbc_questions WHERE episode_id = :eid"),
                {"eid": eid},
            )
        assert count == 0

    def test_transcript_segments_speaker_split(self, source: BbcSource):
        eid = self._make_episode(source, "https://example.com/t1")
        with session_scope() as s:
            n = replace_transcript_segments(
                s,
                episode_id=eid,
                transcript="Neil\nHello world\n\nGeorgie\nAnd hello back\n",
            )
            s.flush()
            rows = s.execute(
                text(
                    "SELECT position, speaker, text FROM bbc_transcript_segments "
                    "WHERE episode_id = :eid ORDER BY position"
                ),
                {"eid": eid},
            ).all()
        assert n == 2
        assert rows[0][1] == "Neil"
        assert "Hello world" in rows[0][2]
        assert rows[1][1] == "Georgie"
        assert "hello back" in rows[1][2]

    def test_transcript_segments_empty(self, source: BbcSource):
        # The fixture _make_episode always passes a transcript; we want
        # an episode with NO transcript, so create one inline.
        from crawler.bbc.episode_parser import EpisodeData
        data = EpisodeData(
            source_url="https://example.com/t2",
            episode_code="ep-t2",
            title="No transcript",
            transcript=None,
        )
        with session_scope() as s:
            ep, _ = upsert_episode_from_episode_data(
                s, source_id=source.id, data=data
            )
            eid = ep.id
            n = replace_transcript_segments(s, episode_id=eid, transcript=None)
        assert n == 0


# ---------------------------------------------------------------------
# Assets
# ---------------------------------------------------------------------

class TestAssets:
    def _make_episode(self, source: BbcSource) -> int:
        data = _make_episode(source_url="https://example.com/asset")
        with session_scope() as s:
            ep, _ = upsert_episode_from_episode_data(s, source_id=source.id, data=data)
            return ep.id

    def test_upsert_audio(self, source: BbcSource):
        eid = self._make_episode(source)
        with session_scope() as s:
            upsert_asset(
                s,
                episode_id=eid,
                asset_kind="audio",
                storage_backend="local",
                storage_path="audio/test.mp3",
                remote_url="https://example.com/audio.mp3",
                byte_size=1234,
                mime_type="audio/mpeg",
            )
            asset = s.execute(
                text(
                    "SELECT storage_path, byte_size, remote_url FROM bbc_assets "
                    "WHERE episode_id = :eid AND asset_kind = 'audio'"
                ),
                {"eid": eid},
            ).one()
        assert asset[0] == "audio/test.mp3"
        assert asset[1] == 1234
        assert asset[2] == "https://example.com/audio.mp3"

    def test_upsert_dedupes(self, source: BbcSource):
        eid = self._make_episode(source)
        for i in range(3):
            with session_scope() as s:
                upsert_asset(
                    s,
                    episode_id=eid,
                    asset_kind="audio",
                    storage_path="audio/x.mp3",
                    remote_url="https://example.com/audio.mp3",
                    byte_size=1000 + i,
                )
        with session_scope() as s:
            count = s.scalar(
                text(
                    "SELECT count(*) FROM bbc_assets WHERE episode_id = :eid AND asset_kind = 'audio'"
                ),
                {"eid": eid},
            )
        assert count == 1


# ---------------------------------------------------------------------
# Crawl runs
# ---------------------------------------------------------------------

class TestCrawlRuns:
    def test_lifecycle(self, source: BbcSource):
        with session_scope() as s:
            run = start_crawl_run(s, source_id=source.id, cli_args={"limit": 5})
            rid = run.id
            assert run.status == "running"
        with session_scope() as s:
            finish_crawl_run(
                s,
                run_id=rid,
                status="succeeded",
                episodes_seen=10,
                episodes_inserted=3,
                episodes_updated=7,
                episodes_skipped=0,
                assets_downloaded=3,
            )
            row = s.get(BbcCrawlRun, rid)
        assert row.status == "succeeded"
        assert row.episodes_inserted == 3
        assert row.episodes_updated == 7
        assert row.episodes_seen == 10
        assert row.finished_at is not None

    def test_stats(self, source: BbcSource):
        # Insert a couple of episodes, then ensure get_stats reflects them.
        with session_scope() as s:
            for u in ("https://example.com/s1", "https://example.com/s2"):
                upsert_episode_from_episode_data(
                    s,
                    source_id=source.id,
                    data=_make_episode(source_url=u),
                )
        # Use a session bound to our test source.
        with session_scope() as s:
            stats = get_stats(s)
        assert stats["total_episodes"] >= 2

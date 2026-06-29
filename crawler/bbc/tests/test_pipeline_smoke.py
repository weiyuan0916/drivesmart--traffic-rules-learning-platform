"""End-to-end smoke test: parse a real fixture → upsert → re-upsert.

Verifies the full pipeline: HTML page → EpisodeData → repository
upsert → second upsert returns same row with updated content.
"""
from __future__ import annotations

import uuid
from pathlib import Path

import pytest
from sqlalchemy import text

from crawler.bbc.db import session_scope
from crawler.bbc.episode_parser import parse_episode_page
from crawler.bbc.repository import (
    get_or_create_default_source,
    replace_question,
    replace_transcript_segments,
    replace_vocabulary,
    upsert_episode_from_episode_data,
)


SAMPLE_HTML = (Path(__file__).parent / "test_episode_parser.py").read_text(encoding="utf-8")
# Extract just the SAMPLE_HTML constant
import re

m = re.search(r'SAMPLE_HTML\s*=\s*"""(.*?)"""', SAMPLE_HTML, re.DOTALL)
assert m is not None
SAMPLE = m.group(1)


@pytest.fixture
def test_source():
    code = f"smoke-test-{uuid.uuid4().hex[:8]}"
    with session_scope() as s:
        from crawler.bbc.repository import upsert_source
        src = upsert_source(
            s, code=code, name="Smoke Test", base_url="https://example.com",
        )
    yield src
    with session_scope() as s:
        s.execute(text("DELETE FROM bbc_sources WHERE code = :c"), {"c": code})


def test_full_pipeline(test_source):
    url = "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508"
    data = parse_episode_page(url=url, html=SAMPLE)

    # The parser fixture is a single-line transcript; replace it with
    # a multi-speaker transcript so the speaker-splitter has work.
    data.transcript = "Neil\nHello, this is 6 Minute English.\n\nGeorgie\nAnd I'm Georgie.\n"

    # 1. First upsert — should insert.
    with session_scope() as s:
        ep1, created1 = upsert_episode_from_episode_data(
            s, source_id=test_source.id, data=data
        )
        s.flush()
        replace_vocabulary(s, episode_id=ep1.id, entries=data.vocabulary)
        replace_question(s, episode_id=ep1.id, question=data.question)
        replace_transcript_segments(s, episode_id=ep1.id, transcript=data.transcript)
        s.flush()
        ep1_id = ep1.id

    assert created1 is True
    assert ep1_id is not None

    # 2. Verify all child rows exist.
    with session_scope() as s:
        vocab = s.scalar(text("SELECT count(*) FROM bbc_vocabulary WHERE episode_id = :e"), {"e": ep1_id})
        quiz = s.scalar(text("SELECT count(*) FROM bbc_questions WHERE episode_id = :e"), {"e": ep1_id})
        opts = s.scalar(text(
            "SELECT count(*) FROM bbc_quiz_options qo "
            "JOIN bbc_questions q ON q.id = qo.question_id "
            "WHERE q.episode_id = :e"
        ), {"e": ep1_id})
        segs = s.scalar(text("SELECT count(*) FROM bbc_transcript_segments WHERE episode_id = :e"), {"e": ep1_id})
    assert vocab == 3, f"expected 3 vocab words, got {vocab}"
    assert quiz == 1
    assert opts == 3
    assert segs >= 1, "should have at least one segment"

    # 3. Second upsert — should UPDATE, not insert.
    with session_scope() as s:
        ep2, created2 = upsert_episode_from_episode_data(
            s, source_id=test_source.id, data=data
        )
    assert created2 is False
    assert ep2.id == ep1_id

    # 4. Source URL is unique — count is still 1.
    with session_scope() as s:
        n = s.scalar(
            text("SELECT count(*) FROM bbc_episodes WHERE source_id = :s AND source_url = :u"),
            {"s": test_source.id, "u": url},
        )
    assert n == 1

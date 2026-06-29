"""Tests for content_writer.py — verifies the rendered markdown body."""
from __future__ import annotations

import json
from pathlib import Path

from crawler.bbc.content_writer import render_content_md, write_content_md
from crawler.bbc.episode_parser import EpisodeData


def _sample_data() -> EpisodeData:
    return EpisodeData(
        source_url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-251225",
        episode_code="ep-251225",
        title="Was Christmas better in the past?",
        published_at="2025-12-25",
        level="intermediate",
        audio_url="https://downloads.bbc.co.uk/learningenglish/features/6min/251225.mp3",
        pdf_url="https://downloads.bbc.co.uk/learningenglish/features/6min/251225.pdf",
        thumbnail_url="https://ichef.bbci.co.uk/images/ic/1200xn/p0mm9k2l.jpg",
        bbc_programme_id="p0mm9kc1",
        iframe_url="https://www.bbc.co.uk/programmes/p0mm9kc1/player",
        description="Beth and Neil talk about nostalgia.",
        introduction="It's Christmas time in the UK. People have lots of traditions.",
        question={
            "prompt": "Which of these has become a popular food at Christmas in Japan?",
            "options": [
                {"letter": "a", "text": "turkey ramen"},
                {"letter": "b", "text": "fried chicken"},
                {"letter": "c", "text": "takeaway pizza"},
            ],
            "answer_listen_for": "Listen to the programme to hear the answer.",
        },
        vocabulary=[
            {"word": "nostalgia", "meaning": "a feeling of happiness and sadness.", "position": 0},
            {"word": "indeed", "meaning": "yes, used to agree", "position": 1},
        ],
        transcript="Beth: Hello and welcome to 6 Minute English.\nNeil: And I'm Neil.",
    )


class TestRenderContentMd:
    def test_includes_title(self):
        md = render_content_md(_sample_data())
        assert "# Was Christmas better in the past?" in md

    def test_includes_programme_id_and_iframe(self):
        md = render_content_md(_sample_data())
        assert "p0mm9kc1" in md
        assert "https://www.bbc.co.uk/programmes/p0mm9kc1/player" in md

    def test_includes_iframe_html_tag(self):
        md = render_content_md(_sample_data())
        assert '<iframe' in md
        assert 'src="https://www.bbc.co.uk/programmes/p0mm9kc1/player"' in md

    def test_includes_introduction(self):
        md = render_content_md(_sample_data())
        assert "## Introduction" in md
        assert "traditions" in md

    def test_includes_quiz(self):
        md = render_content_md(_sample_data())
        assert "## Quiz" in md
        assert "a) turkey ramen" in md
        assert "b) fried chicken" in md

    def test_includes_vocabulary_table(self):
        md = render_content_md(_sample_data())
        assert "## Vocabulary" in md
        assert "| # | Word | Meaning |" in md
        assert "| 1 | nostalgia |" in md
        assert "| 2 | indeed |" in md

    def test_includes_transcript(self):
        md = render_content_md(_sample_data())
        assert "## Transcript" in md
        assert "6 Minute English" in md

    def test_handles_missing_sections(self):
        data = EpisodeData(source_url="https://x.com", title="T")
        md = render_content_md(data)
        assert "# T" in md
        assert "## Quiz" not in md
        assert "## Vocabulary" not in md
        assert "## Transcript" not in md


class TestWriteContentMd:
    def test_writes_file(self, tmp_path: Path):
        data = _sample_data()
        out = write_content_md(tmp_path, data)
        assert out.exists()
        body = out.read_text(encoding="utf-8")
        assert "Was Christmas better in the past?" in body

    def test_creates_parent_dirs(self, tmp_path: Path):
        nested = tmp_path / "a" / "b" / "c"
        data = _sample_data()
        out = write_content_md(nested, data)
        assert out.exists()

    def test_output_is_valid_utf8(self, tmp_path: Path):
        data = _sample_data()
        out = write_content_md(tmp_path, data)
        # Should not raise
        out.read_text(encoding="utf-8")

"""Tests for episode_parser.py.

Tests are RED first — they exercise the parsing contract:
- Title extraction from <h1>
- Episode code from URL path
- Audio URL discovery
- PDF URL discovery
- Vocabulary extraction
- Thumbnail from og:image
- Graceful handling of missing fields
"""
from __future__ import annotations

import pytest

from crawler.bbc.episode_parser import EpisodeData, parse_episode_page


# Realistic HTML fixture mirroring the BBC 6-Minute English page structure
SAMPLE_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <title>BBC Learning English - 6 Minute English / Should animals be kept in zoos?</title>
    <meta property="og:image" content="https://ichef.bbci.co.uk/images/ic/1200x675/p0jvs1kz.jpg" />
    <meta property="og:title" content="BBC Learning English - 6 Minute English / Should animals be kept in zoos?" />
    <meta property="og:description" content="Neil and Sam discuss the topic of zoos." />
</head>
<body>
    <h1>Learning English</h1>

    <div class="video" data-pid="p0jvs1ab">
        <div class="video-player" id="bbcMediaPlayer0"></div>
    </div>

    <audio controls>
        <source src="https://downloads.bbc.co.uk/learningenglish/features/6min/250508_6_minute_english_zoos.mp3" type="audio/mpeg" />
    </audio>

    <p>
        <a href="https://downloads.bbc.co.uk/learningenglish/features/6min/250508_6_minute_english_zoos.pdf">
            Download transcript (pdf)
        </a>
    </p>

    <div class="text">
        <h3>Introduction</h3>
        <p>Neil and Sam discuss the topic of zoos and whether they should exist.</p>

        <h3>This week's question</h3>
        <p>How many animals are kept in zoos worldwide?</p>
        <p>a) around 1 million b) around 5 million c) around 8 million</p>
        <p>Listen to the programme to hear the answer.</p>

        <h3>Vocabulary</h3>
        <p><strong>zoo</strong> a place where animals are kept for public viewing</p>
        <p><strong>captive</strong> kept in a confined space</p>
        <p><strong>endangered</strong> at risk of becoming extinct</p>

        <h3>TRANSCRIPT</h3>
        <p>Neil: Welcome to 6 Minute English.</p>

        <h3>Next</h3>
    </div>

    <p>Published: 8 May 2025</p>
</body>
</html>
"""


class TestParseEpisodePage:
    def test_returns_episode_data(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert isinstance(result, EpisodeData)

    def test_extracts_title(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.title == "Should animals be kept in zoos?"

    def test_extracts_episode_code(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.episode_code == "ep-250508"

    def test_extracts_audio_url(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.audio_url is not None
        assert result.audio_url.endswith(".mp3")
        assert "downloads.bbc.co.uk" in result.audio_url

    def test_extracts_pdf_url(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.pdf_url is not None
        assert result.pdf_url.endswith(".pdf")

    def test_extracts_thumbnail(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.thumbnail_url is not None
        assert "ichef.bbci.co.uk" in result.thumbnail_url

    def test_extracts_vocabulary(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        words = [v["word"] for v in result.vocabulary]
        assert "zoo" in words
        assert "captive" in words
        assert "endangered" in words
        assert len(result.vocabulary) == 3

    def test_vocabulary_includes_meaning(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        zoo_entry = next(v for v in result.vocabulary if v["word"] == "zoo")
        assert "public viewing" in zoo_entry["meaning"]

    def test_extracts_bbc_programme_id(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.bbc_programme_id == "p0jvs1ab"
        assert result.iframe_url == "https://www.bbc.co.uk/programmes/p0jvs1ab/player"

    def test_extracts_introduction(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.introduction is not None
        assert "zoos" in result.introduction

    def test_extracts_question(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.question is not None
        assert "How many animals" in result.question["prompt"]
        letters = [o["letter"] for o in result.question["options"]]
        assert letters == ["a", "b", "c"]

    def test_extracts_transcript(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=SAMPLE_HTML,
        )
        assert result.transcript is not None
        assert "Welcome to 6 Minute English" in result.transcript

    def test_vocabulary_includes_inline_meaning(self):
        html_with_meaning = """
        <html><body>
        <h3>Vocabulary</h3>
        <p><strong>indeed</strong> (+ do in present simple)</p>
        <h3>TRANSCRIPT</h3>
        </body></html>
        """
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=html_with_meaning,
        )
        assert len(result.vocabulary) == 1
        assert result.vocabulary[0]["word"] == "indeed"
        assert "do in present simple" in result.vocabulary[0]["meaning"]

    def test_source_url_preserved(self):
        url = "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508"
        result = parse_episode_page(url=url, html=SAMPLE_HTML)
        assert result.source_url == url

    def test_handles_old_url_format(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english/ep-160218",
            html=SAMPLE_HTML,
        )
        assert result.episode_code == "ep-160218"

    def test_missing_audio_url_is_none(self):
        html_no_audio = SAMPLE_HTML.replace(
            '<source src="https://downloads.bbc.co.uk/learningenglish/features/6min/250508_6_minute_english_zoos.mp3" type="audio/mpeg" />',
            "",
        )
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=html_no_audio,
        )
        assert result.audio_url is None

    def test_missing_pdf_url_is_none(self):
        html_no_pdf = SAMPLE_HTML.replace(
            '<a href="https://downloads.bbc.co.uk/learningenglish/features/6min/250508_6_minute_english_zoos.pdf">',
            "<span>",
        )
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=html_no_pdf,
        )
        assert result.pdf_url is None

    def test_missing_vocabulary_is_empty_list(self):
        html_no_vocab = "<html><body><h1>Learning English</h1></body></html>"
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html=html_no_vocab,
        )
        assert result.vocabulary == []

    def test_empty_html_does_not_crash(self):
        result = parse_episode_page(
            url="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english_2025/ep-250508",
            html="<html><body></body></html>",
        )
        assert result.title is None or result.title == ""
        assert result.audio_url is None
        assert result.pdf_url is None
        assert result.vocabulary == []


class TestEpisodeDataDataclass:
    def test_default_level_is_none(self):
        data = EpisodeData(
            source_url="https://example.com",
            episode_code="ep-test",
        )
        assert data.level is None
        assert data.duration_seconds is None

    def test_to_dict_roundtrip(self):
        from crawler.bbc.episode_parser import episode_data_to_dict

        data = EpisodeData(
            source_url="https://example.com",
            episode_code="ep-test",
            title="Test Title",
            audio_url="https://example.com/audio.mp3",
            pdf_url="https://example.com/transcript.pdf",
            thumbnail_url="https://example.com/thumb.jpg",
            vocabulary=[{"word": "test", "meaning": "a trial", "position": 0}],
        )
        d = episode_data_to_dict(data)
        assert d["title"] == "Test Title"
        assert d["episode_code"] == "ep-test"
        assert d["vocabulary"][0]["word"] == "test"

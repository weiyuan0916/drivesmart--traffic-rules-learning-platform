"""Unit tests for the transcript speaker-turn splitter.

Pure-function tests — no DB required. Lives next to test_episode_parser
because it consumes `EpisodeData.transcript` rather than raw HTML, so
the existing parser fixture isn't a good fit.
"""
from __future__ import annotations

from crawler.bbc.repository.episode_repository import (
    _looks_like_speaker_label,
    _split_transcript_into_segments,
)


class TestLooksLikeSpeakerLabel:
    def test_accepts_single_word_names(self):
        for name in ("Neil", "Georgie", "Sam", "Rob", "Finn", "Alice", "Phil", "Beth"):
            assert _looks_like_speaker_label(name), f"should accept {name!r}"

    def test_rejects_typical_sentence(self):
        for text in (
            "Hello world",
            "How are you today?",
            "I am learning English.",
            # Single-word sentence — not in the BBC host whitelist.
            "Reply",
            "Hello",
            "Thanks",
        ):
            assert not _looks_like_speaker_label(text), f"should reject {text!r}"

    def test_rejects_long_line(self):
        assert not _looks_like_speaker_label("A" * 100)

    def test_rejects_line_with_punctuation(self):
        assert not _looks_like_speaker_label("Neil.")

    def test_rejects_unknown_single_word(self):
        # "Bob" isn't a known BBC host (we don't crawl the DailyDictation
        # transcripts), so it must be rejected.
        assert not _looks_like_speaker_label("Bob")

    def test_accepts_known_multiword_speakers(self):
        assert _looks_like_speaker_label("Dr Karan Rajan")
        assert _looks_like_speaker_label("Ruth Alexander")
        assert _looks_like_speaker_label("Scott Dicker")

    def test_rejects_unknown_multiword(self):
        # Multi-word but not a known BBC host — treat as content, not label.
        assert not _looks_like_speaker_label("Hello World")
        assert not _looks_like_speaker_label("Castro Cromm")


class TestSplitTranscriptIntoSegments:
    def test_empty(self):
        assert _split_transcript_into_segments(None) == []
        assert _split_transcript_into_segments("") == []

    def test_single_turn(self):
        segs = _split_transcript_into_segments("Neil\nHello there everyone.\n")
        assert len(segs) == 1
        assert segs[0]["speaker"] == "Neil"
        assert "Hello there" in segs[0]["text"]

    def test_two_turns(self):
        transcript = "Neil\nHello world\n\nGeorgie\nAnd hello back\n"
        segs = _split_transcript_into_segments(transcript)
        assert len(segs) == 2
        assert segs[0]["speaker"] == "Neil"
        assert segs[1]["speaker"] == "Georgie"
        assert segs[0]["position"] == 0
        assert segs[1]["position"] == 1

    def test_multi_paragraph_under_one_speaker(self):
        transcript = "Neil\nFirst line\nSecond line\n\nGeorgie\nReply\n"
        segs = _split_transcript_into_segments(transcript)
        assert len(segs) == 2
        assert "First line" in segs[0]["text"]
        assert "Second line" in segs[0]["text"]
        assert "Reply" in segs[1]["text"]

    def test_known_multiword_speaker(self):
        transcript = "Dr Karan Rajan\nHistorically, probably not.\n\nNeil\nOK.\n"
        segs = _split_transcript_into_segments(transcript)
        assert len(segs) == 2
        assert segs[0]["speaker"] == "Dr Karan Rajan"
        assert segs[1]["speaker"] == "Neil"

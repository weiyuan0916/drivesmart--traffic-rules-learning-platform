"""Tests for config.py — slugify and constants."""
from pathlib import Path

from crawler.bbc.config import (
    BBC_BASE,
    LEARNING_ENGLISH_BASE,
    MASTER_INDEX,
    OUTPUT_ROOT,
    SEED_EPISODE_URLS,
    USER_AGENT,
    slugify,
)


class TestSlugify:
    def test_lowercases_and_dashes(self):
        assert slugify("Should animals be kept in zoos?") == "should-animals-be-kept-in-zoos"

    def test_strips_punctuation(self):
        assert slugify("Café — résumé!") == "cafe-resume"

    def test_collapses_multiple_dashes(self):
        assert slugify("hello --- world") == "hello-world"

    def test_strips_leading_trailing_dashes(self):
        assert slugify("---hello---") == "hello"

    def test_empty_returns_untitled(self):
        assert slugify("") == "untitled"
        assert slugify("   ") == "untitled"
        assert slugify(None) == "untitled"  # type: ignore[arg-type]

    def test_handles_only_punctuation(self):
        assert slugify("?!.") == "untitled"

    def test_truncates_long_input(self):
        long = "a" * 200
        result = slugify(long, max_length=80)
        assert len(result) == 80

    def test_preserves_numbers(self):
        assert slugify("Episode 2024 Part 1") == "episode-2024-part-1"

    def test_handles_unicode_accent_chars(self):
        assert slugify("naïve") == "naive"
        assert slugify("piñata") == "pinata"


class TestConstants:
    def test_output_root_is_path(self):
        assert isinstance(OUTPUT_ROOT, Path)

    def test_master_index_under_output_root(self):
        assert MASTER_INDEX.parent == OUTPUT_ROOT

    def test_user_agent_non_empty(self):
        assert len(USER_AGENT) > 20
        assert "Mozilla" in USER_AGENT

    def test_bbc_base_https(self):
        assert BBC_BASE.startswith("https://")
        assert LEARNING_ENGLISH_BASE.startswith("https://")

    def test_seed_urls_non_empty(self):
        assert len(SEED_EPISODE_URLS) > 0
        for url in SEED_EPISODE_URLS:
            assert "bbc.co.uk" in url
            assert "6-minute-english" in url

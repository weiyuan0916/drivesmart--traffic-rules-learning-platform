<?php

namespace Tests\Unit;

use App\Services\DictationScoringService;
use PHPUnit\Framework\TestCase;

class DictationScoringServiceTest extends TestCase
{
    private DictationScoringService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DictationScoringService();
    }

    // ==========================================================
    // TC-01: Exact match → 100% accuracy
    // ==========================================================
    public function test_exact_match_returns_100_percent(): void
    {
        $result = $this->service->scoreSegment(
            'Hello, this is 6 Minute English.',
            'Hello, this is 6 Minute English.'
        );

        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertEquals(0, $result['wrong_count']);
        $this->assertEquals(0, $result['missing_count']);
    }

    // ==========================================================
    // TC-02: All wrong → 0% accuracy
    // ==========================================================
    public function test_all_wrong_returns_zero_percent(): void
    {
        $result = $this->service->scoreSegment(
            'Hello, this is BBC.',
            'Yellow banana computer.'
        );

        $this->assertEquals(0.0, $result['accuracy']);
        $this->assertEquals(0, $result['correct_count']);
    }

    // ==========================================================
    // TC-03: Empty user input → 0% accuracy
    // ==========================================================
    public function test_empty_input_returns_zero_percent(): void
    {
        $result = $this->service->scoreSegment(
            'Hello, this is BBC.',
            ''
        );

        $this->assertEquals(0.0, $result['accuracy']);
        $this->assertEquals(0, $result['correct_count']);
        $this->assertEquals(4, $result['missing_count']); // hello, this, is, bbc
    }

    // ==========================================================
    // TC-04: Empty reference → 100% (edge case, no words to match)
    // ==========================================================
    public function test_empty_reference_returns_100_percent(): void
    {
        $result = $this->service->scoreSegment('', 'Hello world');

        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertEquals(0, $result['total_words']);
    }

    // ==========================================================
    // TC-05: Punctuation stripped in comparison
    // ==========================================================
    public function test_punctuation_stripped_from_comparison(): void
    {
        // Reference: "Hello, world!" → words: [hello, world]
        // User: "Hello world" → words: [hello, world]
        // Should be 100%
        $result = $this->service->scoreSegment(
            'Hello, world!',
            'Hello world'
        );

        $this->assertEquals(100.0, $result['accuracy']);
    }

    // ==========================================================
    // TC-06: Punctuation only stripped at word boundaries, not from contractions
    // ==========================================================
    public function test_contractions_preserved(): void
    {
        $result = $this->service->scoreSegment(
            "I don't think it's a good idea.",
            "I don't think it's a good idea."
        );

        $this->assertEquals(100.0, $result['accuracy']);
        // "don't" and "it's" should not become "dont" or "its"
        $this->assertContains("don't", $result['correct']);
        $this->assertContains("it's", $result['correct']);
    }

    // ==========================================================
    // TC-07: Case insensitive matching
    // ==========================================================
    public function test_case_insensitive_matching(): void
    {
        $result = $this->service->scoreSegment(
            'HELLO WORLD',
            'hello world'
        );

        $this->assertEquals(100.0, $result['accuracy']);
    }

    // ==========================================================
    // TC-08: Skip words excluded from both reference and user input
    // ==========================================================
    public function test_skip_words_excluded_from_scoring(): void
    {
        // Reference: "hello um world" → after skipping "um": [hello, world] (2 words)
        // User: "hello um world" → after skipping "um": [hello, world] (2 words)
        // Both match perfectly → 100% accuracy, total_words = 2 (reference after skip)
        $result = $this->service->scoreSegment(
            'hello um world',
            'hello um world'
        );

        $this->assertEquals(2, $result['total_words']); // um excluded from reference
        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertContains('hello', $result['correct']);
        $this->assertContains('world', $result['correct']);
        $this->assertNotContains('um', $result['correct']);
        $this->assertNotContains('um', $result['wrong']);
    }

    // ==========================================================
    // TC-09: Skip word in user input does not count as extra
    // ==========================================================
    public function test_skip_word_in_user_input_not_counted_as_extra(): void
    {
        // Reference: "hello world" (3 words, um skipped)
        // User: "hello um world" (um should be ignored)
        $result = $this->service->scoreSegment(
            'hello world',
            'hello um world'
        );

        // um should be filtered out, leaving 3 reference words and 2 user words
        // "hello" and "world" match, 1 "world" missing... wait
        // Reference normalized: [hello, world], User normalized: [hello, world]
        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertEquals(0, $result['wrong_count']);
        $this->assertEquals(0, $result['missing_count']);
    }

    // ==========================================================
    // TC-10: Word multiplicity — "the the" vs "the" counts 1 correct
    // ==========================================================
    public function test_word_multiplicity_respected(): void
    {
        // Reference: [the, the, cat]
        // User: [the, cat]
        // Should count: 1 "the" correct (one remains missing), "cat" correct
        $result = $this->service->scoreSegment(
            'the the cat sat',
            'the cat sat'
        );

        // After normalization: ref=[the, the, cat, sat], user=[the, cat, sat]
        // Multiset: ref has {the:2, cat:1, sat:1}, user has {the:1, cat:1, sat:1}
        // Matches: the(1), cat(1), sat(1) = 3 correct, 1 the missing
        $this->assertEquals(3, $result['correct_count']);
        $this->assertEquals(1, $result['missing_count']); // one "the" is missing
        $this->assertEquals(0, $result['wrong_count']);
        // 3/4 = 75%
        $this->assertEquals(75.0, $result['accuracy']);
    }

    // ==========================================================
    // TC-11: Extra words in user input counted as wrong
    // ==========================================================
    public function test_extra_words_counted_as_wrong(): void
    {
        // Reference: "hello world"
        // User: "hello beautiful world"
        // hello + world = 2 correct, beautiful = extra
        $result = $this->service->scoreSegment(
            'hello world',
            'hello beautiful world'
        );

        $this->assertEquals(2, $result['correct_count']);
        $this->assertEquals(1, $result['wrong_count']);
        $this->assertEquals(0, $result['missing_count']);
        // 2/2 = 100% (only measuring against reference words)
        $this->assertEquals(100.0, $result['accuracy']);
    }

    // ==========================================================
    // TC-12: Missing words counted correctly
    // ==========================================================
    public function test_missing_words_counted_correctly(): void
    {
        // Reference: "hello beautiful world"
        // User: "hello world"
        // hello + world = 2 correct, beautiful = missing
        $result = $this->service->scoreSegment(
            'hello beautiful world',
            'hello world'
        );

        $this->assertEquals(2, $result['correct_count']);
        $this->assertEquals(0, $result['wrong_count']);
        $this->assertEquals(1, $result['missing_count']);
        $this->assertContains('beautiful', $result['missing']);
    }

    // ==========================================================
    // TC-13: Mixed — correct, wrong, missing all present
    // ==========================================================
    public function test_mixed_correct_wrong_missing(): void
    {
        // Reference: "hello world today"
        // User: "hello universe today"
        // hello + today = correct (2), world = missing, universe = wrong
        $result = $this->service->scoreSegment(
            'hello world today',
            'hello universe today'
        );

        $this->assertEquals(2, $result['correct_count']);
        $this->assertEquals(1, $result['wrong_count']);
        $this->assertEquals(1, $result['missing_count']);
        $this->assertContains('world', $result['missing']);
        $this->assertContains('universe', $result['wrong']);
    }

    // ==========================================================
    // TC-14: Accuracy rounded to 1 decimal
    // ==========================================================
    public function test_accuracy_rounded_to_one_decimal(): void
    {
        // Reference: "one two three"
        // User: "one two"
        // 2/3 = 66.666...% → 66.7%
        $result = $this->service->scoreSegment(
            'one two three',
            'one two'
        );

        $this->assertEquals(66.7, $result['accuracy']);
    }

    // ==========================================================
    // TC-15: Returns correct array keys
    // ==========================================================
    public function test_returns_correct_array_keys(): void
    {
        $result = $this->service->scoreSegment('hello world', 'hello world');

        $this->assertArrayHasKey('correct', $result);
        $this->assertArrayHasKey('wrong', $result);
        $this->assertArrayHasKey('missing', $result);
        $this->assertArrayHasKey('accuracy', $result);
        $this->assertArrayHasKey('total_words', $result);
        $this->assertArrayHasKey('correct_count', $result);
        $this->assertArrayHasKey('wrong_count', $result);
        $this->assertArrayHasKey('missing_count', $result);
    }

    // ==========================================================
    // TC-16: Set-based (order insensitive) — different order still matches
    // ==========================================================
    public function test_order_insensitive_matching(): void
    {
        // Reference: "hello world today"
        // User: "today world hello" (same words, different order)
        $result = $this->service->scoreSegment(
            'hello world today',
            'today world hello'
        );

        // All 3 words match (order doesn't matter in set-based matching)
        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertEquals(3, $result['correct_count']);
        $this->assertEquals(0, $result['wrong_count']);
        $this->assertEquals(0, $result['missing_count']);
    }

    // ==========================================================
    // TC-17: Apostrophe variants normalized
    // ==========================================================
    public function test_apostrophe_variants_normalized(): void
    {
        // Reference uses curly apostrophe, user uses straight
        $result = $this->service->scoreSegment(
            "I don\u{2019}t know.",   // "I don't know." with right single quote
            "I don't know."
        );

        $this->assertEquals(100.0, $result['accuracy']);
    }

    // ==========================================================
    // TC-18: Hyphenated words preserved
    // ==========================================================
    public function test_hyphenated_words_preserved(): void
    {
        $result = $this->service->scoreSegment(
            'Well-known facts.',
            'Well-known facts.'
        );

        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertContains('well-known', $result['correct']);
    }
}

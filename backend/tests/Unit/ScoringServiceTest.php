<?php

namespace Tests\Unit;

use App\Services\ScoringService;
use PHPUnit\Framework\TestCase;

class ScoringServiceTest extends TestCase
{
    private ScoringService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ScoringService();
    }

    // ==========================================================
    // TC-01: Perfect match
    // ==========================================================
    public function test_perfect_match_returns_100_percent(): void
    {
        $expected = ['hello', 'world'];
        $user = ['hello', 'world'];

        $correct = $this->service->lcsCount($expected, $user);

        $this->assertEquals(2, $correct);
    }

    // ==========================================================
    // TC-02: Empty user input
    // ==========================================================
    public function test_empty_user_input_returns_zero_correct(): void
    {
        $expected = ['hello', 'world'];
        $user = [];

        $correct = $this->service->lcsCount($expected, $user);

        $this->assertEquals(0, $correct);
    }

    // ==========================================================
    // TC-03: Empty expected (no transcript)
    // ==========================================================
    public function test_empty_expected_returns_zero_correct(): void
    {
        $expected = [];
        $user = ['hello', 'world'];

        $correct = $this->service->lcsCount($expected, $user);

        $this->assertEquals(0, $correct);
    }

    // ==========================================================
    // TC-04: Partial match (one word missing)
    // ==========================================================
    public function test_partial_match_counts_correctly(): void
    {
        $expected = ['hello', 'world'];
        $user = ['hello'];

        $correct = $this->service->lcsCount($expected, $user);

        $this->assertEquals(1, $correct);
    }

    // ==========================================================
    // TC-05: Extra words in user input
    // ==========================================================
    public function test_extra_words_do_not_count_as_correct(): void
    {
        $expected = ['hello', 'world'];
        $user = ['hello', 'universe', 'world'];

        $correct = $this->service->lcsCount($expected, $user);

        // LCS finds "hello world" = 2 correct out of 2 expected
        $this->assertEquals(2, $correct);
    }

    // ==========================================================
    // TC-06: Contractions — don't ≠ dont
    // ==========================================================
    public function test_contractions_are_preserved_dont_not_dont(): void
    {
        $normalized = $this->service->normalize("don't worry");

        $this->assertContains("don't", $normalized);
        $this->assertNotContains("dont", $normalized);
        $this->assertCount(2, $normalized);
    }

    // ==========================================================
    // TC-07: Contractions — can't ≠ cant
    // ==========================================================
    public function test_contractions_are_preserved_cant_not_cant(): void
    {
        $normalized = $this->service->normalize("i can't go");

        $this->assertContains("can't", $normalized);
        $this->assertNotContains("cant", $normalized);
        $this->assertCount(3, $normalized);
    }

    // ==========================================================
    // TC-08: Contractions — I'm ≠ Im
    // ==========================================================
    public function test_contractions_are_preserved_im_not_im(): void
    {
        $normalized = $this->service->normalize("I'm learning");

        $this->assertContains("i'm", $normalized);
        $this->assertNotContains("im", $normalized);
        $this->assertCount(2, $normalized);
    }

    // ==========================================================
    // TC-09: Contractions — it's ≠ its
    // ==========================================================
    public function test_contractions_are_preserved_its_not_its(): void
    {
        $normalized = $this->service->normalize("it's raining");

        $this->assertContains("it's", $normalized);
        $this->assertNotContains("its", $normalized);
        $this->assertCount(2, $normalized);
    }

    // ==========================================================
    // TC-10: Punctuation stripped at boundaries
    // ==========================================================
    public function test_trailing_punctuation_stripped(): void
    {
        $normalized = $this->service->normalize("hello, world!");

        $this->assertContains("hello", $normalized);
        $this->assertContains("world", $normalized);
        $this->assertNotContains("world!", $normalized);
        $this->assertNotContains("hello,", $normalized);
    }

    // ==========================================================
    // TC-11: Capitalization normalized to lowercase
    // ==========================================================
    public function test_capitalization_normalized_to_lowercase(): void
    {
        $normalized = $this->service->normalize("HELLO WORLD");

        $this->assertContains("hello", $normalized);
        $this->assertContains("world", $normalized);
        $this->assertNotContains("HELLO", $normalized);
        $this->assertCount(2, $normalized);
    }

    // ==========================================================
    // TC-12: Multiple whitespace collapsed
    // ==========================================================
    public function test_multiple_whitespace_collapsed(): void
    {
        $normalized = $this->service->normalize("hello    world");

        $this->assertCount(2, $normalized);
        $this->assertEquals(['hello', 'world'], $normalized);
    }

    // ==========================================================
    // TC-13: Real sentence with contractions
    // ==========================================================
    public function test_real_sentence_with_contractions(): void
    {
        // "I don't think it's a good idea" = 7 words (not 8)
        $normalized = $this->service->normalize("I don't think it's a good idea");

        $this->assertCount(7, $normalized);
        $this->assertContains("i", $normalized);
        $this->assertContains("don't", $normalized);
        $this->assertContains("it's", $normalized);
        $this->assertNotContains("dont", $normalized);
        $this->assertNotContains("its", $normalized);
    }

    // ==========================================================
    // TC-14: Contraction as standalone (I'm → "i'm")
    // ==========================================================
    public function test_im_contraction_lowercased(): void
    {
        $normalized = $this->service->normalize("I'm happy");

        $this->assertContains("i'm", $normalized);
        $this->assertNotContains("Im", $normalized);
        $this->assertNotContains("i", $normalized);  // "i" alone not present
    }

    // ==========================================================
    // TC-15: Word result generation — correct, wrong, missing, extra
    // ==========================================================
    public function test_word_results_generates_correct_statuses(): void
    {
        $expected = ['hello', 'world'];
        $user = ['hello', 'universe'];

        $results = $this->service->generateWordResults($expected, $user);

        $statuses = array_column($results, 'status');

        $this->assertContains('correct', $statuses);   // hello
        $this->assertContains('extra', $statuses);    // universe
        $this->assertContains('missing', $statuses);  // world
    }

    // ==========================================================
    // TC-16: Word result generation — all correct
    // ==========================================================
    public function test_word_results_all_correct(): void
    {
        $expected = ['hello', 'world'];
        $user = ['hello', 'world'];

        $results = $this->service->generateWordResults($expected, $user);

        foreach ($results as $result) {
            $this->assertEquals('correct', $result['status']);
        }
    }
}

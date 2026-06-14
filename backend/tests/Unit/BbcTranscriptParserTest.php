<?php

namespace Tests\Unit;

use App\Services\BbcTranscriptParser;
use PHPUnit\Framework\TestCase;

class BbcTranscriptParserTest extends TestCase
{
    private BbcTranscriptParser $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new BbcTranscriptParser();
    }

    // ==========================================================
    // TC-01: stripSpeakerLabels removes NEIL, Pippa:, etc.
    // ==========================================================
    public function test_strips_speaker_labels(): void
    {
        $text = <<<TEXT
NEIL Hello, this is 6 Minute English.
PIPPA And I'm Pippa. Today we're talking about food.
TEXT;

        $result = $this->parser->stripSpeakerLabels($text);

        $this->assertStringNotContainsString('NEIL', $result);
        $this->assertStringNotContainsString('PIPPA', $result);
        $this->assertStringContainsString('Hello, this is 6 Minute English.', $result);
        $this->assertStringContainsString("And I'm Pippa.", $result);
    }

    // ==========================================================
    // TC-02: stripSpeakerLabels handles lowercase speaker labels
    // ==========================================================
    public function test_strips_lowercase_speaker_labels(): void
    {
        $text = "Neil: Hello, this is Neil.\nNeil: And I'm Neil again.";

        $result = $this->parser->stripSpeakerLabels($text);

        $this->assertStringNotContainsString('Neil:', $result);
        $this->assertStringContainsString("Hello, this is Neil.", $result);
    }

    // ==========================================================
    // TC-03: splitIntoSegments splits on sentence boundaries
    // ==========================================================
    public function test_splits_on_sentence_boundaries(): void
    {
        // Test with long sentences (>20 words each) — they get split independently
        $long = "Today we are going to discuss very important topics about advertising strategies that affect people globally and we will talk about how they work in practice in the real world everyday.";
        $long2 = "That is why many people around the world are concerned about how to manage their spending habits and budget their money carefully for the future.";

        $text = "Neil: " . $long . " " . $long2;

        $segments = $this->parser->splitIntoSegments($text);

        // At least 2 segments (each long sentence should be its own segment)
        $this->assertGreaterThanOrEqual(2, count($segments));
    }

    // ==========================================================
    // TC-04: mergeShortSentences merges < 3 word sentences with next
    // ==========================================================
    public function test_merges_short_sentences(): void
    {
        $text = "Hello. This is Neil. Today we discuss advertising. That's all.";

        $segments = $this->parser->splitIntoSegments($text);

        // "Hello." (1 word) should merge with "This is Neil."
        // Check that no segment has < 3 words (except possibly the last)
        foreach (array_slice($segments, 0, -1) as $seg) {
            $this->assertGreaterThanOrEqual(3, $seg['word_count'], "Segment with text '{$seg['text']}' has fewer than 3 words");
        }
    }

    // ==========================================================
    // TC-05: word_count is accurate
    // ==========================================================
    public function test_word_count_accurate(): void
    {
        $text = "Hello world today.";

        $segments = $this->parser->splitIntoSegments($text);

        $this->assertEquals(3, $segments[0]['word_count']);
    }

    // ==========================================================
    // TC-06: difficulty assigned correctly
    // ==========================================================
    public function test_difficulty_assigned(): void
    {
        // Easy: < 8 words
        $easy = "Hello world today.";
        // Hard: > 12 words
        $hard = "Hello world today this is a very long sentence that should be marked as hard.";

        $easySegments = $this->parser->splitIntoSegments($easy);
        $hardSegments = $this->parser->splitIntoSegments($hard);

        $this->assertEquals('easy', $easySegments[0]['difficulty']);
        $this->assertEquals('hard', $hardSegments[0]['difficulty']);
    }

    // ==========================================================
    // TC-07: estimated_duration calculated
    // ==========================================================
    public function test_estimated_duration_calculated(): void
    {
        $text = "Hello world today is a lovely day for learning English.";

        $segments = $this->parser->splitIntoSegments($text);

        $this->assertArrayHasKey('estimated_duration', $segments[0]);
        $this->assertIsInt($segments[0]['estimated_duration']);
        $this->assertGreaterThan(0, $segments[0]['estimated_duration']);
    }

    // ==========================================================
    // TC-08: normalizeSegmentText trims and cleans whitespace
    // ==========================================================
    public function test_normalize_text_trims_and_cleans(): void
    {
        $text = "   Hello   world!   \n\n  Today    is   great.   ";

        $result = $this->parser->normalizeSegmentText($text);

        $this->assertStringStartsWith('Hello', $result);
        $this->assertStringEndsWith('great.', $result);
        $this->assertStringNotContainsString('  ', $result); // no double spaces
    }

    // ==========================================================
    // TC-09: time_markers increment correctly
    // ==========================================================
    public function test_time_markers_increment(): void
    {
        $text = "First sentence here. Second sentence goes here. Third sentence.";

        $segments = $this->parser->splitIntoSegments($text);

        for ($i = 1; $i < count($segments); $i++) {
            $this->assertGreaterThan(
                $segments[$i - 1]['start_time'],
                $segments[$i]['start_time'],
                "Segment {$i} start_time should be greater than segment " . ($i - 1)
            );
        }
    }

    // ==========================================================
    // TC-10: segments have index field
    // ==========================================================
    public function test_segments_have_index(): void
    {
        $text = "First. Second. Third.";

        $segments = $this->parser->splitIntoSegments($text);

        for ($i = 0; $i < count($segments); $i++) {
            $this->assertEquals($i, $segments[$i]['index']);
        }
    }

    // ==========================================================
    // TC-11: handles empty text gracefully
    // ==========================================================
    public function test_handles_empty_text(): void
    {
        $segments = $this->parser->splitIntoSegments('');

        $this->assertIsArray($segments);
        $this->assertEmpty($segments);
    }

    // ==========================================================
    // TC-12: removes introduction phrase
    // ==========================================================
    public function test_removes_page_numbers_and_footers(): void
    {
        $text = "Page 1 of 5\nHello world.\nPage 2 of 5\nGoodbye.";

        $result = $this->parser->stripSpeakerLabels($text);

        $this->assertStringNotContainsString('Page 1 of 5', $result);
        $this->assertStringNotContainsString('Page 2 of 5', $result);
        $this->assertStringContainsString('Hello world.', $result);
        $this->assertStringContainsString('Goodbye.', $result);
    }
}

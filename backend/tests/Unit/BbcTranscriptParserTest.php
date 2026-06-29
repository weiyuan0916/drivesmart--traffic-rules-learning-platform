<?php

namespace Tests\Unit;

use App\Services\BbcTranscriptParser;
use PHPUnit\Framework\TestCase;

/**
 * BbcTranscriptParser is DEPRECATED as of 2026-06-16.
 *
 * These tests verify that the parser is a safe no-op. They replace the
 * previous behavior-driven tests (which exercised the actual parser
 * logic) because that behavior violated .cursor/rules/bbc-feature.mdc
 * by downloading BBC PDFs and storing transcripts.
 *
 * Compliance: .cursor/rules/bbc-feature.mdc
 *
 * The parser is kept in the codebase so existing import sites compile,
 * but it returns empty values to prevent any accidental content
 * rehosting. A new "user_provided" model handles dictation instead.
 *
 * @group bbc
 * @group bbc-compliance
 */
class BbcTranscriptParserTest extends TestCase
{
    private BbcTranscriptParser $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new BbcTranscriptParser();
    }

    public function test_parser_is_a_no_op_for_safety(): void
    {
        // The deprecated parser returns its input unchanged for the simple
        // text helpers, and an empty array for splitIntoSegments. This
        // ensures no BBC transcript content is ever produced.
        $this->assertSame('NEIL: Hello world.', $this->parser->stripSpeakerLabels('NEIL: Hello world.'));
        $this->assertSame('  unchanged  ', $this->parser->normalizeSegmentText('  unchanged  '));
        $this->assertSame([], $this->parser->splitIntoSegments('Any input text here.'));
    }

    public function test_parser_does_not_split_segments(): void
    {
        // Previously this would return array of segments with BBC transcript text.
        // Now it must return empty array to prevent content rehosting.
        $segments = $this->parser->splitIntoSegments('First. Second. Third.');

        $this->assertIsArray($segments);
        $this->assertEmpty($segments);
    }

    public function test_parser_handles_empty_input_safely(): void
    {
        $this->assertSame([], $this->parser->splitIntoSegments(''));
        $this->assertSame('', $this->parser->stripSpeakerLabels(''));
        $this->assertSame('', $this->parser->normalizeSegmentText(''));
    }
}

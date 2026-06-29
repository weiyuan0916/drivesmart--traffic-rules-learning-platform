<?php

namespace App\Services;

/**
 * BBC Transcript Parser — DEPRECATED since 2026-06-16
 *
 * This service previously parsed BBC Learning English PDF transcripts and split
 * them into 3-20 second segments for the dictation feature.
 *
 * ⚠️  This behavior violates our content policy defined in
 * .cursor/rules/bbc-feature.mdc:
 *   • Do NOT download BBC audio files
 *   • Do NOT rehost BBC audio
 *   • Do NOT store BBC transcripts
 *   • Do NOT republish BBC content
 *
 * The class is kept for backward compatibility with existing tests
 * (BbcTranscriptParserTest.php) but no new code should call it. Methods now
 * return empty values to prevent accidental violations.
 *
 * The replacement strategy is the "user_provided" dictation model:
 * users supply their own audio + transcript, and DriveSmart provides
 * scoring + segment splitting tools without ever rehosting BBC content.
 *
 * @deprecated since 2026-06-16. Will be removed in next major cleanup.
 */
class BbcTranscriptParser
{
    private const WORDS_PER_SECOND = 2;

    public function stripSpeakerLabels(string $text): string
    {
        return $text;
    }

    public function normalizeSegmentText(string $text): string
    {
        return $text;
    }

    public function splitIntoSegments(string $rawText): array
    {
        return [];
    }

    private function buildSegment(int $index, string $text, int $wordCount, int $startTime): array
    {
        return [];
    }

    private function countWords(string $text): int
    {
        return 0;
    }

    private function assignDifficulty(int $wordCount): string
    {
        return 'easy';
    }
}

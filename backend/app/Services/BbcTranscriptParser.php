<?php

namespace App\Services;

class BbcTranscriptParser
{
    private const WORDS_PER_SECOND = 2;

    public function stripSpeakerLabels(string $text): string
    {
        // Remove BBC Learning English footer text
        $text = preg_replace('/bbclearningenglish\.com\s*page\s*\d+\s*of\s*\d+/i', '', $text);
        $text = preg_replace('/6 minute english\s*©british broadcasting corporation\s*\d{4}/i', '', $text);

        // Remove speaker labels: NEIL, Pippa:, neil:, etc.
        // Pattern: start of line or newline + uppercase word(s) optionally followed by colon
        $text = preg_replace('/^[A-Z]{2,}\s*/m', '', $text);
        $text = preg_replace('/^[A-Z][a-z]+\s*:\s*/m', '', $text);
        $text = preg_replace('/^[a-z][a-z0-9]*\s*:\s*/m', '', $text);

        // Remove timestamps: 00:00, 0:00, [00:00]
        $text = preg_replace('/\[?\d{1,2}:\d{2}(:\d{2})?\]?\s*/', '', $text);

        // Remove page numbers: Page 1 of 5
        $text = preg_replace('/page\s+\d+\s+of\s+\d+/i', '', $text);

        return $text;
    }

    public function normalizeSegmentText(string $text): string
    {
        // Normalize whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

    /**
     * Split raw transcript text into segments.
     * Rules from design Section 8.2:
     * - Split on sentence-ending punctuation (. ! ?)
     * - Merge very short sentences (< 3 words) with next
     * - Cap at 20 words per segment
     * - Assign difficulty
     * - Calculate cumulative time markers
     */
    public function splitIntoSegments(string $rawText): array
    {
        $text = $this->stripSpeakerLabels($rawText);
        $text = $this->normalizeSegmentText($text);

        if (empty(trim($text))) {
            return [];
        }

        // Split on sentence boundaries
        $sentences = preg_split('/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $segments = [];
        $currentSegment = '';
        $currentWordCount = 0;
        $cumulativeTime = 0;

        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if (empty($sentence)) {
                continue;
            }

            $wordCount = $this->countWords($sentence);

            // If this sentence alone exceeds 20 words, split it further
            if ($wordCount > 20) {
            // Flush current segment first
            if ($currentWordCount > 0) {
                $segments[] = $this->buildSegment(count($segments), $currentSegment, $currentWordCount, $cumulativeTime);
                $cumulativeTime += (int) ceil($currentWordCount / self::WORDS_PER_SECOND);
                $currentSegment = '';
                $currentWordCount = 0;
            }

            // Split long sentence by clauses (commas, dashes)
            $clauses = preg_split('/(?<=[,;])\s+/', $sentence, -1, PREG_SPLIT_NO_EMPTY);
            foreach ($clauses as $clause) {
                $clauseWords = $this->countWords($clause);
                if ($clauseWords > 0) {
                    $segments[] = $this->buildSegment(count($segments), trim($clause), $clauseWords, $cumulativeTime);
                    $cumulativeTime += (int) ceil($clauseWords / self::WORDS_PER_SECOND);
                }
            }
                continue;
            }

            // Check if adding this sentence would exceed 20 words
            if ($currentWordCount + $wordCount > 20) {
                // Flush current segment
                if ($currentWordCount > 0) {
                    $segments[] = $this->buildSegment(count($segments), $currentSegment, $currentWordCount, $cumulativeTime);
                    $cumulativeTime += (int) ceil($currentWordCount / self::WORDS_PER_SECOND);
                }
                $currentSegment = $sentence;
                $currentWordCount = $wordCount;
            } else {
                // Merge: append to current segment
                if ($currentWordCount > 0) {
                    $currentSegment .= ' ' . $sentence;
                    $currentWordCount += $wordCount;
                } else {
                    $currentSegment = $sentence;
                    $currentWordCount = $wordCount;
                }
            }
        }

        // Flush remaining segment
        if ($currentWordCount > 0) {
            $segments[] = $this->buildSegment(count($segments), $currentSegment, $currentWordCount, $cumulativeTime);
        }

        return $segments;
    }

    private function buildSegment(int $index, string $text, int $wordCount, int $startTime): array
    {
        $estimatedDuration = (int) ceil($wordCount / self::WORDS_PER_SECOND);
        $endTime = $startTime + $estimatedDuration;

        return [
            'id' => $index,
            'index' => $index,
            'text' => $text,
            'word_count' => $wordCount,
            'difficulty' => $this->assignDifficulty($wordCount),
            'estimated_duration' => $estimatedDuration,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }

    private function countWords(string $text): int
    {
        $words = preg_split('/\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);
        return count(array_filter($words, fn ($w) => strlen($w) > 0));
    }

    private function assignDifficulty(int $wordCount): string
    {
        if ($wordCount < 8) {
            return 'easy';
        }
        if ($wordCount <= 12) {
            return 'medium';
        }
        return 'hard';
    }
}

<?php

namespace App\Services;

class DictationScoringService
{
    private const SKIP_WORDS = [
        'um', 'uh', 'er', 'eh',
        'yeah', 'ok', 'okay',
        'mm', 'mmm', 'hmm',
    ];

    public function scoreSegment(string $reference, string $userInput): array
    {
        $refWords = $this->normalize($reference);
        $userWords = $this->normalize($userInput);

        $totalWords = count($refWords);

        if ($totalWords === 0) {
            return [
                'correct' => [],
                'wrong' => [],
                'missing' => [],
                'accuracy' => 100.0,
                'total_words' => 0,
                'correct_count' => 0,
                'wrong_count' => 0,
                'missing_count' => 0,
            ];
        }

        // Multiset-based matching: count occurrences of each word
        $refMultiset = $this->buildMultiset($refWords);
        $userMultiset = $this->buildMultiset($userWords);

        $correct = [];
        $wrong = [];
        $missing = [];

        // Count correct matches
        foreach ($refMultiset as $word => $refCount) {
            $userCount = $userMultiset[$word] ?? 0;
            $matched = min($refCount, $userCount);
            for ($i = 0; $i < $matched; $i++) {
                $correct[] = $word;
            }
            // Remaining reference occurrences are missing
            for ($i = 0; $i < $refCount - $matched; $i++) {
                $missing[] = $word;
            }
            // Remaining user occurrences beyond what matched are wrong
            $extraUserCount = $userCount - $matched;
            for ($i = 0; $i < $extraUserCount; $i++) {
                $wrong[] = $word;
            }
        }

        // Remaining user words not in reference at all → wrong
        foreach ($userMultiset as $word => $userCount) {
            if (! isset($refMultiset[$word])) {
                for ($i = 0; $i < $userCount; $i++) {
                    $wrong[] = $word;
                }
            }
        }

        $correctCount = count($correct);
        $accuracy = round(($correctCount / $totalWords) * 100, 1);

        return [
            'correct' => $correct,
            'wrong' => $wrong,
            'missing' => $missing,
            'accuracy' => $accuracy,
            'total_words' => $totalWords,
            'correct_count' => $correctCount,
            'wrong_count' => count($wrong),
            'missing_count' => count($missing),
        ];
    }

    /**
     * Normalize text for comparison:
     * - lowercase
     * - normalize apostrophe variants to ASCII apostrophe
     * - strip punctuation at word boundaries
     * - preserve apostrophes inside words (contractions)
     * - collapse whitespace
     * - filter out skip words
     */
    public function normalize(string $text): array
    {
        $text = mb_strtolower($text);

        // Normalize all apostrophe variants to ASCII apostrophe
        // Handles: ' (U+2019), ' (U+2018), ' (U+201B), ' (modifier letter)
        $text = preg_replace('/[\x{2018}\x{2019}\x{201B}\x{02BC}]/u', "'", $text);

        // Split on whitespace
        $words = preg_split('/\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        $normalized = [];
        foreach ($words as $word) {
            $hasApostrophe = str_contains($word, "'");

            // Strip leading punctuation (but keep letters, numbers, apostrophe)
            $word = preg_replace('/^[^\p{L}\p{N}\']+/u', '', $word);

            // Strip trailing punctuation
            if ($hasApostrophe && substr($word, -1) === "'") {
                // Contraction: strip other trailing punctuation, preserve apostrophe
                $word = preg_replace('/[^\p{L}\p{N}]+$/u', '', $word) . "'";
            } else {
                $word = preg_replace('/[^\p{L}\p{N}\']+$/u', '', $word);
            }

            // Skip empty words and lone apostrophes
            if ($word === '' || $word === "'") {
                continue;
            }

            // Skip filler words
            if (in_array($word, self::SKIP_WORDS, true)) {
                continue;
            }

            $normalized[] = $word;
        }

        return $normalized;
    }

    private function buildMultiset(array $words): array
    {
        $multiset = [];
        foreach ($words as $word) {
            if (! isset($multiset[$word])) {
                $multiset[$word] = 0;
            }
            $multiset[$word]++;
        }
        return $multiset;
    }
}

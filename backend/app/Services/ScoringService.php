<?php

namespace App\Services;

class ScoringService
{
    /**
     * Score a user's transcript against the expected transcript.
     *
     * @param  string  $userInput  The user's transcribed text
     * @param  string  $clipId     The lesson clip ID (for fetching expected transcript from DB)
     * @param  int|null $userId    The user ID (for future analytics hooks)
     * @return array
     */
    public function score(string $userInput, string $clipId, ?int $userId = null): array
    {
        $clip = \App\Models\LessonClip::find($clipId);
        $expected = $clip?->transcript ?? '';

        $userWords = $this->normalize($userInput);
        $expectedWords = $this->normalize($expected);

        $totalExpected = count($expectedWords);

        if ($totalExpected === 0) {
            return [
                'accuracy' => 100.0,
                'xp_earned' => 0,
                'correct_count' => 0,
                'wrong_count' => 0,
                'missing_count' => 0,
                'extra_count' => 0,
                'total_words' => 0,
                'word_results' => [],
            ];
        }

        $correctCount = $this->lcsCount($expectedWords, $userWords);
        $accuracy = round(($correctCount / $totalExpected) * 100, 1);
        $xpEarned = max(0, (int) round($accuracy * 0.1));

        $wordResults = $this->generateWordResults($expectedWords, $userWords);

        return [
            'accuracy' => $accuracy,
            'xp_earned' => $xpEarned,
            'correct_count' => $correctCount,
            'wrong_count' => count(array_filter($wordResults, fn($r) => $r['status'] === 'wrong')),
            'missing_count' => count(array_filter($wordResults, fn($r) => $r['status'] === 'missing')),
            'extra_count' => count(array_filter($wordResults, fn($r) => $r['status'] === 'extra')),
            'total_words' => $totalExpected,
            'word_results' => $wordResults,
        ];
    }

    /**
     * Normalize text for comparison:
     * - lowercase
     * - strip leading/trailing punctuation only
     * - preserve apostrophes inside words (contractions)
     * - collapse multiple whitespace
     */
    public function normalize(string $text): array
    {
        $text = mb_strtolower($text);

        // Normalize all apostrophe variants to ASCII apostrophe
        // Handles: ' (U+2019), ' (U+2018), ' (U+201B)
        $text = preg_replace('/[\x{2018}\x{2019}\x{201B}]/u', "'", $text);

        // Strip leading and trailing punctuation from each word
        // Keep ASCII apostrophes inside words (contractions like don't, I'm, can't)
        $words = preg_split('/\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        $normalized = [];
        foreach ($words as $word) {
            // Detect if this is a contraction (word contains an apostrophe)
            $hasApostrophe = str_contains($word, "'");

            // Strip leading punctuation
            $word = preg_replace('/^[^\p{L}\p{N}\']+/u', '', $word);

            // Strip trailing punctuation, but preserve trailing apostrophe if contraction
            if ($hasApostrophe && substr($word, -1) === "'") {
                // Restore the trailing apostrophe after stripping other punctuation
                $word = preg_replace('/[^\p{L}\p{N}]+$/u', '', $word) . "'";
            } else {
                $word = preg_replace('/[^\p{L}\p{N}]+$/u', '', $word);
            }

            if ($word !== '' && $word !== "'") {
                $normalized[] = $word;
            }
        }

        return $normalized;
    }

    /**
     * Count the LCS (Longest Common Subsequence) between expected and user words.
     * Returns the number of correctly placed words.
     */
    public function lcsCount(array $expected, array $user): int
    {
        $m = count($expected);
        $n = count($user);

        if ($m === 0 || $n === 0) {
            return 0;
        }

        // Optimized: only keep last two rows
        $prev = array_fill(0, $n + 1, 0);
        $curr = array_fill(0, $n + 1, 0);

        for ($i = 1; $i <= $m; $i++) {
            for ($j = 1; $j <= $n; $j++) {
                if ($expected[$i - 1] === $user[$j - 1]) {
                    $curr[$j] = $prev[$j - 1] + 1;
                } else {
                    $curr[$j] = $prev[$j] > $curr[$j - 1] ? $prev[$j] : $curr[$j - 1];
                }
            }
            // Swap rows
            [$prev, $curr] = [$curr, $prev];
            // Reset curr for next iteration
            $curr = array_fill(0, $n + 1, 0);
        }

        return $prev[$n];
    }

    /**
     * Generate per-word result with status: correct, wrong, missing, extra.
     * Uses a greedy alignment approach.
     */
    public function generateWordResults(array $expected, array $user): array
    {
        $results = [];
        $userIndex = 0;

        for ($i = 0; $i < count($expected); $i++) {
            $expectedWord = $expected[$i];

            // Try to find this word in user input at current position
            if ($userIndex < count($user) && $expectedWord === $user[$userIndex]) {
                // Perfect match at current position
                $results[] = [
                    'word' => $expectedWord,
                    'status' => 'correct',
                ];
                $userIndex++;
            } else {
                // Search ahead in user input for this expected word
                $foundIndex = false;
                for ($j = $userIndex; $j < count($user); $j++) {
                    if ($expectedWord === $user[$j]) {
                        // Mark words between userIndex and j as "extra"
                        for ($k = $userIndex; $k < $j; $k++) {
                            $results[] = [
                                'word' => $user[$k],
                                'status' => 'extra',
                                'expected' => null,
                            ];
                        }
                        $results[] = [
                            'word' => $expectedWord,
                            'status' => 'correct',
                        ];
                        $userIndex = $j + 1;
                        $foundIndex = true;
                        break;
                    }
                }

                if (!$foundIndex) {
                    // Word not found in user input — it's missing
                    $results[] = [
                        'word' => $expectedWord,
                        'status' => 'missing',
                        'expected' => $expectedWord,
                    ];
                }
            }
        }

        // Remaining user words are "extra"
        while ($userIndex < count($user)) {
            $results[] = [
                'word' => $user[$userIndex],
                'status' => 'extra',
                'expected' => null,
            ];
            $userIndex++;
        }

        return $results;
    }
}

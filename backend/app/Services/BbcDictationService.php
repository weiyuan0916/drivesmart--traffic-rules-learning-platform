<?php

namespace App\Services;

use App\Models\ListeningExternalLesson;
use App\Models\User;
use App\Models\UserExternalLessonSegment;

/**
 * BbcDictationService — dictation session + scoring for BBC lessons.
 *
 * Compliance: .cursor/rules/bbc-feature.mdc
 * This service is the only place in the BBC stack that knows how to
 * split text into segments and score user input. It is therefore the
 * service most at risk of content-policy violations and is kept
 * deliberately isolated from BbcCatalogService.
 *
 * Two modes are supported:
 *
 *  1. "user_provided"  — the user supplied their own audio + transcript
 *     (which they obtained legally from BBC for personal use). The
 *     `segments` array lives in metadata_json with segments_source =
 *     'user_provided'. The model preserves the user's text and the
 *     scorer compares user input against that text.
 *
 *  2. "legacy_bbc"     — pre-existing rows that still have segments
 *     text crawled by the deprecated CrawlBbc6MinLessons command. The
 *     text is preserved in the database (no destructive migration),
 *     but ListeningExternalLesson::toApiArray() redacts the text
 *     before sending it to the client, and this service refuses to
 *     score against it. The UI must show a "Provide your own
 *     transcript" prompt for these lessons.
 *
 * Scoring logic itself lives in DictationScoringService and is shared
 * with any future dictation feature (e.g. a YouTube dictation MVP).
 */
class BbcDictationService
{
    public function __construct(
        private readonly DictationScoringService $scoringService = new DictationScoringService(),
        private readonly BbcCatalogService $catalog = new BbcCatalogService()
    ) {}

    public function getDictation(int $lessonId): ?ListeningExternalLesson
    {
        return $this->catalog->getLessonById($lessonId);
    }

    public function hasDictationSegments(int $lessonId): bool
    {
        $lesson = ListeningExternalLesson::find($lessonId);
        if (! $lesson) {
            return false;
        }

        $metadata = $lesson->metadata_json;
        if (! is_array($metadata)) {
            return false;
        }

        $segments = $metadata['segments'] ?? null;
        return is_array($segments) && count($segments) > 0;
    }

    public function getSegmentText(int $lessonId, int $segmentIndex): ?string
    {
        $lesson = ListeningExternalLesson::find($lessonId);
        if (! $lesson) {
            return null;
        }

        $metadata = $lesson->metadata_json;
        if (! is_array($metadata)) {
            return null;
        }

        $segments = $metadata['segments'] ?? null;
        if (! is_array($segments) || ! isset($segments[$segmentIndex])) {
            return null;
        }

        $segment = $segments[$segmentIndex];

        return $segment['text'] ?? null;
    }

    /**
     * Whether scoring is permitted against the lesson's segments.
     *
     * Compliance: .cursor/rules/bbc-feature.mdc
     * Scoring is permitted only for segments whose text belongs to the
     * user ('user_provided' or 'manual'). For everything else — including
     * 'legacy_bbc', 'curated', and NULL (unknown source) — scoring is
     * refused. NULL is treated as "unknown" rather than "safe" so that we
     * never accidentally rehost BBC content.
     */
    private function scoringPermitted(ListeningExternalLesson $lesson): bool
    {
        return in_array($lesson->segments_source, [
            ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
            ListeningExternalLesson::SEGMENTS_SOURCE_MANUAL,
        ], true);
    }

    /**
     * Score a user-typed segment against the lesson's reference text.
     *
     * Returns null in three cases:
     *   1. The lesson does not exist.
     *   2. The lesson has no segments at all.
     *   3. The lesson's segments_source is not user-provided or manual
     *      — meaning the text was either crawled from BBC (legacy_bbc /
     *      curated) or has an unknown origin. The caller should treat
     *      this as "user must provide their own transcript".
     */
    public function scoreSegment(
        int $userId,
        int $lessonId,
        int $segmentIndex,
        string $userInput,
        int $timeSpentMs
    ): ?array {
        $lesson = ListeningExternalLesson::find($lessonId);
        if (! $lesson) {
            return null;
        }

        if (! $this->scoringPermitted($lesson)) {
            return null;
        }

        $segmentText = $this->getSegmentText($lessonId, $segmentIndex);
        if ($segmentText === null) {
            return null;
        }

        $score = $this->scoringService->scoreSegment($segmentText, $userInput);

        UserExternalLessonSegment::updateOrCreate(
            [
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'segment_index' => $segmentIndex,
            ],
            [
                'user_input' => $userInput,
                'correct_words' => $score['correct_count'],
                'wrong_words' => $score['wrong_count'],
                'missing_words' => $score['missing_count'],
                'extra_words' => $score['wrong_count'],
                'accuracy' => $score['accuracy'],
                'time_spent_ms' => $timeSpentMs,
            ]
        );

        return $score;
    }

    public function getDictationSummary(int $userId, int $lessonId): array
    {
        $segments = UserExternalLessonSegment::where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->orderBy('segment_index')
            ->get();

        if ($segments->isEmpty()) {
            return [
                'segments_completed' => 0,
                'overall_accuracy' => 0.0,
                'total_time_ms' => 0,
                'segment_scores' => [],
            ];
        }

        $totalAccuracy = $segments->avg('accuracy') ?? 0.0;
        $totalTime = $segments->sum('time_spent_ms');

        return [
            'segments_completed' => $segments->count(),
            'overall_accuracy' => round($totalAccuracy, 1),
            'total_time_ms' => (int) $totalTime,
            'segment_scores' => $segments->map(fn ($s) => [
                'segment_index' => $s->segment_index,
                'accuracy' => $s->accuracy,
                'correct_count' => $s->correct_words,
                'wrong_count' => $s->wrong_words,
                'missing_count' => $s->missing_words,
                'time_spent_ms' => $s->time_spent_ms,
            ])->toArray(),
        ];
    }

    public function completeDictation(int $userId, int $lessonId): UserExternalLessonSegment
    {
        // Delegates to catalog for progress tracking
        $user = User::findOrFail($userId);
        $this->catalog->markCompleted($user, $lessonId);

        return UserExternalLessonSegment::where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->orderBy('segment_index', 'desc')
            ->first() ?? new UserExternalLessonSegment();
    }
}

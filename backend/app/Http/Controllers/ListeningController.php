<?php

namespace App\Http\Controllers;

use App\Models\UserClipProgress;
use App\Models\UserProgress;
use App\Services\ScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ListeningController extends Controller
{
    public function __construct(
        private ScoringService $scoringService,
    ) {}

    public function check(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'clip_id' => ['required', 'integer'],
            'transcript' => ['required', 'string', 'min:1', 'max:1000'],
        ]);

        $user = $request->user();
        $clipId = $validated['clip_id'];
        $transcript = $validated['transcript'];

        // Fetch clip for lesson context
        $clip = \App\Models\LessonClip::with('lesson')->findOrFail($clipId);
        $lesson = $clip->lesson;

        // Get previous attempt count and best accuracy for this clip
        $existingProgress = UserClipProgress::where('user_id', $user->id)
            ->where('clip_id', $clipId)
            ->first();

        $attemptNumber = $existingProgress
            ? $existingProgress->attempt_count + 1
            : 1;

        $bestAccuracy = $existingProgress?->accuracy ?? 0;

        // Score the transcript
        $score = $this->scoringService->score($transcript, (string) $clipId, $user->id);
        $accuracy = $score['accuracy'];
        $xpEarned = $this->calculateXp($accuracy, $attemptNumber);

        // Update or create clip progress
        $clipProgress = UserClipProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'clip_id' => $clipId,
            ],
            [
                'transcript_input' => $transcript,
                'accuracy' => $accuracy,
                'transcribed_text' => $transcript,
                'attempt_count' => $attemptNumber,
                'completed_at' => $accuracy >= 50 ? Carbon::now() : null,
            ]
        );

        // Determine clip status
        $clipStatus = match (true) {
            $accuracy >= 100 => 'completed',
            $accuracy >= 50  => 'in_progress',
            default          => 'failed',
        };

        // Update lesson progress
        $lessonProgress = $this->updateLessonProgress($user, $lesson, $accuracy, $xpEarned);

        // Update streak and XP
        $this->updateStreak($user);
        $this->addXp($user, $xpEarned);

        $isNewBest = $accuracy > $bestAccuracy;

        return response()->json([
            'data' => [
                'clip_id' => $clipId,
                'correct_transcript' => $clip->transcript,
                'user_transcript' => $transcript,
                'accuracy' => $accuracy,
                'words_total' => $score['total_words'],
                'words_correct' => $score['correct_count'],
                'words_wrong' => $score['wrong_count'],
                'words_missing' => $score['missing_count'],
                'word_results' => $score['word_results'],
                'xp_earned' => $xpEarned,
                'attempt_number' => $attemptNumber,
                'best_accuracy' => max($bestAccuracy, $accuracy),
                'is_new_best' => $isNewBest,
                'clip_completed' => $accuracy >= 50,
                'clip_status' => $clipStatus,
                'lesson_progress' => $lessonProgress,
            ],
        ]);
    }

    /**
     * Calculate XP with attempt-based scaling.
     * Attempt 1: 100%, Attempt 2: 50%, Attempt 3+: 25%
     */
    private function calculateXp(float $accuracy, int $attemptNumber): int
    {
        $baseXp = max(0, (int) round($accuracy * 0.1));
        $multiplier = match (true) {
            $attemptNumber === 1 => 1.0,
            $attemptNumber === 2 => 0.5,
            default             => 0.25,
        };
        return (int) round($baseXp * $multiplier);
    }

    private function updateLessonProgress(
        \App\Models\User $user,
        \App\Models\Lesson $lesson,
        float $accuracy,
        int $xpEarned,
    ): array {
        $clips = $lesson->clips;
        $clipsTotal = $clips->count();
        $clipIds = $clips->pluck('id')->toArray();

        // Count completed clips for this lesson
        $completedClips = UserClipProgress::where('user_id', $user->id)
            ->whereIn('clip_id', $clipIds)
            ->whereNotNull('completed_at')
            ->count();

        // Upsert lesson progress
        $existing = UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        $totalAccuracy = UserClipProgress::where('user_id', $user->id)
            ->whereIn('clip_id', $clipIds)
            ->whereNotNull('accuracy')
            ->avg('accuracy') ?? 0;

        $lessonXp = UserClipProgress::where('user_id', $user->id)
            ->whereIn('clip_id', $clipIds)
            ->sum('accuracy'); // approximate

        $lessonProgress = UserProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'accuracy' => $totalAccuracy,
                'xp_earned' => ($existing?->xp_earned ?? 0) + $xpEarned,
                'time_seconds' => ($existing?->time_seconds ?? 0) + 0,
                'attempt_count' => ($existing?->attempt_count ?? 0) + 1,
                'best_score' => max($existing?->best_score ?? 0, $accuracy),
                'completed_at' => $completedClips === $clipsTotal ? Carbon::now() : null,
            ]
        );

        return [
            'clips_completed' => $completedClips,
            'clips_total' => $clipsTotal,
            'accuracy' => round($totalAccuracy, 1),
        ];
    }

    private function updateStreak(\App\Models\User $user): void
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        if ($user->last_lesson_date === null) {
            $user->current_streak = 1;
            $user->streak_start_date = $today;
        } elseif ($user->last_lesson_date->equalTo($yesterday)) {
            $user->current_streak++;
        } elseif (!$user->last_lesson_date->equalTo($today)) {
            $user->current_streak = 1;
            $user->streak_start_date = $today;
        }

        if ($user->current_streak > $user->longest_streak) {
            $user->longest_streak = $user->current_streak;
        }

        $user->last_lesson_date = $today;
        $user->save();
    }

    private function addXp(\App\Models\User $user, int $xp): void
    {
        $user->total_xp += $xp;
        $user->level = (int) floor($user->total_xp / 100) + 1;
        $user->save();
    }
}

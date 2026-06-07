<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class ProgressService
{
    private const XP_PER_LEVEL = 100;

    public function getDashboard(User $user): array
    {
        $totalLessons = $user->progress()->whereNotNull('completed_at')->count();
        $totalClips = $user->clipProgress()->whereNotNull('completed_at')->count();

        $totalMinutes = $user->progress()
            ->whereNotNull('completed_at')
            ->sum('time_seconds') / 60;

        $avgAccuracy = $user->progress()
            ->whereNotNull('best_score')
            ->avg('best_score') ?? 0;

        $xpToNextLevel = self::XP_PER_LEVEL;

        return [
            'total_lessons' => $totalLessons,
            'total_clips' => $totalClips,
            'total_minutes' => (int) round($totalMinutes),
            'avg_accuracy' => round($avgAccuracy, 1),
            'current_streak' => $user->current_streak,
            'longest_streak' => $user->longest_streak,
            'total_xp' => $user->total_xp,
            'level' => $user->level,
            'xp_to_next_level' => $xpToNextLevel,
        ];
    }

    /**
     * Derive daily activity from user_clip_progress.
     * Replaces the deprecated daily_activities table.
     */
    public function getWeeklyActivity(User $user): array
    {
        $start = Carbon::now()->startOfWeek()->toDateString();
        $end = Carbon::now()->endOfWeek()->toDateString();

        // Group clip progress by date
        $activities = \App\Models\UserClipProgress::query()
            ->selectRaw("DATE(completed_at) as date,
                         COUNT(*) as clips_done,
                         SUM(accuracy) as total_accuracy")
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$start, $end])
            ->groupByRaw('DATE(completed_at)')
            ->get()
            ->keyBy('date');

        $result = [];
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::now()->startOfWeek()->addDays($i)->toDateString();
            $activity = $activities->get($date);

            $result[] = [
                'date' => $date,
                'lessons_done' => 0, // derived from clip progress in Phase 2
                'clips_done' => $activity ? (int) $activity->clips_done : 0,
                'xp_earned' => 0,   // derived in Phase 2
            ];
        }

        return $result;
    }

    public function updateStreak(User $user): void
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

    public function addXp(User $user, int $xp): void
    {
        $user->total_xp += $xp;
        $user->level = (int) floor($user->total_xp / self::XP_PER_LEVEL) + 1;
        $user->save();
    }
}

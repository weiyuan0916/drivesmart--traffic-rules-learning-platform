<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // Primary demo account
        $demo = User::updateOrCreate(
            ['email' => 'demo@vinalisten.app'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('demo1234'),
                'timezone' => 'Asia/Ho_Chi_Minh',
                'learning_goal' => 'daily',
                'daily_goal_minutes' => 10,
                'level' => 1,
                'total_xp' => 0,
                'current_streak' => 0,
                'longest_streak' => 0,
                'onboarding_completed' => false,
            ]
        );

        // Seed some progress so the dashboard is meaningful
        $this->seedDemoProgress($demo);

        $this->command->info('Demo user created: demo@vinalisten.app / demo1234');
    }

    private function seedDemoProgress(User $user): void
    {
        $lesson = \App\Models\Lesson::first();
        if (!$lesson) {
            return;
        }

        $clips = $lesson->clips()->get();

        // Create user progress for the first lesson
        $user->progress()->updateOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $lesson->id],
            [
                'accuracy' => 75.00,
                'xp_earned' => 75,
                'time_seconds' => 120,
                'attempt_count' => 1,
                'best_score' => 75.00,
                'completed_at' => now()->subDays(1),
            ]
        );

        // Create clip progress for first 2 clips
        foreach ($clips->take(2) as $clip) {
            $user->clipProgress()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'clip_id' => $clip->id,
                ],
                [
                    'transcript_input' => $clip->transcript, // perfect match
                    'accuracy' => 100.00,
                    'completed_at' => now()->subDays(1),
                ]
            );
        }

        // Update user stats
        $user->update([
            'total_xp' => 75,
            'level' => 1,
            'current_streak' => 1,
            'longest_streak' => 1,
            'last_lesson_date' => now()->subDay(),
        ]);

        // Add a daily activity for yesterday (removed — derived from clip_progress in Phase 2)
        // @deprecated daily_activities table removed. Keep stub for future re-addition.
    }
}

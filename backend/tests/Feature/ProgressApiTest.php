<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\LessonClip;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserClipProgress;
use App\Models\UserProgress;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    // ======================================================================
    // GET /api/v1/progress/dashboard
    // ======================================================================

    public function test_dashboard_returns_401_without_auth(): void
    {
        $response = $this->getJson('/api/v1/progress/dashboard');

        $response->assertStatus(401);
    }

    public function test_dashboard_returns_empty_state_for_new_user(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/progress/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_lessons',
                    'total_clips',
                    'total_minutes',
                    'avg_accuracy',
                    'current_streak',
                    'longest_streak',
                    'total_xp',
                    'level',
                    'xp_to_next_level',
                ],
            ])
            ->assertJsonPath('data.total_lessons', 0)
            ->assertJsonPath('data.total_clips', 0)
            ->assertJsonPath('data.avg_accuracy', 0)
            ->assertJsonPath('data.level', 1);
    }

    public function test_dashboard_returns_populated_state(): void
    {
        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);
        $clip = LessonClip::factory()->create(['lesson_id' => $lesson->id]);

        UserProgress::factory()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson->id,
            'best_score' => 85.0,
            'time_seconds' => 300,
            'completed_at' => now(),
        ]);

        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip->id,
            'accuracy' => 85.0,
            'completed_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/progress/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('data.total_lessons', 1)
            ->assertJsonPath('data.total_clips', 1)
            ->assertJsonPath('data.total_minutes', 5);
        // SQLite CAST returns integer; use assertEqualsWithDelta for decimal precision
        $this->assertEqualsWithDelta(85.0, $response->json('data.avg_accuracy'), 0.1);
    }

    public function test_dashboard_includes_user_streak_and_xp(): void
    {
        $this->user->update([
            'current_streak' => 7,
            'longest_streak' => 14,
            'total_xp' => 450,
            'level' => 5,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/progress/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('data.current_streak', 7)
            ->assertJsonPath('data.longest_streak', 14)
            ->assertJsonPath('data.total_xp', 450)
            ->assertJsonPath('data.level', 5);
    }

    // ======================================================================
    // GET /api/v1/progress/weekly
    // ======================================================================

    public function test_weekly_returns_401_without_auth(): void
    {
        $response = $this->getJson('/api/v1/progress/weekly');

        $response->assertStatus(401);
    }

    public function test_weekly_returns_seven_days(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/progress/weekly');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['date', 'lessons_done', 'clips_done', 'xp_earned'],
                ],
            ]);

        $data = $response->json('data');
        $this->assertCount(7, $data);
    }

    public function test_weekly_returns_consecutive_dates(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/progress/weekly');

        $response->assertStatus(200);

        $dates = collect($response->json('data'))->pluck('date')->toArray();

        // All dates should be unique and consecutive
        $this->assertCount(7, array_unique($dates));

        for ($i = 1; $i < count($dates); $i++) {
            $prev = Carbon::parse($dates[$i - 1]);
            $curr = Carbon::parse($dates[$i]);
            $this->assertEquals(1, $prev->diffInDays($curr),
                "Dates at index $i-1 and $i should be consecutive");
        }
    }

    public function test_weekly_returns_zero_counts_for_new_user(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/progress/weekly');

        $response->assertStatus(200);

        foreach ($response->json('data') as $day) {
            $this->assertEquals(0, $day['lessons_done']);
            $this->assertEquals(0, $day['clips_done']);
            $this->assertEquals(0, $day['xp_earned']);
        }
    }

    public function test_weekly_counts_clips_done(): void
    {
        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);
        $clip = LessonClip::factory()->create(['lesson_id' => $lesson->id]);

        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip->id,
            'completed_at' => Carbon::now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/progress/weekly');

        $response->assertStatus(200);

        $today = Carbon::today()->toDateString();
        $todayEntry = collect($response->json('data'))->firstWhere('date', $today);

        $this->assertEquals(1, $todayEntry['clips_done']);
    }

    // ======================================================================
    // GET /api/v1/history
    // ======================================================================

    public function test_history_returns_401_without_auth(): void
    {
        $response = $this->getJson('/api/v1/history');

        $response->assertStatus(401);
    }

    public function test_history_returns_empty_array_for_new_user(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/history');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_history_returns_completed_lessons(): void
    {
        $topic = Topic::factory()->create(['name' => 'Business English']);
        $lesson = Lesson::factory()->create([
            'topic_id' => $topic->id,
            'name' => 'Meeting Skills',
        ]);

        UserProgress::factory()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson->id,
            'best_score' => 90.0,
            'xp_earned' => 9,
            'time_seconds' => 180,
            'completed_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/history');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'lesson_id',
                        'lesson_name',
                        'topic_name',
                        'topic_slug',
                        'accuracy',
                        'xp_earned',
                        'time_seconds',
                        'completed_at',
                    ],
                ],
            ]);

        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.lesson_name', 'Meeting Skills');
        $response->assertJsonPath('data.0.topic_name', 'Business English');
        $this->assertEqualsWithDelta(90.0, $response->json('data.0.accuracy'), 0.1);
        $response->assertJsonPath('data.0.xp_earned', 9);
    }

    public function test_history_excludes_incomplete_lessons(): void
    {
        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);

        // Completed
        UserProgress::factory()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson->id,
            'completed_at' => now(),
        ]);

        // Incomplete
        $lesson2 = Lesson::factory()->create(['topic_id' => $topic->id]);
        UserProgress::factory()->incomplete()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson2->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/history');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_history_ordered_by_most_recent(): void
    {
        $topic = Topic::factory()->create();
        $lesson1 = Lesson::factory()->create(['topic_id' => $topic->id]);
        $lesson2 = Lesson::factory()->create(['topic_id' => $topic->id]);

        UserProgress::factory()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson1->id,
            'completed_at' => now()->subDays(2),
        ]);

        UserProgress::factory()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson2->id,
            'completed_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/history');

        $response->assertStatus(200);
        $data = $response->json('data');

        // Most recent first
        $this->assertEquals($lesson2->id, $data[0]['lesson_id']);
        $this->assertEquals($lesson1->id, $data[1]['lesson_id']);
    }

    public function test_history_returns_paginated_results(): void
    {
        $topic = Topic::factory()->create();

        // Create 25 lessons and complete them all
        for ($i = 1; $i <= 25; $i++) {
            $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);
            UserProgress::factory()->create([
                'user_id' => $this->user->id,
                'lesson_id' => $lesson->id,
                'completed_at' => now()->subMinutes($i),
            ]);
        }

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/history');

        $response->assertStatus(200);

        // Default pagination is 20
        $this->assertCount(20, $response->json('data'));
    }

    // ======================================================================
    // Error handling & edge cases
    // ======================================================================

    public function test_dashboard_invalid_token_returns_401(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/v1/progress/dashboard');

        $response->assertStatus(401);
    }

    public function test_weekly_invalid_token_returns_401(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/v1/progress/weekly');

        $response->assertStatus(401);
    }

    public function test_history_invalid_token_returns_401(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/v1/history');

        $response->assertStatus(401);
    }
}

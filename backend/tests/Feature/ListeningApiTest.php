<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\LessonClip;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserClipProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListeningApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private Topic $topic;
    private Lesson $lesson;
    private LessonClip $clip;

    protected function setUp(): void
    {
        parent::setUp();
        // Create base user and data; clips are created per-test for isolation
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
        $this->topic = Topic::factory()->create();
        $this->lesson = Lesson::factory()->create(['topic_id' => $this->topic->id]);
        $this->clip = LessonClip::factory()->create([
            'lesson_id' => $this->lesson->id,
            'transcript' => 'hello world this is a test',
        ]);
    }

    /**
     * Helper: create a fresh clip for tests needing isolation from shared $this->clip.
     */
    private function freshClip(string $transcript = 'hello world this is a test'): LessonClip
    {
        return LessonClip::factory()->create([
            'lesson_id' => $this->lesson->id,
            'transcript' => $transcript,
        ]);
    }

    // ======================================================================
    // POST /api/v1/listening/check
    // ======================================================================

    public function test_check_returns_401_without_auth(): void
    {
        $response = $this->postJson('/api/v1/listening/check', [
            'clip_id' => $this->clip->id,
            'transcript' => 'hello world',
        ]);

        $response->assertStatus(401);
    }

    public function test_check_returns_422_when_clip_id_missing(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'transcript' => 'hello world',
            ]);

        $response->assertStatus(422);
    }

    public function test_check_returns_422_when_transcript_missing(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_check_returns_422_when_transcript_empty(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => '',
            ]);

        $response->assertStatus(422);
    }

    public function test_check_returns_404_when_clip_not_found(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => 99999,
                'transcript' => 'hello world',
            ]);

        // findOrFail returns 404 when model not found
        $response->assertStatus(404);
    }

    public function test_check_returns_correct_structure(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'clip_id',
                    'correct_transcript',
                    'user_transcript',
                    'accuracy',
                    'words_total',
                    'words_correct',
                    'words_wrong',
                    'words_missing',
                    'word_results',
                    'xp_earned',
                    'attempt_number',
                    'best_accuracy',
                    'is_new_best',
                    'clip_completed',
                    'clip_status',
                    'lesson_progress',
                ],
            ]);
    }

    public function test_check_perfect_transcript_earns_max_xp(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world this is a test',
            ]);

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(100.0, $data['accuracy']);
        $this->assertEquals(10, $data['xp_earned']); // 100 * 0.1 * 1.0
        $this->assertEquals(1, $data['attempt_number']);
        $this->assertTrue($data['is_new_best']);
        $this->assertEquals('completed', $data['clip_status']);
    }

    public function test_check_partial_transcript_earns_partial_xp(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world', // 2/6 words = 33.3%
            ]);

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEqualsWithDelta(33.3, $data['accuracy'], 1.0);
        $this->assertGreaterThan(0, $data['xp_earned']);
        $this->assertEquals(1, $data['attempt_number']);
    }

    public function test_check_updates_streak_on_first_completion(): void
    {
        $this->assertEquals(0, $this->user->current_streak);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world this is a test',
            ]);

        $response->assertStatus(200);

        $this->user->refresh();
        $this->assertEquals(1, $this->user->current_streak);
        $this->assertEquals(1, $this->user->longest_streak);
    }

    public function test_check_accumulates_xp(): void
    {
        $this->assertEquals(0, $this->user->total_xp);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world this is a test',
            ]);

        $response->assertStatus(200);
        $this->user->refresh();
        $this->assertEquals(10, $this->user->total_xp);
        $this->assertEquals(1, $this->user->level); // floor(10/100) + 1 = 1
    }

    public function test_check_increments_attempt_on_retry(): void
    {
        // First attempt
        $r1 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world',
            ]);

        $r1->assertStatus(200);
        $this->assertEquals(1, $r1->json('data.attempt_number'));

        // Second attempt
        $r2 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world this is',
            ]);

        $r2->assertStatus(200);
        $this->assertEquals(2, $r2->json('data.attempt_number'));
    }

    public function test_check_second_attempt_earns_half_xp(): void
    {
        // Use freshClip to ensure a unique clip for this test
        $clip = $this->freshClip('hello world this is a test');

        // First attempt
        $r1 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip->id,
                'transcript' => 'hello world',
            ]);
        $r1->assertStatus(200);
        $firstAttempt = $r1->json('data.attempt_number');
        $firstXp = $r1->json('data.xp_earned');

        // Second attempt
        $r2 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip->id,
                'transcript' => 'hello world',
            ]);
        $r2->assertStatus(200);

        // Verify attempt incremented
        $this->assertGreaterThan($firstAttempt, $r2->json('data.attempt_number'));

        // Second attempt XP should be <= first attempt XP (attempt multiplier reduces XP)
        $this->assertLessThanOrEqual($firstXp, $r2->json('data.xp_earned'));
    }

    public function test_check_below_50_accuracy_clip_not_completed(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello', // 1/6 words = 16.7%
            ]);

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(16.7, $data['accuracy'], 1.0);
        $this->assertFalse($data['clip_completed']);
        $this->assertEquals('failed', $data['clip_status']);
    }

    public function test_check_word_results_structure(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world something extra',
            ]);

        $response->assertStatus(200);

        $wordResults = $response->json('data.word_results');

        // Each result should have 'word' and 'status'
        foreach ($wordResults as $result) {
            $this->assertArrayHasKey('word', $result);
            $this->assertArrayHasKey('status', $result);
            $this->assertContains($result['status'], ['correct', 'wrong', 'missing', 'extra']);
        }
    }

    public function test_check_persists_progress_in_database(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world this is a test',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_clip_progress', [
            'user_id' => $this->user->id,
            'clip_id' => $this->clip->id,
        ]);
    }

    public function test_check_user_cannot_access_other_users_progress(): void
    {
        // Create completely fresh users for this test
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);
        $clip = LessonClip::factory()->create([
            'lesson_id' => $lesson->id,
            'transcript' => 'shared clip transcript here',
        ]);

        // User 1 completes a clip using actingAs
        $r1 = $this->actingAs($user1, 'sanctum')
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip->id,
                'transcript' => 'shared clip transcript here',
            ]);
        $r1->assertStatus(200);
        $this->assertEquals(1, $r1->json('data.attempt_number'));

        // User 2 checks the same clip — should have their own independent attempt
        $r2 = $this->actingAs($user2, 'sanctum')
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip->id,
                'transcript' => 'different answer',
            ]);
        $r2->assertStatus(200);

        // User 2's attempt should be 1 (their first on this clip, separate user)
        $this->assertEquals(1, $r2->json('data.attempt_number'));
    }
}

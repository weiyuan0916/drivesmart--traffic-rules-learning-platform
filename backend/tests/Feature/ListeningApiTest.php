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
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
        $this->topic = Topic::factory()->create();
        $this->lesson = Lesson::factory()->create(['topic_id' => $this->topic->id]);
        $this->clip = LessonClip::factory()->create([
            'lesson_id' => $this->lesson->id,
            'transcript' => 'hello world this is a test',
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
        // First attempt: 2/5 words = 40% accuracy → 4 XP
        $r1 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world',
            ]);

        $r1->assertStatus(200);
        $this->assertEquals(1, $r1->json('data.attempt_number'));
        $this->assertEqualsWithDelta(40.0, $r1->json('data.accuracy'), 1.0);

        // Second attempt: same transcript = same accuracy, but 50% XP multiplier
        // 40% * 0.1 * 0.5 = 2 XP (PHP rounds 2.0 to 2)
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world',
            ]);

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('data.attempt_number'));
        $this->assertEqualsWithDelta(40.0, $response->json('data.accuracy'), 1.0);
        $this->assertEquals(2, $response->json('data.xp_earned'));
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
        $otherUser = User::factory()->create();
        $otherToken = $otherUser->createToken('other')->plainTextToken;

        // Create a fresh clip just for user 1
        $clip1 = LessonClip::factory()->create([
            'lesson_id' => $this->lesson->id,
            'transcript' => 'user one transcript here',
        ]);

        // User 1 completes a clip
        $r1 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip1->id,
                'transcript' => 'user one transcript here',
            ]);
        $r1->assertStatus(200);
        $this->assertEquals(1, $r1->json('data.attempt_number'));

        // User 2 checks same clip — should be fresh attempt (no shared progress)
        $r2 = $this->withHeader('Authorization', 'Bearer ' . $otherToken)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip1->id,
                'transcript' => 'different answer',
            ]);

        $r2->assertStatus(200);
        // User 2 should have their own independent attempt counter starting at 1
        $this->assertEquals(1, $r2->json('data.attempt_number'));
        $this->assertTrue($r2->json('data.is_new_best'));

        // User 1's second attempt on the same clip
        $r1b = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip1->id,
                'transcript' => 'user one transcript here again',
            ]);
        $r1b->assertStatus(200);
        // User 1's attempt counter should be at 2
        $this->assertEquals(2, $r1b->json('data.attempt_number'));

        // Verify user 1 and user 2 have independent progress
        $this->assertEquals(1, $r2->json('data.attempt_number'));
    }
}

<?php

namespace Tests\Feature;

use App\Models\ListeningExternalLesson;
use App\Models\User;
use App\Models\ListeningSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BbcDictationApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private ListeningExternalLesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $source = ListeningSource::factory()->create();
        $this->lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello, this is my transcript.'],
                    ['id' => 1, 'text' => "It's a user-provided lesson."],
                    ['id' => 2, 'text' => 'Today we are discussing dictation.'],
                ],
                'audio_url' => null,
            ],
        ]);
    }

    // ==========================================================
    // TC-01: GET /dictation returns lesson with segments (authenticated)
    // ==========================================================
    public function test_get_dictation_returns_lesson_with_segments(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'lesson',
                    'has_segments',
                    'segments',
                    'audio_url',
                    'episode_code',
                ],
            ])
            ->assertJsonPath('data.has_segments', true)
            ->assertJsonPath('data.segments', fn ($segments) => count($segments) === 3);
    }

    // ==========================================================
    // TC-02: GET /dictation requires authentication
    // ==========================================================
    public function test_get_dictation_requires_authentication(): void
    {
        $response = $this->getJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation");

        $response->assertStatus(401);
    }

    // ==========================================================
    // TC-03: GET /dictation returns 404 for invalid lesson
    // ==========================================================
    public function test_get_dictation_returns_404_for_invalid_lesson(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/listening/bbc/99999/dictation');

        $response->assertStatus(404);
    }

    // ==========================================================
    // TC-04: POST /dictation/segments submits and scores
    // ==========================================================
    public function test_submit_segment_scores_and_returns_result(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation/segments", [
            'segment_index' => 0,
            'user_input' => 'Hello, this is my transcript.',
            'time_spent_ms' => 5000,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('accuracy', 100)
            ->assertJsonPath('correct_count', 5);
    }

    // ==========================================================
    // TC-05: POST /dictation/segments rejects empty user_input
    // ==========================================================
    public function test_submit_segment_rejects_empty_input(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation/segments", [
            'segment_index' => 0,
            'user_input' => '',
            'time_spent_ms' => 1000,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user_input']);
    }

    // ==========================================================
    // TC-06: POST /dictation/segments rejects missing fields
    // ==========================================================
    public function test_submit_segment_rejects_missing_fields(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation/segments", [
            'segment_index' => 0,
            // missing user_input
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user_input']);
    }

    // ==========================================================
    // TC-07: POST /dictation/segments returns 400 when no segments
    // ==========================================================
    public function test_submit_segment_returns_400_when_no_segments(): void
    {
        $source = ListeningSource::factory()->create();
        $lessonNoSegments = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'metadata_json' => null,
        ]);
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/v1/listening/bbc/{$lessonNoSegments->id}/dictation/segments", [
            'segment_index' => 0,
            'user_input' => 'hello world',
            'time_spent_ms' => 1000,
        ]);

        $response->assertStatus(400);
    }

    // ==========================================================
    // TC-08: GET /dictation/summary returns aggregated results
    // ==========================================================
    public function test_get_dictation_summary_returns_aggregated_results(): void
    {
        Sanctum::actingAs($this->user);

        // Submit two segments
        $this->postJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation/segments", [
            'segment_index' => 0,
            'user_input' => 'Hello, this is my transcript.',
            'time_spent_ms' => 3000,
        ]);
        $this->postJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation/segments", [
            'segment_index' => 1,
            'user_input' => "It's a user-provided lesson.",
            'time_spent_ms' => 4000,
        ]);

        $response = $this->getJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation/summary");

        $response->assertStatus(200)
            ->assertJsonPath('data.segments_completed', 2)
            ->assertJsonPath('data.total_time_ms', 7000);
    }

    // ==========================================================
    // TC-09: POST /dictation/complete marks lesson as completed
    // ==========================================================
    public function test_complete_dictation_marks_lesson_completed(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson("/api/v1/listening/bbc/{$this->lesson->id}/dictation/complete");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
    }

    // ==========================================================
    // TC-10: Routes require authentication
    // ==========================================================
    public function test_all_dictation_routes_require_authentication(): void
    {
        $endpoints = [
            ['GET', "/api/v1/listening/bbc/{$this->lesson->id}/dictation"],
            ['POST', "/api/v1/listening/bbc/{$this->lesson->id}/dictation/segments"],
            ['GET', "/api/v1/listening/bbc/{$this->lesson->id}/dictation/summary"],
            ['POST', "/api/v1/listening/bbc/{$this->lesson->id}/dictation/complete"],
        ];

        foreach ($endpoints as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $this->assertEquals(401, $response->status(), "Route {$method} {$uri} should require auth");
        }
    }
}

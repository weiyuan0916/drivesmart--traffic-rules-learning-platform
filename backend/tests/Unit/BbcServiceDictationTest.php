<?php

namespace Tests\Unit;

use App\Models\ListeningExternalLesson;
use App\Models\User;
use App\Models\UserExternalLessonSegment;
use App\Services\BbcService;
use App\Services\DictationScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BbcServiceDictationTest extends TestCase
{
    use RefreshDatabase;

    private BbcService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BbcService();
    }

    // ==========================================================
    // TC-01: hasDictationSegments returns false when no segments
    // ==========================================================
    public function test_has_dictation_segments_returns_false_when_no_segments(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create(['source_id' => $source->id]);

        $this->assertFalse($this->service->hasDictationSegments($lesson->id));
    }

    // ==========================================================
    // TC-02: hasDictationSegments returns true when segments exist
    // ==========================================================
    public function test_has_dictation_segments_returns_true_when_segments_exist(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world.'],
                ],
            ],
        ]);

        $this->assertTrue($this->service->hasDictationSegments($lesson->id));
    }

    // ==========================================================
    // TC-03: getSegmentText returns correct segment text
    // ==========================================================
    public function test_get_segment_text_returns_correct_segment(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world.'],
                    ['id' => 1, 'text' => 'This is BBC.'],
                    ['id' => 2, 'text' => 'Goodbye.'],
                ],
            ],
        ]);

        $this->assertEquals('Hello world.', $this->service->getSegmentText($lesson->id, 0));
        $this->assertEquals('This is BBC.', $this->service->getSegmentText($lesson->id, 1));
        $this->assertEquals('Goodbye.', $this->service->getSegmentText($lesson->id, 2));
    }

    // ==========================================================
    // TC-04: getSegmentText returns null for out-of-bounds index
    // ==========================================================
    public function test_get_segment_text_returns_null_for_invalid_index(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello.'],
                ],
            ],
        ]);

        $this->assertNull($this->service->getSegmentText($lesson->id, 99));
        $this->assertNull($this->service->getSegmentText($lesson->id, -1));
    }

    // ==========================================================
    // TC-05: getSegmentText returns null when no segments
    // ==========================================================
    public function test_get_segment_text_returns_null_when_no_segments(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create(['source_id' => $source->id]);

        $this->assertNull($this->service->getSegmentText($lesson->id, 0));
    }

    // ==========================================================
    // TC-06: scoreSegment stores result and returns score
    // ==========================================================
    public function test_score_segment_stores_result_and_returns_score(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world today.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        $result = $this->service->scoreSegment(
            $user->id,
            $lesson->id,
            0,
            'Hello world today.',
            3000
        );

        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertEquals(3, $result['correct_count']);
        $this->assertEquals(0, $result['wrong_count']);
        $this->assertEquals(0, $result['missing_count']);

        // Verify stored in DB
        $stored = UserExternalLessonSegment::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->where('segment_index', 0)
            ->first();

        $this->assertNotNull($stored);
        $this->assertEquals(100.0, $stored->accuracy);
        $this->assertEquals(3000, $stored->time_spent_ms);
    }

    // ==========================================================
    // TC-07: scoreSegment returns null when no segment text available
    // ==========================================================
    public function test_score_segment_returns_null_when_no_segments(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create(['source_id' => $source->id]);
        $user = User::factory()->create();

        $result = $this->service->scoreSegment($user->id, $lesson->id, 0, 'hello', 1000);

        $this->assertNull($result);
    }

    // ==========================================================
    // TC-08: scoreSegment updates existing segment attempt
    // ==========================================================
    public function test_score_segment_updates_existing_attempt(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world today.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        // First attempt
        $this->service->scoreSegment($user->id, $lesson->id, 0, 'Hello world', 2000);
        $count1 = UserExternalLessonSegment::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->where('segment_index', 0)
            ->count();
        $this->assertEquals(1, $count1);

        // Second attempt updates the same row
        $this->service->scoreSegment($user->id, $lesson->id, 0, 'Hello world today.', 3000);
        $count2 = UserExternalLessonSegment::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->where('segment_index', 0)
            ->count();
        $this->assertEquals(1, $count2); // Still 1 row, updated

        $segment = UserExternalLessonSegment::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->where('segment_index', 0)
            ->first();
        $this->assertEquals(100.0, $segment->accuracy); // Updated to 100%
        $this->assertEquals(3000, $segment->time_spent_ms); // Updated time
    }

    // ==========================================================
    // TC-09: getDictationSummary aggregates all segments
    // ==========================================================
    public function test_get_dictation_summary_aggregates_segments(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $source->id,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world.'],
                    ['id' => 1, 'text' => 'This is BBC.'],
                    ['id' => 2, 'text' => 'Goodbye.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        // Submit attempts for segments 0 and 1
        $this->service->scoreSegment($user->id, $lesson->id, 0, 'Hello world.', 1000);
        $this->service->scoreSegment($user->id, $lesson->id, 1, 'This is BBC.', 1500);

        $summary = $this->service->getDictationSummary($user->id, $lesson->id);

        $this->assertEquals(2, $summary['segments_completed']);
        $this->assertEquals(100.0, $summary['overall_accuracy']);
        $this->assertEquals(2500, $summary['total_time_ms']);
        $this->assertCount(2, $summary['segment_scores']);
    }

    // ==========================================================
    // TC-10: getDictationSummary returns zeros when no attempts
    // ==========================================================
    public function test_get_dictation_summary_returns_zeros_when_empty(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create(['source_id' => $source->id]);
        $user = User::factory()->create();

        $summary = $this->service->getDictationSummary($user->id, $lesson->id);

        $this->assertEquals(0, $summary['segments_completed']);
        $this->assertEquals(0.0, $summary['overall_accuracy']);
        $this->assertEquals(0, $summary['total_time_ms']);
        $this->assertEmpty($summary['segment_scores']);
    }

    // ==========================================================
    // TC-11: completeDictation marks lesson as completed
    // ==========================================================
    public function test_complete_dictation_marks_lesson_completed(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create(['source_id' => $source->id]);
        $user = User::factory()->create();

        $progress = $this->service->completeDictation($user->id, $lesson->id);

        $this->assertEquals('completed', $progress->status);
        $this->assertNotNull($progress->completed_at);
    }

    // ==========================================================
    // TC-12: getDictation returns lesson by ID
    // ==========================================================
    public function test_get_dictation_returns_lesson_by_id(): void
    {
        $source = \App\Models\ListeningSource::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create(['source_id' => $source->id]);

        $result = $this->service->getDictation($lesson->id);

        $this->assertNotNull($result);
        $this->assertEquals($lesson->id, $result->id);
    }

    // ==========================================================
    // TC-13: getDictation returns null for non-existent ID
    // ==========================================================
    public function test_get_dictation_returns_null_for_invalid_id(): void
    {
        $result = $this->service->getDictation(99999);

        $this->assertNull($result);
    }
}

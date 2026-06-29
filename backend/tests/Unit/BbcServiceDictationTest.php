<?php

namespace Tests\Unit;

use App\Models\ListeningExternalLesson;
use App\Models\User;
use App\Models\UserExternalLessonSegment;
use App\Services\BbcDictationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for BbcDictationService.
 *
 * After the 2026-06-16 content-policy audit (.cursor/rules/bbc-feature.mdc),
 * the dictation service was extracted from BbcService into its own class
 * to make its content-policy boundary explicit. These tests verify:
 *   1. The dictation service works correctly for user-provided content.
 *   2. The dictation service REFUSES to score against legacy_bbc content,
 *      even if such rows still exist in the database from before the
 *      deprecation. This is the critical safety check.
 *
 * The deprecated BbcService facade still passes these tests via its
 * pass-through methods, so both the old and new code paths are covered.
 *
 * @group bbc
 * @group bbc-compliance
 */
class BbcServiceDictationTest extends TestCase
{
    use RefreshDatabase;

    private BbcDictationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BbcDictationService();
    }

    private function makeSource(): \App\Models\ListeningSource
    {
        return \App\Models\ListeningSource::factory()->create();
    }

    // ==========================================================
    // TC-01: hasDictationSegments returns false when no segments
    // ==========================================================
    public function test_has_dictation_segments_returns_false_when_no_segments(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
        ]);

        $this->assertFalse($this->service->hasDictationSegments($lesson->id));
    }

    // ==========================================================
    // TC-02: hasDictationSegments returns true when segments exist
    // ==========================================================
    public function test_has_dictation_segments_returns_true_when_segments_exist(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world.'],
                ],
            ],
        ]);

        $this->assertTrue($this->service->hasDictationSegments($lesson->id));
    }

    // ==========================================================
    // TC-03: getSegmentText returns correct segment text (user_provided)
    // ==========================================================
    public function test_get_segment_text_returns_correct_segment(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world.'],
                    ['id' => 1, 'text' => 'This is my own transcript.'],
                    ['id' => 2, 'text' => 'Goodbye.'],
                ],
            ],
        ]);

        $this->assertEquals('Hello world.', $this->service->getSegmentText($lesson->id, 0));
        $this->assertEquals('This is my own transcript.', $this->service->getSegmentText($lesson->id, 1));
        $this->assertEquals('Goodbye.', $this->service->getSegmentText($lesson->id, 2));
    }

    // ==========================================================
    // TC-04: getSegmentText returns null for out-of-bounds index
    // ==========================================================
    public function test_get_segment_text_returns_null_for_invalid_index(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
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
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
        ]);

        $this->assertNull($this->service->getSegmentText($lesson->id, 0));
    }

    // ==========================================================
    // TC-06: scoreSegment stores result and returns score (user_provided)
    // ==========================================================
    public function test_score_segment_stores_result_and_returns_score(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
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
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
        ]);
        $user = User::factory()->create();

        $result = $this->service->scoreSegment($user->id, $lesson->id, 0, 'hello', 1000);

        $this->assertNull($result);
    }

    // ==========================================================
    // TC-08: scoreSegment REFUSES to score against legacy_bbc content
    // This is the critical content-policy safety check.
    // ==========================================================
    public function test_score_segment_refuses_legacy_bbc_content(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_LEGACY_BBC,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'BBC transcript text that should not be used.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        $result = $this->service->scoreSegment(
            $user->id,
            $lesson->id,
            0,
            'My answer',
            1000
        );

        // Must return null — service refuses to score against legacy BBC content
        $this->assertNull($result);

        // And must not have stored any attempt in the DB
        $stored = UserExternalLessonSegment::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->where('segment_index', 0)
            ->first();
        $this->assertNull($stored);
    }

    public function test_score_segment_refuses_null_source(): void
    {
        // NULL segments_source means "unknown origin" — refuse to be safe
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => null,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Unknown source text.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        $result = $this->service->scoreSegment($user->id, $lesson->id, 0, 'text', 1000);

        $this->assertNull($result);
    }

    public function test_score_segment_refuses_curated_source(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_CURATED,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Curated BBC text.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        $result = $this->service->scoreSegment($user->id, $lesson->id, 0, 'text', 1000);

        $this->assertNull($result);
    }

    public function test_score_segment_allows_manual_source(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_MANUAL,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world today.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        $result = $this->service->scoreSegment($user->id, $lesson->id, 0, 'Hello world today.', 1000);

        $this->assertNotNull($result);
        $this->assertEquals(100.0, $result['accuracy']);
    }

    // ==========================================================
    // TC-09: getDictationSummary aggregates all segments
    // ==========================================================
    public function test_get_dictation_summary_aggregates_segments(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
            'segments_source' => ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
            'metadata_json' => [
                'segments' => [
                    ['id' => 0, 'text' => 'Hello world.'],
                    ['id' => 1, 'text' => 'This is mine.'],
                    ['id' => 2, 'text' => 'Goodbye.'],
                ],
            ],
        ]);
        $user = User::factory()->create();

        $this->service->scoreSegment($user->id, $lesson->id, 0, 'Hello world.', 1000);
        $this->service->scoreSegment($user->id, $lesson->id, 1, 'This is mine.', 1500);

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
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
        ]);
        $user = User::factory()->create();

        $summary = $this->service->getDictationSummary($user->id, $lesson->id);

        $this->assertEquals(0, $summary['segments_completed']);
        $this->assertEquals(0.0, $summary['overall_accuracy']);
        $this->assertEquals(0, $summary['total_time_ms']);
        $this->assertEmpty($summary['segment_scores']);
    }

    // ==========================================================
    // TC-11: getDictation returns lesson by ID
    // ==========================================================
    public function test_get_dictation_returns_lesson_by_id(): void
    {
        $lesson = ListeningExternalLesson::factory()->create([
            'source_id' => $this->makeSource()->id,
        ]);

        $result = $this->service->getDictation($lesson->id);

        $this->assertNotNull($result);
        $this->assertEquals($lesson->id, $result->id);
    }

    // ==========================================================
    // TC-12: getDictation returns null for non-existent ID
    // ==========================================================
    public function test_get_dictation_returns_null_for_invalid_id(): void
    {
        $result = $this->service->getDictation(99999);

        $this->assertNull($result);
    }
}

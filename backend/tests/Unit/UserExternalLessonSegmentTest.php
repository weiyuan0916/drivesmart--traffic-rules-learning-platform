<?php

namespace Tests\Unit;

use App\Models\UserExternalLessonSegment;
use App\Models\User;
use App\Models\ListeningExternalLesson;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserExternalLessonSegmentTest extends TestCase
{
    use RefreshDatabase;

    // ==========================================================
    // TC-01: Model can be created with all fields
    // ==========================================================
    public function test_model_can_be_created_with_all_fields(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        $segment = UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 3,
            'user_input' => 'Hello, this is a test.',
            'correct_words' => 5,
            'wrong_words' => 0,
            'missing_words' => 1,
            'extra_words' => 0,
            'accuracy' => 83.3,
            'time_spent_ms' => 4500,
        ]);

        $this->assertDatabaseHas('user_external_lesson_segments', [
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 3,
            'correct_words' => 5,
            'wrong_words' => 0,
            'missing_words' => 1,
            'extra_words' => 0,
            'accuracy' => 83.3,
            'time_spent_ms' => 4500,
        ]);
    }

    // ==========================================================
    // TC-02: Accuracy is cast to float
    // ==========================================================
    public function test_accuracy_is_cast_to_float(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        $segment = UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 0,
            'user_input' => 'test',
            'correct_words' => 1,
            'wrong_words' => 0,
            'missing_words' => 0,
            'extra_words' => 0,
            'accuracy' => '100.00',
            'time_spent_ms' => 1000,
        ]);

        $segment->refresh();
        $this->assertIsFloat($segment->accuracy);
        $this->assertEquals(100.0, $segment->accuracy);
    }

    // ==========================================================
    // TC-03: belongsTo User relationship
    // ==========================================================
    public function test_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        $segment = UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 0,
            'user_input' => 'hello world',
            'correct_words' => 2,
            'wrong_words' => 0,
            'missing_words' => 0,
            'extra_words' => 0,
            'accuracy' => 100.0,
            'time_spent_ms' => 2000,
        ]);

        $this->assertInstanceOf(User::class, $segment->user);
        $this->assertEquals($user->id, $segment->user->id);
    }

    // ==========================================================
    // TC-04: belongsTo ListeningExternalLesson relationship
    // ==========================================================
    public function test_belongs_to_lesson(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        $segment = UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 5,
            'user_input' => 'typed words',
            'correct_words' => 2,
            'wrong_words' => 0,
            'missing_words' => 0,
            'extra_words' => 0,
            'accuracy' => 100.0,
            'time_spent_ms' => 3000,
        ]);

        $this->assertInstanceOf(ListeningExternalLesson::class, $segment->lesson);
        $this->assertEquals($lesson->id, $segment->lesson->id);
    }

    // ==========================================================
    // TC-05: toApiArray returns correct shape
    // ==========================================================
    public function test_to_api_array_returns_correct_shape(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        $segment = UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 2,
            'user_input' => 'Hello, this is 6 Minute English.',
            'correct_words' => 5,
            'wrong_words' => 1,
            'missing_words' => 0,
            'extra_words' => 1,
            'accuracy' => 83.3,
            'time_spent_ms' => 5000,
        ]);

        $arr = $segment->toApiArray();

        $this->assertArrayHasKey('id', $arr);
        $this->assertArrayHasKey('user_id', $arr);
        $this->assertArrayHasKey('lesson_id', $arr);
        $this->assertArrayHasKey('segment_index', $arr);
        $this->assertArrayHasKey('user_input', $arr);
        $this->assertArrayHasKey('correct_words', $arr);
        $this->assertArrayHasKey('wrong_words', $arr);
        $this->assertArrayHasKey('missing_words', $arr);
        $this->assertArrayHasKey('extra_words', $arr);
        $this->assertArrayHasKey('accuracy', $arr);
        $this->assertArrayHasKey('time_spent_ms', $arr);
        $this->assertArrayHasKey('created_at', $arr);
        $this->assertEquals(2, $arr['segment_index']);
        $this->assertEquals('Hello, this is 6 Minute English.', $arr['user_input']);
        $this->assertEquals(83.3, $arr['accuracy']);
    }

    // ==========================================================
    // TC-06: Multiple segments for same user+lesson are unique by index
    // ==========================================================
    public function test_multiple_segments_same_user_lesson_unique_by_index(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 0,
            'user_input' => 'first segment',
            'correct_words' => 2,
            'wrong_words' => 0,
            'missing_words' => 0,
            'extra_words' => 0,
            'accuracy' => 100.0,
            'time_spent_ms' => 1000,
        ]);

        UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 1,
            'user_input' => 'second segment',
            'correct_words' => 2,
            'wrong_words' => 0,
            'missing_words' => 0,
            'extra_words' => 0,
            'accuracy' => 100.0,
            'time_spent_ms' => 1500,
        ]);

        $this->assertEquals(2, UserExternalLessonSegment::count());
    }

    // ==========================================================
    // TC-07: time_spent_ms is cast to integer
    // ==========================================================
    public function test_time_spent_ms_is_cast_to_integer(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        $segment = UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 0,
            'user_input' => 'test',
            'correct_words' => 1,
            'wrong_words' => 0,
            'missing_words' => 0,
            'extra_words' => 0,
            'accuracy' => 100.0,
            'time_spent_ms' => '5000',
        ]);

        $segment->refresh();
        $this->assertIsInt($segment->time_spent_ms);
        $this->assertEquals(5000, $segment->time_spent_ms);
    }

    // ==========================================================
    // TC-08: created_at is set automatically
    // ==========================================================
    public function test_created_at_is_set_automatically(): void
    {
        $user = User::factory()->create();
        $lesson = ListeningExternalLesson::factory()->create();

        $segment = UserExternalLessonSegment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'segment_index' => 0,
            'user_input' => 'hello',
            'correct_words' => 1,
            'wrong_words' => 0,
            'missing_words' => 0,
            'extra_words' => 0,
            'accuracy' => 100.0,
            'time_spent_ms' => 1000,
        ]);

        $this->assertNotNull($segment->created_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $segment->created_at);
    }
}

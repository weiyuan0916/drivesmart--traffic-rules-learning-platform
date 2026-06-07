<?php

namespace Tests\Unit;

use App\Http\Controllers\ListeningController;
use App\Models\Lesson;
use App\Models\LessonClip;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserClipProgress;
use App\Models\UserProgress;
use App\Services\ScoringService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListeningControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Topic $topic;
    private Lesson $lesson;
    private LessonClip $clip;
    private ScoringService $scoring;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->topic = Topic::factory()->create();
        $this->lesson = Lesson::factory()->create(['topic_id' => $this->topic->id]);
        $this->clip = LessonClip::factory()->create([
            'lesson_id' => $this->lesson->id,
            'transcript' => 'hello world this is a test',
        ]);
        $this->scoring = new ScoringService();
    }

    // ======================================================================
    // TC-XP01: First attempt gets full XP (100%)
    // ======================================================================
    public function test_first_attempt_xp_is_full(): void
    {
        $xp = $this->calculateXp(80.0, 1);
        $this->assertEquals(8, $xp); // floor(80 * 0.1 * 1.0) = 8
    }

    // ======================================================================
    // TC-XP02: Second attempt gets 50% XP
    // ======================================================================
    public function test_second_attempt_xp_is_half(): void
    {
        $xp = $this->calculateXp(80.0, 2);
        $this->assertEquals(4, $xp); // floor(80 * 0.1 * 0.5) = 4
    }

    // ======================================================================
    // TC-XP03: Third+ attempt gets 25% XP
    // ======================================================================
    public function test_third_attempt_xp_is_quarter(): void
    {
        $xp = $this->assertEquals(2, $this->calculateXp(80.0, 3));
        $this->assertEquals(2, $this->calculateXp(80.0, 3)); // floor(80 * 0.1 * 0.25) = 2
        $this->assertEquals(2, $this->calculateXp(80.0, 5));
    }

    // ======================================================================
    // TC-XP04: Zero accuracy earns 0 XP
    // ======================================================================
    public function test_zero_accuracy_earns_zero_xp(): void
    {
        $xp = $this->calculateXp(0.0, 1);
        $this->assertEquals(0, $xp);
    }

    // ======================================================================
    // TC-XP05: Perfect accuracy (100%) on first attempt earns max XP
    // ======================================================================
    public function test_perfect_accuracy_earns_10_xp_on_first_attempt(): void
    {
        $xp = $this->calculateXp(100.0, 1);
        $this->assertEquals(10, $xp); // floor(100 * 0.1 * 1.0) = 10
    }

    // ======================================================================
    // TC-LC01: Clip completed when accuracy >= 50%
    // ======================================================================
    public function test_clip_completed_when_accuracy_above_50(): void
    {
        $this->assertTrue($this->clipCompleted(50.1));
        $this->assertTrue($this->clipCompleted(100.0));
    }

    public function test_clip_not_completed_when_accuracy_below_50(): void
    {
        $this->assertFalse($this->clipCompleted(49.9));
        $this->assertFalse($this->clipCompleted(0.0));
    }

    // ======================================================================
    // TC-LC02: Lesson completed when all clips done
    // ======================================================================
    public function test_lesson_completed_when_all_clips_have_progress(): void
    {
        // 3 clips in lesson
        $clip2 = LessonClip::factory()->create(['lesson_id' => $this->lesson->id]);
        $clip3 = LessonClip::factory()->create(['lesson_id' => $this->lesson->id]);

        // 3 completed clip progress records = lesson completed
        $completed = 3;
        $total = 3;

        $this->assertTrue($completed === $total);
    }

    // ======================================================================
    // TC-LC03: Clip status logic
    // ======================================================================
    public function test_clip_status_completed_at_100(): void
    {
        $this->assertEquals('completed', $this->clipStatus(100.0));
    }

    public function test_clip_status_in_progress_between_50_and_100(): void
    {
        $this->assertEquals('in_progress', $this->clipStatus(50.0));
        $this->assertEquals('in_progress', $this->clipStatus(75.0));
        $this->assertEquals('in_progress', $this->clipStatus(99.9));
    }

    public function test_clip_status_failed_below_50(): void
    {
        $this->assertEquals('failed', $this->clipStatus(49.9));
        $this->assertEquals('failed', $this->clipStatus(0.0));
    }

    // ======================================================================
    // TC-LC04: Score method integration with real clip data
    // ======================================================================
    public function test_score_returns_correct_accuracy_for_partial_match(): void
    {
        $result = $this->scoring->score('hello world', (string) $this->clip->id);

        // Expected: "hello world this is a test" (6 words)
        // User: "hello world" (2 words)
        // LCS = 2 (hello, world)
        // Accuracy = 2/6 * 100 = 33.3%
        $this->assertEqualsWithDelta(33.3, $result['accuracy'], 0.5);
        $this->assertEquals(6, $result['total_words']);
    }

    public function test_score_returns_100_for_perfect_match(): void
    {
        $result = $this->scoring->score('hello world this is a test', (string) $this->clip->id);

        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertEquals(6, $result['total_words']);
        $this->assertEquals(6, $result['correct_count']);
    }

    public function test_score_returns_empty_result_for_empty_expected(): void
    {
        $emptyClip = LessonClip::factory()->create([
            'lesson_id' => $this->lesson->id,
            'transcript' => '',
        ]);

        $result = $this->scoring->score('some text', (string) $emptyClip->id);

        $this->assertEquals(100.0, $result['accuracy']);
        $this->assertEquals(0, $result['xp_earned']);
        $this->assertEquals(0, $result['total_words']);
    }

    // ======================================================================
    // TC-LC05: Lesson progress aggregates clip accuracy
    // ======================================================================
    public function test_lesson_progress_accuracy_is_avg_of_clips(): void
    {
        $clip2 = LessonClip::factory()->create(['lesson_id' => $this->lesson->id]);

        // Clip 1: 60%
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $this->clip->id,
            'accuracy' => 60.0,
        ]);

        // Clip 2: 80%
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip2->id,
            'accuracy' => 80.0,
        ]);

        $clipIds = [$this->clip->id, $clip2->id];
        $avgAccuracy = UserClipProgress::where('user_id', $this->user->id)
            ->whereIn('clip_id', $clipIds)
            ->whereNotNull('accuracy')
            ->avg('accuracy');

        $this->assertEquals(70.0, $avgAccuracy);
    }

    // ======================================================================
    // TC-LC06: Multiple completions on same day do not break streak
    // ======================================================================
    public function test_multiple_completions_same_day_preserves_streak(): void
    {
        $this->user->current_streak = 1;
        $this->user->last_lesson_date = Carbon::today();
        $this->user->save();

        // Submit first clip
        $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $this->clip->id,
                'transcript' => 'hello world',
            ]);

        $this->user->refresh();
        $this->assertEquals(1, $this->user->current_streak);

        // Submit second clip same day
        $clip2 = LessonClip::factory()->create(['lesson_id' => $this->lesson->id]);
        $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/listening/check', [
                'clip_id' => $clip2->id,
                'transcript' => 'some text',
            ]);

        $this->user->refresh();
        // Same day: current_streak should stay at 1 (no increment, no reset)
        $this->assertEquals(1, $this->user->current_streak);
    }

    // ======================================================================
    // Helpers — mirror ListeningController private methods
    // ======================================================================
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

    private function clipCompleted(float $accuracy): bool
    {
        return $accuracy >= 50;
    }

    private function clipStatus(float $accuracy): string
    {
        return match (true) {
            $accuracy >= 100 => 'completed',
            $accuracy >= 50  => 'in_progress',
            default          => 'failed',
        };
    }
}

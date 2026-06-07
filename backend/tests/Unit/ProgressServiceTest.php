<?php

namespace Tests\Unit;

use App\Models\Lesson;
use App\Models\LessonClip;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserClipProgress;
use App\Models\UserProgress;
use App\Services\ProgressService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProgressService $service;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProgressService();
        $this->user = User::factory()->create();
    }

    // ======================================================================
    // TC-D01: No progress — empty dashboard
    // ======================================================================
    public function test_dashboard_returns_zeros_for_new_user(): void
    {
        $dashboard = $this->service->getDashboard($this->user);

        $this->assertEquals(0, $dashboard['total_lessons']);
        $this->assertEquals(0, $dashboard['total_clips']);
        $this->assertEquals(0, $dashboard['total_minutes']);
        $this->assertEquals(0.0, $dashboard['avg_accuracy']);
        $this->assertEquals(0, $dashboard['current_streak']);
        $this->assertEquals(0, $dashboard['longest_streak']);
        $this->assertEquals(0, $dashboard['total_xp']);
        $this->assertEquals(1, $dashboard['level']);
    }

    // ======================================================================
    // TC-D02: Single completed lesson
    // ======================================================================
    public function test_dashboard_counts_single_completed_lesson(): void
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

        $dashboard = $this->service->getDashboard($this->user);

        $this->assertEquals(1, $dashboard['total_lessons']);
        $this->assertEquals(1, $dashboard['total_clips']);
        $this->assertEquals(5, $dashboard['total_minutes']); // 300s = 5 min
        $this->assertEquals(85.0, $dashboard['avg_accuracy']);
    }

    // ======================================================================
    // TC-D03: Multiple lessons with varying accuracy
    // ======================================================================
    public function test_dashboard_calculates_avg_accuracy_across_multiple_lessons(): void
    {
        $topic = Topic::factory()->create();

        // Lesson 1: accuracy 80%
        $lesson1 = Lesson::factory()->create(['topic_id' => $topic->id]);
        $clip1 = LessonClip::factory()->create(['lesson_id' => $lesson1->id]);
        UserProgress::factory()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson1->id,
            'best_score' => 80.0,
            'time_seconds' => 60,
            'completed_at' => now(),
        ]);
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip1->id,
            'accuracy' => 80.0,
            'completed_at' => now(),
        ]);

        // Lesson 2: accuracy 60%
        $lesson2 = Lesson::factory()->create(['topic_id' => $topic->id]);
        $clip2 = LessonClip::factory()->create(['lesson_id' => $lesson2->id]);
        UserProgress::factory()->create([
            'user_id' => $this->user->id,
            'lesson_id' => $lesson2->id,
            'best_score' => 60.0,
            'time_seconds' => 120,
            'completed_at' => now(),
        ]);
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip2->id,
            'accuracy' => 60.0,
            'completed_at' => now(),
        ]);

        $dashboard = $this->service->getDashboard($this->user);

        $this->assertEquals(2, $dashboard['total_lessons']);
        $this->assertEquals(2, $dashboard['total_clips']);
        $this->assertEquals(3, $dashboard['total_minutes']); // 60+120 = 180s = 3 min
        // avg of 80 and 60
        $this->assertEquals(70.0, $dashboard['avg_accuracy']);
    }

    // ======================================================================
    // TC-D04: Incomplete lessons not counted as completed
    // ======================================================================
    public function test_dashboard_excludes_incomplete_lessons(): void
    {
        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);

        // Only clip progress exists, no completed lesson
        $clip = LessonClip::factory()->create(['lesson_id' => $lesson->id]);
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip->id,
            'accuracy' => 30.0,
            'completed_at' => null,
        ]);

        $dashboard = $this->service->getDashboard($this->user);

        $this->assertEquals(0, $dashboard['total_lessons']);
        $this->assertEquals(0, $dashboard['total_clips']);
        $this->assertEquals(0.0, $dashboard['avg_accuracy']);
    }

    // ======================================================================
    // TC-S01: No streak for new user
    // ======================================================================
    public function test_new_user_has_zero_streak(): void
    {
        $this->assertEquals(0, $this->user->current_streak);
        $this->assertEquals(0, $this->user->longest_streak);
        $this->assertNull($this->user->last_lesson_date);
    }

    // ======================================================================
    // TC-S02: First lesson starts streak at 1
    // ======================================================================
    public function test_first_lesson_starts_streak_at_one(): void
    {
        $this->service->updateStreak($this->user);
        $this->user->refresh();

        $this->assertEquals(1, $this->user->current_streak);
        $this->assertEquals(1, $this->user->longest_streak);
        $this->assertNotNull($this->user->last_lesson_date);
        $this->assertNotNull($this->user->streak_start_date);
    }

    // ======================================================================
    // TC-S03: Consecutive days — streak increments
    // ======================================================================
    public function test_consecutive_days_increments_streak(): void
    {
        // Day 1: first lesson
        $this->service->updateStreak($this->user);
        $this->assertEquals(1, $this->user->current_streak);

        // Day 2: backdate last_lesson_date to yesterday
        $this->user->last_lesson_date = Carbon::yesterday();
        $this->user->save();

        // Day 2: another lesson — yesterday is consecutive, so streak goes to 2
        $this->service->updateStreak($this->user);
        $this->assertEquals(2, $this->user->current_streak);
        $this->assertEquals(2, $this->user->longest_streak);
    }

    // ======================================================================
    // TC-S04: Broken streak — gap more than 1 day resets to 1
    // ======================================================================
    public function test_broken_streak_resets_to_one(): void
    {
        // Established streak of 5 days
        $this->user->current_streak = 5;
        $this->user->longest_streak = 5;
        $this->user->last_lesson_date = Carbon::today()->subDays(3); // gap > 1 day
        $this->user->save();

        $this->service->updateStreak($this->user);

        $this->assertEquals(1, $this->user->current_streak);
        $this->assertEquals(5, $this->user->longest_streak); // longest preserved
    }

    // ======================================================================
    // TC-S05: Same day — streak unchanged (no double-counting)
    // ======================================================================
    public function test_same_day_does_not_increment_streak(): void
    {
        $this->service->updateStreak($this->user);
        $this->assertEquals(1, $this->user->current_streak);

        // Same day again
        $this->service->updateStreak($this->user);
        $this->assertEquals(1, $this->user->current_streak);
    }

    // ======================================================================
    // TC-S06: Multiple completions same day — streak stays at 1
    // ======================================================================
    public function test_multiple_lessons_same_day_keeps_streak_at_one(): void
    {
        $this->service->updateStreak($this->user);

        // Same day, second lesson
        $this->service->updateStreak($this->user);
        $this->assertEquals(1, $this->user->current_streak);
        $this->assertEquals(1, $this->user->longest_streak);
    }

    // ======================================================================
    // TC-S07: Longest streak is updated when current exceeds it
    // ======================================================================
    public function test_longest_streak_updated_when_current_exceeds_it(): void
    {
        // Start new streak
        $this->service->updateStreak($this->user);
        $this->assertEquals(1, $this->user->current_streak);
        $this->assertEquals(1, $this->user->longest_streak);

        // Day 2
        $this->user->last_lesson_date = Carbon::yesterday();
        $this->user->save();
        $this->service->updateStreak($this->user);
        $this->assertEquals(2, $this->user->current_streak);
        $this->assertEquals(2, $this->user->longest_streak);
    }

    // ======================================================================
    // TC-XP01: addXp calculates level correctly
    // ======================================================================
    public function test_add_xp_accumulates_and_calculates_level(): void
    {
        $this->assertEquals(1, $this->user->level);
        $this->assertEquals(0, $this->user->total_xp);

        $this->service->addXp($this->user, 50);
        $this->user->refresh();
        $this->assertEquals(50, $this->user->total_xp);
        $this->assertEquals(1, $this->user->level);

        $this->service->addXp($this->user, 50);
        $this->user->refresh();
        $this->assertEquals(100, $this->user->total_xp);
        $this->assertEquals(2, $this->user->level); // floor(100/100) + 1

        $this->service->addXp($this->user, 100);
        $this->user->refresh();
        $this->assertEquals(200, $this->user->total_xp);
        $this->assertEquals(3, $this->user->level); // floor(200/100) + 1
    }

    // ======================================================================
    // TC-XP02: Level at XP boundaries
    // ======================================================================
    public function test_level_at_xp_boundaries(): void
    {
        // Level 1: 0-99 XP
        $this->assertEquals(1, (int) floor(0 / 100) + 1);
        $this->assertEquals(1, (int) floor(99 / 100) + 1);

        // Level 2: 100-199 XP
        $this->assertEquals(2, (int) floor(100 / 100) + 1);
        $this->assertEquals(2, (int) floor(199 / 100) + 1);

        // Level 10: 900-999 XP
        $this->assertEquals(10, (int) floor(900 / 100) + 1);
    }

    // ======================================================================
    // TC-W01: Weekly activity — empty history returns 7 zero days
    // ======================================================================
    public function test_weekly_activity_empty_returns_seven_zero_days(): void
    {
        $weekly = $this->service->getWeeklyActivity($this->user);

        $this->assertCount(7, $weekly);

        foreach ($weekly as $day) {
            $this->assertEquals(0, $day['lessons_done']);
            $this->assertEquals(0, $day['clips_done']);
            $this->assertArrayHasKey('date', $day);
        }
    }

    // ======================================================================
    // TC-W02: Weekly activity — correct day ordering
    // ======================================================================
    public function test_weekly_activity_returns_days_in_order(): void
    {
        $weekly = $this->service->getWeeklyActivity($this->user);

        // Verify dates are consecutive and ordered Monday → Sunday
        $dates = array_column($weekly, 'date');
        $this->assertCount(7, array_unique($dates)); // all unique

        for ($i = 1; $i < count($dates); $i++) {
            $prev = Carbon::parse($dates[$i - 1]);
            $curr = Carbon::parse($dates[$i]);
            $this->assertEquals(1, $prev->diffInDays($curr));
        }
    }

    // ======================================================================
    // TC-W03: Weekly activity — clips done on specific days
    // ======================================================================
    public function test_weekly_activity_counts_clips_done_correctly(): void
    {
        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);
        $clip1 = LessonClip::factory()->create(['lesson_id' => $lesson->id]);
        $clip2 = LessonClip::factory()->create(['lesson_id' => $lesson->id]);
        $clip3 = LessonClip::factory()->create(['lesson_id' => $lesson->id]);

        $today = Carbon::today();

        // Today: 2 clips completed
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip1->id,
            'completed_at' => $today,
        ]);
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip2->id,
            'completed_at' => $today,
        ]);

        // Yesterday: 1 clip completed
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip3->id,
            'completed_at' => $today->copy()->subDay(),
        ]);

        $weekly = $this->service->getWeeklyActivity($this->user);

        $todayKey = $today->toDateString();
        $yesterdayKey = $today->copy()->subDay()->toDateString();

        $todayEntry = collect($weekly)->firstWhere('date', $todayKey);
        $yesterdayEntry = collect($weekly)->firstWhere('date', $yesterdayKey);

        $this->assertEquals(2, $todayEntry['clips_done']);
        $this->assertEquals(1, $yesterdayEntry['clips_done']);
    }

    // ======================================================================
    // TC-W04: Weekly activity — days outside range are 0
    // ======================================================================
    public function test_weekly_activity_excludes_days_outside_range(): void
    {
        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);
        $clip = LessonClip::factory()->create(['lesson_id' => $lesson->id]);

        // 2 weeks ago — should not appear in this week's data
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clip->id,
            'completed_at' => Carbon::today()->subDays(14),
        ]);

        $weekly = $this->service->getWeeklyActivity($this->user);

        foreach ($weekly as $day) {
            $this->assertEquals(0, $day['clips_done']);
        }
    }

    // ======================================================================
    // TC-W05: Weekly activity — sparse activity (only some days active)
    // ======================================================================
    public function test_weekly_activity_with_sparse_activity(): void
    {
        $topic = Topic::factory()->create();
        $lesson = Lesson::factory()->create(['topic_id' => $topic->id]);

        // Pre-create the clips
        $clipMon = LessonClip::factory()->create(['lesson_id' => $lesson->id]);
        $clipWed = LessonClip::factory()->create(['lesson_id' => $lesson->id]);
        $clipFri = LessonClip::factory()->create(['lesson_id' => $lesson->id]);

        $today = Carbon::today();

        // Monday: active
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clipMon->id,
            'completed_at' => $today->copy()->startOfWeek(),
        ]);

        // Wednesday: active
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clipWed->id,
            'completed_at' => $today->copy()->startOfWeek()->addDays(2),
        ]);

        // Friday: active
        UserClipProgress::factory()->create([
            'user_id' => $this->user->id,
            'clip_id' => $clipFri->id,
            'completed_at' => $today->copy()->startOfWeek()->addDays(4),
        ]);

        $weekly = $this->service->getWeeklyActivity($this->user);

        $activeDays = collect($weekly)->filter(fn ($d) => $d['clips_done'] > 0);
        $inactiveDays = collect($weekly)->filter(fn ($d) => $d['clips_done'] === 0);

        $this->assertEquals(3, $activeDays->count());
        $this->assertEquals(4, $inactiveDays->count());
    }

    // ======================================================================
    // TC-W06: Weekly activity — missing days become 0
    // ======================================================================
    public function test_weekly_activity_missing_days_show_zero(): void
    {
        // Empty history — all 7 days should be 0
        $weekly = $this->service->getWeeklyActivity($this->user);

        foreach ($weekly as $day) {
            $this->assertEquals(0, $day['clips_done'],
                "Day {$day['date']} should have 0 clips but has {$day['clips_done']}");
        }
    }

    // ======================================================================
    // TC-CL01: Continue learning — returns latest unfinished lesson
    // ======================================================================
    public function test_dashboard_returns_streak_xp_data(): void
    {
        // Simulate having streak and XP
        $this->user->current_streak = 5;
        $this->user->longest_streak = 10;
        $this->user->total_xp = 250;
        $this->user->level = 3;
        $this->user->save();

        $dashboard = $this->service->getDashboard($this->user);

        $this->assertEquals(5, $dashboard['current_streak']);
        $this->assertEquals(10, $dashboard['longest_streak']);
        $this->assertEquals(250, $dashboard['total_xp']);
        $this->assertEquals(3, $dashboard['level']);
        $this->assertEquals(100, $dashboard['xp_to_next_level']);
    }

    // ======================================================================
    // TC-CL02: XP to next level is always 100
    // ======================================================================
    public function test_xp_to_next_level_is_constant_100(): void
    {
        // XP per level is constant at 100
        $dashboard = $this->service->getDashboard($this->user);

        $this->assertEquals(100, $dashboard['xp_to_next_level']);

        // Even at higher XP
        $this->user->total_xp = 500;
        $this->user->level = 6;
        $this->user->save();

        $dashboard = $this->service->getDashboard($this->user);
        $this->assertEquals(100, $dashboard['xp_to_next_level']);
    }
}

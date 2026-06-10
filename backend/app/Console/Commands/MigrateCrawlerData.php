<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class MigrateCrawlerData extends Command
{
    protected $signature = 'migrate:crawler-data
                            {--fresh : Drop all data before migrating}
                            {--skip-clips : Skip lesson_clips (faster, for testing)}';

    protected $description = 'Migrate data from crawler SQLite database to Supabase PostgreSQL';

    private array $sectionToTopicMap = [];
    private array $sqliteLessonToLaravelLessonMap = [];

    public function handle(): int
    {
        $sqlitePath = base_path('../crawler/data/dailydictation.db');

        if (!file_exists($sqlitePath)) {
            $this->error("SQLite database not found at: {$sqlitePath}");
            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            $this->warn('Dropping all existing data...');
            $pgsql = DB::connection('pgsql');

            $tablesToDrop = [
                'user_clip_progress',
                'user_progress',
                'lesson_clips',
                'lessons',
                'topics',
                'daily_activities',
                'failed_jobs',
                'job_batches',
                'jobs',
                'cache',
                'cache_locks',
                'password_reset_tokens',
                'personal_access_tokens',
                'sessions',
                'users',
            ];

            foreach ($tablesToDrop as $table) {
                try {
                    $pgsql->statement("DROP TABLE IF EXISTS {$table} CASCADE");
                    $this->line("  Dropped: {$table}");
                } catch (\Throwable $e) {
                    // Table may not exist, ignore
                }
            }

            $pgsql->table('migrations')->delete();
            $this->warn('Re-running migrations...');
            Artisan::call('migrate', [], $this->output);
        }

        $this->info('Connecting to SQLite: ' . $sqlitePath);

        try {
            DB::connection('sqlite-crawler')->getPdo();
        } catch (\Exception $e) {
            $this->error('Failed to connect to SQLite. Make sure pdo_sqlite extension is installed.');
            $this->line($e->getMessage());
            return self::FAILURE;
        }

        $this->info('Starting migration...');
        $this->newLine();

        $startTime = microtime(true);

        $this->migrateTopics();
        $this->migrateLessons();
        $this->migrateLessonClips();
        $this->migrateSections();

        $elapsed = round(microtime(true) - $startTime, 2);
        $this->newLine();
        $this->info("Migration completed in {$elapsed}s");

        $this->printSummary();

        return self::SUCCESS;
    }

    private function migrateTopics(): void
    {
        $this->info('Step 1/4: Migrating topics...');

        $topics = DB::connection('sqlite-crawler')
            ->table('topics')
            ->orderBy('id')
            ->get();

        $bar = $this->output->createProgressBar($topics->count());
        $bar->start();

        $count = 0;
        foreach ($topics as $topic) {
            $levelMap = $this->parseLevels($topic->levels ?? '');
            $color = $this->assignColor($topic->slug, $topic->name);

            $laravelId = DB::connection('pgsql')->table('topics')->insertGetId([
                'name' => $topic->name,
                'slug' => $topic->slug,
                'description' => $topic->description,
                'color' => $color,
                'order_index' => $count,
                'is_active' => true,
                'created_at' => $topic->created_at ?? now(),
                'updated_at' => now(),
            ]);

            $this->sqliteToLaravelTopicMap[$topic->id] = $laravelId;

            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->line('');
        $this->info("  -> {$count} topics migrated.");
    }

    private function migrateLessons(): void
    {
        $this->info('Step 2/4: Migrating lessons...');

        $lessons = DB::connection('sqlite-crawler')
            ->table('lessons')
            ->orderBy('id')
            ->get();

        $bar = $this->output->createProgressBar($lessons->count());
        $bar->start();

        $count = 0;
        foreach ($lessons as $lesson) {
            $laravelTopicId = $this->resolveLaravelTopicId($lesson->section_id);

            $slug = $this->generateSlug($lesson->name ?? $lesson->lesson_name ?? 'lesson-' . $lesson->id);
            $level = $this->mapVocabLevel($lesson->vocab_level);
            $duration = $this->estimateDuration($lesson->parts_count, $lesson->vocab_level);
            $name = $lesson->lesson_name ?? $lesson->name ?? 'Lesson ' . $lesson->id;

            $laravelLessonId = DB::connection('pgsql')->table('lessons')->insertGetId([
                'topic_id' => $laravelTopicId,
                'name' => $name,
                'slug' => $slug,
                'audio_path' => $lesson->audio_src,
                'duration' => $duration,
                'vocab_level' => $level,
                'order_index' => $count,
                'practice_count' => 0,
                'avg_accuracy' => 0,
                'created_at' => $lesson->created_at ?? now(),
                'updated_at' => now(),
            ]);

            $this->sqliteLessonToLaravelLessonMap[$lesson->id] = $laravelLessonId;
            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->line('');
        $this->info("  -> {$count} lessons migrated.");
    }

    private function migrateLessonClips(): void
    {
        if ($this->option('skip-clips')) {
            $this->warn('Step 3/4: Skipping lesson_clips (--skip-clips flag).');
            return;
        }

        $this->info('Step 3/4: Migrating lesson_clips...');

        $challenges = DB::connection('sqlite-crawler')
            ->table('challenges')
            ->orderBy('lesson_id')
            ->orderBy('position')
            ->get();

        $bar = $this->output->createProgressBar($challenges->count());
        $bar->start();

        $batch = [];
        $batchSize = 500;
        $count = 0;

        foreach ($challenges as $challenge) {
            if (!isset($this->sqliteLessonToLaravelLessonMap[$challenge->lesson_id])) {
                $bar->advance();
                continue;
            }

            $duration = $this->calculateDuration($challenge->time_start, $challenge->time_end);

            $batch[] = [
                'lesson_id' => $this->sqliteLessonToLaravelLessonMap[$challenge->lesson_id],
                'transcript' => $challenge->content,
                'audio_path' => $challenge->audio_src,
                'duration' => $duration,
                'order_index' => $challenge->position ?? $count,
                'created_at' => $challenge->created_at ?? now(),
                'updated_at' => now(),
            ];

            if (count($batch) >= $batchSize) {
                DB::connection('pgsql')->table('lesson_clips')->insert($batch);
                $count += count($batch);
                $batch = [];
            }

            $bar->advance();
        }

        if (!empty($batch)) {
            DB::connection('pgsql')->table('lesson_clips')->insert($batch);
            $count += count($batch);
        }

        $bar->finish();
        $this->line('');
        $this->info("  -> {$count} lesson_clips migrated.");
    }

    private function migrateSections(): void
    {
        $this->info('Step 4/4: Migrating sections as topic metadata...');

        $sections = DB::connection('sqlite-crawler')
            ->table('sections')
            ->orderBy('id')
            ->get();

        $bar = $this->output->createProgressBar($sections->count());
        $bar->start();

        $count = 0;
        foreach ($sections as $section) {
            $laravelTopicId = $this->sqliteToLaravelTopicMap[$section->topic_id] ?? null;
            if (!$laravelTopicId) {
                $bar->advance();
                continue;
            }

            $currentDescription = DB::connection('pgsql')
                ->table('topics')
                ->where('id', $laravelTopicId)
                ->value('description');

            $sectionInfo = "Section: {$section->name}";
            $newDescription = $currentDescription
                ? $currentDescription . "\n" . $sectionInfo
                : $sectionInfo;

            DB::connection('pgsql')
                ->table('topics')
                ->where('id', $laravelTopicId)
                ->update(['description' => $newDescription]);

            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->line('');
        $this->info("  -> {$count} sections integrated into topics.");
    }

    private function resolveLaravelTopicId(?int $sectionId): int
    {
        if (!$sectionId) {
            return DB::connection('pgsql')->table('topics')->first()->id ?? 1;
        }

        if (!isset($this->sectionToTopicMap[$sectionId])) {
            $sqliteTopicId = DB::connection('sqlite-crawler')
                ->table('sections')
                ->where('id', $sectionId)
                ->value('topic_id');

            $this->sectionToTopicMap[$sectionId] = $this->sqliteToLaravelTopicMap[$sqliteTopicId]
                ?? DB::connection('pgsql')->table('topics')->first()->id ?? 1;
        }

        return $this->sectionToTopicMap[$sectionId];
    }

    private function parseLevels(string $levels): array
    {
        preg_match_all('/(A1|A2|B1|B2|C1|C2)/', $levels, $matches);
        return $matches[0] ?? [];
    }

    private function assignColor(string $slug, string $name): string
    {
        $colors = [
            'short-stories' => '#8B5CF6',
            'english-conversations' => '#35375B',
            'stories-for-kids' => '#F59E0B',
            'toeic' => '#10B981',
            'ielts-listening' => '#00BE7C',
            'youtube' => '#EF4444',
            'news' => '#3B82F6',
            'ted-ed' => '#EC4899',
            'toefl-listening' => '#6366F1',
            'medical-english-oet' => '#14B8A6',
        ];

        return $colors[$slug] ?? $this->hashColor($name);
    }

    private function hashColor(string $name): string
    {
        $colors = ['#FF5632', '#2B5F8E', '#8B5CF6', '#F59E0B', '#10B981'];
        $index = abs(crc32($name)) % count($colors);
        return $colors[$index];
    }

    private function mapVocabLevel(?string $level): string
    {
        if (!$level) return 'beginner';

        $level = strtoupper(trim($level));

        if (str_contains($level, 'A1') || str_contains($level, 'BEGINNER')) {
            return 'beginner';
        }
        if (str_contains($level, 'C1') || str_contains($level, 'C2') || str_contains($level, 'ADVANCED')) {
            return 'advanced';
        }
        if (str_contains($level, 'A2') || str_contains($level, 'B1') || str_contains($level, 'B2') || str_contains($level, 'INTERMEDIATE')) {
            return 'intermediate';
        }

        return 'beginner';
    }

    private function estimateDuration(?int $partsCount, ?string $vocabLevel): int
    {
        if (!$partsCount) {
            return match ($this->mapVocabLevel($vocabLevel)) {
                'advanced' => 300,
                'intermediate' => 180,
                default => 120,
            };
        }

        $secondsPerClip = match ($this->mapVocabLevel($vocabLevel)) {
            'advanced' => 12,
            'intermediate' => 10,
            default => 8,
        };

        return $partsCount * $secondsPerClip;
    }

    private function calculateDuration(?string $start, ?string $end): ?int
    {
        if (!$start || !$end) {
            return null;
        }

        $parse = function (string $t): float {
            $parts = explode(':', trim($t));
            if (count($parts) === 2) {
                return (float) $parts[0] * 60 + (float) $parts[1];
            }
            return (float) $t;
        };

        try {
            $duration = $parse($end) - $parse($start);
            return max(1, (int) round($duration));
        } catch (\Throwable) {
            return null;
        }
    }

    private function generateSlug(string $name): string
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s_]+/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');

        if (empty($slug)) {
            $slug = 'lesson-' . substr(md5($name), 0, 8);
        }

        $originalSlug = $slug;
        $counter = 1;

        while (DB::connection('pgsql')->table('lessons')->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        return $slug;
    }

    private function printSummary(): void
    {
        $this->newLine();
        $this->info('=== Migration Summary ===');

        $tables = ['topics', 'lessons', 'lesson_clips'];
        foreach ($tables as $table) {
            $count = DB::connection('pgsql')->table($table)->count();
            $this->line("  {$table}: {$count} rows");
        }

        $this->newLine();
        $this->warn('Note: Run `php artisan migrate` first if tables do not exist.');
        $this->line('If you get foreign key errors, make sure topics are migrated first.');
    }
}

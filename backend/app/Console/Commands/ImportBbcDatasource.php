<?php

namespace App\Console\Commands;

use App\Models\ListeningExternalLesson;
use App\Models\ListeningSource;
use App\Models\BbcLessonVocabularyCache;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImportBbcDatasource extends Command
{
    protected $signature = 'import:bbc-datasource
                            {--path=/Users/edward/Documents/GitHub/drivesmart--traffic-rules-learning-platform/bbc_listening_datasource}
                            {--dry-run : Show what would be imported without importing}';

    protected $description = 'Import BBC lessons from bbc_listening_datasource folder';

    private int $imported = 0;
    private int $skipped = 0;

    public function handle(): int
    {
        $basePath = $this->option('path');
        $dryRun = $this->option('dry-run');

        if (!File::exists($basePath)) {
            $this->error("Path not found: {$basePath}");
            return self::FAILURE;
        }

        // Get or create BBC source
        $source = ListeningSource::firstOrCreate(
            ['slug' => 'bbc-learning-english'],
            [
                'name' => 'BBC Learning English',
                'description' => 'BBC 6 Minute English lessons',
            ]
        );

        $this->info("Source ID: {$source->id}");

        $folders = File::directories($basePath);
        $count = count($folders);
        $this->info("Found {$count} lesson folders");

        $this->withProgressBar($folders, function ($folder) use ($source, $dryRun) {
            $this->importLesson($folder, $source, $dryRun);
        });

        $this->newLine();
        $this->info("Imported: {$this->imported}, Skipped: {$this->skipped}");

        return self::SUCCESS;
    }

    private function importLesson(string $folder, ListeningSource $source, bool $dryRun): void
    {
        $metadataPath = $folder . '/metadata.json';

        if (!File::exists($metadataPath)) {
            $this->skipped++;
            return;
        }

        $metadata = json_decode(File::get($metadataPath), true);

        if (!$metadata) {
            $this->skipped++;
            return;
        }

        $slug = $metadata['folder'] ?? basename($folder);

        // Check if lesson exists
        $exists = ListeningExternalLesson::where('source_id', $source->id)
            ->where('slug', $slug)
            ->exists();

        if ($exists) {
            $this->skipped++;
            return;
        }

        if ($dryRun) {
            $this->line("  [DRY-RUN] Would import: {$metadata['title']}");
            $this->imported++;
            return;
        }

        // Load audio segments for dictation
        $audioSegments = [];
        $segmentsPath = $folder . '/audio/clips/segments.json';
        if (File::exists($segmentsPath)) {
            $audioSegments = json_decode(File::get($segmentsPath), true) ?? [];
        }

        // Build dictation segments
        $dictationSegments = [];
        foreach ($audioSegments as $segment) {
            $dictationSegments[] = [
                'id' => $segment['id'] ?? count($dictationSegments),
                'start' => $segment['start'] ?? 0,
                'end' => $segment['end'] ?? 0,
                'text' => $segment['text'] ?? '',
                'file' => $segment['file'] ?? '',
            ];
        }

        // Calculate duration from segments
        $durationSeconds = !empty($dictationSegments)
            ? end($dictationSegments)['end']
            : ($metadata['duration_seconds'] ?? 360);

        // Create lesson
        $lesson = ListeningExternalLesson::create([
            'source_id' => $source->id,
            'title' => $metadata['title'] ?? $slug,
            'slug' => $slug,
            'source_url' => $metadata['source_url'] ?? '',
            'thumbnail_url' => $metadata['thumbnail_url'] ?? null,
            'level' => $metadata['level'] ?? 'intermediate',
            'duration_seconds' => (int) $durationSeconds,
            'published_at' => $metadata['published_at'] ?? null,
            'metadata_json' => [
                'episode_code' => $metadata['episode_code'] ?? null,
                'bbc_programme_id' => $metadata['bbc_programme_id'] ?? null,
                'description' => $metadata['description'] ?? null,
                'introduction' => $metadata['introduction'] ?? null,
                'vocabulary_count' => $metadata['vocabulary_count'] ?? 0,
                'audio_url' => $metadata['audio_url'] ?? null,
                'pdf_url' => $metadata['pdf_url'] ?? null,
                'iframe_url' => $metadata['iframe_url'] ?? null,
                'dictation_segments' => $dictationSegments,
                'has_audio_segments' => !empty($dictationSegments),
            ],
        ]);

        // Import vocabulary
        if (!empty($metadata['vocabulary'])) {
            foreach ($metadata['vocabulary'] as $vocab) {
                BbcLessonVocabularyCache::create([
                    'lesson_id' => $lesson->id,
                    'word' => $vocab['word'] ?? '',
                    'meaning' => $vocab['meaning'] ?? null,
                    'position' => $vocab['position'] ?? 0,
                ]);
            }
        }

        $this->imported++;
    }
}

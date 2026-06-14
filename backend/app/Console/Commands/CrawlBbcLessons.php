<?php

namespace App\Console\Commands;

use App\Services\BbcService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CrawlBbcLessons extends Command
{
    protected $signature = 'crawl:bbc-lessons
                            {--limit=0 : Maximum number of lessons to crawl (0 = unlimited)}';

    protected $description = 'Crawl lesson metadata from BBC Learning English';

    private BbcService $bbcService;

    private array $levelMap = [
        'A1' => 'beginner',
        'A2' => 'beginner',
        'B1' => 'intermediate',
        'B2' => 'intermediate',
        'C1' => 'advanced',
        'C2' => 'advanced',
    ];

    public function __construct(BbcService $bbcService)
    {
        parent::__construct();
        $this->bbcService = $bbcService;
    }

    public function handle(): int
    {
        $this->info('Starting BBC Learning English crawl...');

        $this->bbcService->ensureSourceExists();
        $limit = (int) $this->option('limit');

        $lessons = $this->fetchLessonList();

        if ($limit > 0) {
            $lessons = array_slice($lessons, 0, $limit);
        }

        $this->info("Found {$lessons['total']} lessons. Processing " . count($lessons['items']) . " items...");

        $bar = $this->output->createProgressBar(count($lessons['items']));
        $bar->start();

        $created = 0;
        $updated = 0;
        $errors = 0;

        foreach ($lessons['items'] as $lessonData) {
            try {
                $existing = $this->bbcService->upsertLesson($lessonData);

                if ($existing->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            } catch (\Throwable $e) {
                $errors++;
                Log::error('BBC crawl failed for lesson: ' . ($lessonData['slug'] ?? 'unknown'), [
                    'error' => $e->getMessage(),
                    'lesson' => $lessonData,
                ]);
                $this->error("\n  Error: " . $e->getMessage());
            }

            $bar->advance();

            usleep(200000);
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("=== Crawl Complete ===");
        $this->line("  Created: {$created}");
        $this->line("  Updated: {$updated}");
        $this->line("  Errors:  {$errors}");

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function fetchLessonList(): array
    {
        $items = [];
        $total = 0;
        $page = 1;
        $perPage = 50;
        $maxPages = 50;

        while ($page <= $maxPages) {
            try {
                $this->line("  Fetching page {$page}...");

                $response = Http::timeout(30)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (compatible; DriveSmartBot/1.0)',
                        'Accept' => 'application/json',
                    ])
                    ->get('https://www.bbc.co.uk/learningenglish/english/course/lower-intermediate', [
                        'page' => $page,
                    ]);

                if (! $response->successful()) {
                    $this->warn("  Page {$page} returned status {$response->status()}. Stopping.");
                    break;
                }

                $html = $response->body();

                $parsed = $this->parseLessonItems($html);

                if (empty($parsed)) {
                    break;
                }

                $items = array_merge($items, $parsed);
                $total += count($parsed);

                if (count($parsed) < $perPage) {
                    break;
                }

                $page++;
                usleep(300000);
            } catch (\Throwable $e) {
                Log::error("BBC crawl page {$page} failed", ['error' => $e->getMessage()]);
                $this->warn("  Failed to fetch page {$page}: " . $e->getMessage());
                break;
            }
        }

        return ['items' => $items, 'total' => $total];
    }

    private function parseLessonItems(string $html): array
    {
        $items = [];

        $pattern = '/<a\s+href="(\/learningenglish\/english\/course\/lower-intermediate\/[^"]+)"[^>]*>\s*<[^>]*>\s*([^<]+)<\/[^>]*>\s*([^<]*)/is';

        if (preg_match_all($pattern, $html, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $url = 'https://www.bbc.co.uk' . ltrim($match[1], '/');
                $slug = $this->extractSlug($match[1]);
                $title = trim(strip_tags($match[2]));

                if (empty($title) || empty($slug)) {
                    continue;
                }

                $items[] = [
                    'title' => $title,
                    'slug' => $slug,
                    'source_url' => $url,
                    'thumbnail_url' => null,
                    'level' => 'intermediate',
                    'duration_seconds' => null,
                    'published_at' => null,
                    'metadata_json' => null,
                ];
            }
        }

        if (empty($items)) {
            $altPattern = '/<a[^>]+href=["\'](\/learningenglish\/english\/course\/[^"\']+)["\'][^>]*>([^<]+)/is';
            if (preg_match_all($altPattern, $html, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $url = 'https://www.bbc.co.uk' . ltrim($match[1], '/');
                    $slug = $this->extractSlug($match[1]);
                    $title = trim(strip_tags($match[2]));

                    if (empty($title) || empty($slug) || str_contains($slug, 'course')) {
                        continue;
                    }

                    $items[] = [
                        'title' => $title,
                        'slug' => $slug,
                        'source_url' => $url,
                        'thumbnail_url' => null,
                        'level' => $this->detectLevel($match[1]),
                        'duration_seconds' => null,
                        'published_at' => null,
                        'metadata_json' => null,
                    ];
                }
            }
        }

        return $items;
    }

    private function extractSlug(string $url): string
    {
        $segments = explode('/', trim($url, '/'));
        $segments = array_filter($segments, fn ($s) => ! in_array($s, ['learningenglish', 'english', 'course', 'lower-intermediate', 'intermediate', 'advanced']));

        if (empty($segments)) {
            return 'lesson-' . substr(md5($url), 0, 8);
        }

        $slug = implode('-', $segments);

        $slug = strtolower(trim($slug));
        $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');

        return $slug ?: 'lesson-' . substr(md5($url), 0, 8);
    }

    private function detectLevel(string $url): string
    {
        $url = strtolower($url);

        if (str_contains($url, 'beginner') || str_contains($url, 'a1') || str_contains($url, 'a2')) {
            return 'beginner';
        }
        if (str_contains($url, 'advanced') || str_contains($url, 'c1') || str_contains($url, 'c2')) {
            return 'advanced';
        }

        return 'intermediate';
    }
}

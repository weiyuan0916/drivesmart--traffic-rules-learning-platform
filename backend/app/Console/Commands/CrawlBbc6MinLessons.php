<?php

namespace App\Console\Commands;

use App\Services\BbcService;
use App\Services\BbcTranscriptParser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CrawlBbc6MinLessons extends Command
{
    protected $signature = 'crawl:bbc-6min
                            {--limit=0 : Maximum number of lessons to crawl (0 = unlimited)}';

    protected $description = 'Crawl BBC 6 Minute English lessons with transcript segments';

    private BbcService $bbcService;
    private BbcTranscriptParser $parser;

    public function __construct(BbcService $bbcService, BbcTranscriptParser $parser)
    {
        parent::__construct();
        $this->bbcService = $bbcService;
        $this->parser = $parser;
    }

    public function handle(): int
    {
        $this->info('Starting BBC 6 Minute English crawl...');

        $this->bbcService->ensureSourceExists();
        $limit = (int) $this->option('limit');

        $episodes = $this->fetchEpisodeList();

        if ($limit > 0) {
            $episodes = array_slice($episodes, 0, $limit);
        }

        $this->info("Found " . count($episodes) . " episodes. Processing...");

        $bar = $this->output->createProgressBar(count($episodes));
        $bar->start();

        $created = 0;
        $updated = 0;
        $withTranscripts = 0;
        $errors = 0;

        foreach ($episodes as $episode) {
            try {
                $result = $this->processEpisode($episode);

                if ($result['created']) {
                    $created++;
                } else {
                    $updated++;
                }

                if ($result['has_transcript']) {
                    $withTranscripts++;
                }
            } catch (\Throwable $e) {
                $errors++;
                Log::error('BBC 6ME crawl failed: ' . ($episode['slug'] ?? 'unknown'), [
                    'error' => $e->getMessage(),
                ]);
                $this->error("\n  Error: " . $e->getMessage());
            }

            $bar->advance();
            usleep(300000); // 300ms delay between requests
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("=== Crawl Complete ===");
        $this->line("  Created: {$created}");
        $this->line("  Updated: {$updated}");
        $this->line("  With transcripts: {$withTranscripts}");
        $this->line("  Errors: {$errors}");

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function fetchEpisodeList(): array
    {
        $items = [];
        $page = 1;
        $maxPages = 10;

        while ($page <= $maxPages) {
            try {
                $this->line("  Fetching page {$page}...");

                $response = Http::timeout(30)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (compatible; DriveSmartBot/1.0)',
                        'Accept' => 'text/html,application/xhtml+xml',
                    ])
                    ->get('https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', [
                        'page' => $page,
                    ]);

                if (! $response->successful()) {
                    $this->warn("  Page {$page} returned status {$response->status()}. Stopping.");
                    break;
                }

                $html = $response->body();
                $parsed = $this->parseEpisodeItems($html);

                if (empty($parsed)) {
                    break;
                }

                $items = array_merge($items, $parsed);

                if (count($parsed) < 20) {
                    break;
                }

                $page++;
                usleep(300000);
            } catch (\Throwable $e) {
                Log::error("BBC 6ME page {$page} failed", ['error' => $e->getMessage()]);
                $this->warn("  Failed to fetch page {$page}: " . $e->getMessage());
                break;
            }
        }

        return $items;
    }

    private function parseEpisodeItems(string $html): array
    {
        $items = [];

        // Match episode links from BBC 6 Minute English pages
        // Pattern: URLs like /learningenglish/english/features/6-minute-english/ep-XXXXXX
        $pattern = '/<a\s+href="(\/learningenglish\/english\/features\/6-minute-english\/ep-[^"\']+)"[^>]*>\s*([^<]+)<\/[^>]*>/is';

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
                    'episode_code' => $this->extractEpisodeCode($match[1]),
                ];
            }
        }

        // Also try to extract from data attributes and JSON
        if (empty($items)) {
            $jsonPattern = '/"url"\s*:\s*"([^"]*6-minute-english\/ep-[^"]+)"/';
            if (preg_match_all($jsonPattern, $html, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $url = 'https://www.bbc.co.uk' . ltrim($match[1], '/');
                    $slug = $this->extractSlug($match[1]);

                    if (empty($slug)) {
                        continue;
                    }

                    $items[] = [
                        'title' => 'BBC 6 Minute English Episode',
                        'slug' => $slug,
                        'source_url' => $url,
                        'episode_code' => $this->extractEpisodeCode($match[1]),
                    ];
                }
            }
        }

        return $items;
    }

    private function extractSlug(string $url): string
    {
        if (preg_match('/ep-(\d+)/', $url, $m)) {
            return 'ep-' . $m[1];
        }

        $segments = explode('/', trim($url, '/'));
        $segments = array_filter($segments, fn ($s) => ! in_array($s, ['learningenglish', 'english', 'features', '6-minute-english']));

        if (empty($segments)) {
            return 'episode-' . substr(md5($url), 0, 8);
        }

        $slug = implode('-', $segments);
        $slug = strtolower(trim($slug));
        $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
        $slug = preg_replace('/-+/', '-', $slug);

        return trim($slug, '-') ?: 'episode-' . substr(md5($url), 0, 8);
    }

    private function extractEpisodeCode(string $url): string
    {
        if (preg_match('/(ep-\d+)/', $url, $m)) {
            return $m[1];
        }
        return '';
    }

    private function processEpisode(array $episode): array
    {
        $episodeCode = $episode['episode_code'] ?? '';
        $titleSlug = $this->slugify($episode['title']);

        // Construct PDF URL
        $pdfUrl = "https://downloads.bbc.co.uk/learningenglish/features/6min/{$episodeCode}_6_minute_english_{$titleSlug}_transcript.pdf";

        $metadata = [
            'transcript_pdf_url' => $pdfUrl,
            'audio_url' => null,
            'episode_code' => $episodeCode,
            'segments' => [],
        ];

        $hasTranscript = false;

        // Attempt to fetch and parse PDF
        try {
            $pdfResponse = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; DriveSmartBot/1.0)'])
                ->get($pdfUrl);

            if ($pdfResponse->successful()) {
                $rawText = $this->extractTextFromPdf($pdfResponse->body());
                if (! empty(trim($rawText))) {
                    $segments = $this->parser->splitIntoSegments($rawText);
                    if (! empty($segments)) {
                        $metadata['segments'] = $segments;
                        $hasTranscript = true;
                        $this->info("  ✓ Transcript parsed: " . count($segments) . " segments");
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning("PDF fetch failed for {$episodeCode}", ['error' => $e->getMessage()]);
            // No transcript available — lesson still created, just without segments
        }

        $lesson = $this->bbcService->upsertLesson([
            'title' => $episode['title'],
            'slug' => $episode['slug'],
            'source_url' => $episode['source_url'],
            'thumbnail_url' => null,
            'level' => 'intermediate',
            'duration_seconds' => 360,
            'published_at' => $this->parseDateFromCode($episodeCode),
            'metadata_json' => $metadata,
        ]);

        return [
            'created' => $lesson->wasRecentlyCreated,
            'has_transcript' => $hasTranscript,
        ];
    }

    private function extractTextFromPdf(string $pdfBody): string
    {
        // Simple PDF text extraction without external library
        // BBC PDFs use simple text encoding — extract readable ASCII sequences
        $text = '';

        for ($i = 0; $i < strlen($pdfBody); $i++) {
            $byte = ord($pdfBody[$i]);

            // Accept printable ASCII and common punctuation
            if (($byte >= 32 && $byte <= 126) || $byte === 10 || $byte === 13) {
                $text .= chr($byte);
            }
        }

        // Clean up the extracted text
        $lines = explode("\n", $text);
        $cleanLines = [];

        foreach ($lines as $line) {
            $line = trim($line);
            // Only keep lines with mostly alphabetic content
            if (preg_match('/[a-zA-Z]{3,}/', $line)) {
                $cleanLines[] = $line;
            }
        }

        return implode("\n", $cleanLines);
    }

    private function slugify(string $text): string
    {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        $text = trim($text, '-');
        return $text;
    }

    private function parseDateFromCode(string $episodeCode): ?string
    {
        // Code format: ep-260611 → year=26, month=06, day=11
        if (preg_match('/ep-(\d{2})(\d{2})(\d{2})/', $episodeCode, $m)) {
            $year = '20' . $m[1];
            $month = $m[2];
            $day = $m[3];
            return "{$year}-{$month}-{$day} 00:00:00";
        }
        return null;
    }
}

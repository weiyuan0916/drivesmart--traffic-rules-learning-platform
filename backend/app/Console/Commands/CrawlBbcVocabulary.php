<?php

namespace App\Console\Commands;

use App\Models\ListeningExternalLesson;
use App\Services\BbcCatalogService;
use App\Services\BbcVocabularyCacheService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * CrawlBbcVocabulary — vocabulary metadata cache for BBC lessons.
 *
 * Compliance: .cursor/rules/bbc-feature.mdc
 *
 * Reads the public BBC episode page and extracts:
 *   - the word itself
 *   - a one-line brief meaning (max 500 chars)
 *
 * It does NOT store the full transcript, the audio file, or any
 * extended definition. The brief_meaning field is capped at 500
 * characters to ensure we only cache short snippet metadata.
 *
 * Usage:
 *   php artisan crawl:bbc-vocabulary
 *   php artisan crawl:bbc-vocabulary --lesson=ep-260528
 *   php artisan crawl:bbc-vocabulary --limit=10
 */
class CrawlBbcVocabulary extends Command
{
    protected $signature = 'crawl:bbc-vocabulary
                            {--lesson= : Specific lesson slug to crawl (e.g. ep-260528)}
                            {--limit=0 : Maximum number of lessons to crawl (0 = all)}';

    protected $description = 'Crawl vocabulary metadata (word + brief meaning) from BBC episode pages';

    public function __construct(
        private readonly BbcCatalogService $catalog,
        private readonly BbcVocabularyCacheService $cache
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starting BBC vocabulary cache crawl...');
        $this->catalog->ensureSourceExists();

        $specificLesson = $this->option('lesson');
        $limit = (int) $this->option('limit');

        if ($specificLesson) {
            $lessons = $this->catalog->listLessons(['per_page' => 1, 'search' => $specificLesson])->getCollection();
        } else {
            $perPage = $limit > 0 ? $limit : 100;
            $lessons = $this->catalog->listLessons(['per_page' => $perPage])->getCollection();
        }

        if ($lessons->isEmpty()) {
            $this->warn('No lessons found.');
            return self::SUCCESS;
        }

        $this->info("Processing {$lessons->count()} lessons...");
        $bar = $this->output->createProgressBar($lessons->count());
        $bar->start();

        $cached = 0;
        $errors = 0;

        foreach ($lessons as $lesson) {
            try {
                $items = $this->fetchVocabularyFromPage($lesson);
                if (! empty($items)) {
                    $this->cache->clearForLesson($lesson->id);
                    $this->cache->addBulk($lesson->id, $items);
                    $cached++;
                }
            } catch (\Throwable $e) {
                $errors++;
                Log::warning('BBC vocabulary crawl failed: ' . $lesson->slug, [
                    'error' => $e->getMessage(),
                ]);
            }
            $bar->advance();
            usleep(300000); // 300ms politeness delay
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("=== Vocabulary Crawl Complete ===");
        $this->line("  Lessons cached: {$cached}");
        $this->line("  Errors: {$errors}");

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Fetch a BBC episode page and extract vocabulary items.
     *
     * BBC's "Vocabulary" section on episode pages has a predictable
     * structure. We use a deliberately conservative regex that only
     * matches the visible glossary items, not full transcript content.
     */
    private function fetchVocabularyFromPage(ListeningExternalLesson $lesson): array
    {
        $response = Http::timeout(20)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible; DriveSmartBot/1.0; +https://drivesmart.example)',
                'Accept' => 'text/html,application/xhtml+xml',
            ])
            ->get($lesson->source_url);

        if (! $response->successful()) {
            throw new \RuntimeException("HTTP {$response->status()}");
        }

        $html = $response->body();
        return $this->parseVocabularyFromHtml($html);
    }

    /**
     * Parse vocabulary terms from a BBC episode page HTML.
     *
     * BBC's vocabulary section uses markup like:
     *   <h3>word</h3>
     *   <p>brief one-line definition</p>
     *
     * We grab the first <p> after each <h3> within the vocabulary
     * section, capped to a short snippet. We do not parse full
     * paragraphs, examples, or transcript content.
     */
    private function parseVocabularyFromHtml(string $html): array
    {
        $items = [];

        // Find the vocabulary section. BBC Learning English typically
        // wraps it in a section with id="vocab" or class="vocab".
        $sectionPattern = '/<(?:section|div)[^>]*\b(?:id|class)=["\'][^"\']*\bvocab\w*[^"\']*["\'][^>]*>(.*?)<\/(?:section|div)>/is';
        if (! preg_match($sectionPattern, $html, $sectionMatch)) {
            // Fallback: try to find a heading "Vocabulary" and grab the next siblings
            if (preg_match('/<h\d[^>]*>\s*Vocabulary\s*<\/h\d>(.*?)<h\d/is', $html, $fallbackMatch)) {
                $sectionHtml = $fallbackMatch[1];
            } else {
                return [];
            }
        } else {
            $sectionHtml = $sectionMatch[1];
        }

        // Match each word+definition pair
        // Pattern: <h3>WORD</h3> ... <p>definition</p>
        $pairPattern = '/<h[1-6][^>]*>\s*([A-Za-z][A-Za-z\s\-\']{0,80})\s*<\/h[1-6]>\s*<p[^>]*>\s*([^<]{1,500})\s*<\/p>/is';

        if (preg_match_all($pairPattern, $sectionHtml, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $i => $match) {
                $word = trim(strip_tags($match[1]));
                $meaning = trim(strip_tags($match[2]));
                $meaning = preg_replace('/\s+/', ' ', $meaning);
                if ($word === '' || $meaning === '') {
                    continue;
                }
                $items[] = [
                    'word' => $word,
                    'brief_meaning' => mb_substr($meaning, 0, 500),
                    'position' => $i,
                ];
            }
        }

        return $items;
    }
}

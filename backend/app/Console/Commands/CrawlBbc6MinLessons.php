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

    protected $description = '[DEPRECATED] Previously crawled BBC 6 Minute English transcripts — disabled per content policy';

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
        $this->error('⛔  crawl:bbc-6min is DEPRECATED and disabled.');
        $this->newLine();
        $this->line('This command previously downloaded BBC transcript PDFs and stored');
        $this->line('them in metadata_json.segments. That behavior violates our content');
        $this->line('policy defined in .cursor/rules/bbc-feature.mdc, which states:');
        $this->newLine();
        $this->line('  • Do NOT download BBC audio files');
        $this->line('  • Do NOT rehost BBC audio');
        $this->line('  • Do NOT store BBC transcripts');
        $this->line('  • Do NOT republish BBC content');
        $this->newLine();
        $this->info('Use these commands instead:');
        $this->line('  • crawl:bbc-lessons          → rule-compliant metadata-only crawler');
        $this->line('  • crawl:bbc-vocabulary      → vocabulary terms cache (word + brief meaning only)');
        $this->newLine();
        $this->warn('For dictation practice, DriveSmart now uses a "user_provided" model:');
        $this->line('users supply their own audio + transcript. No BBC content is rehosted.');

        Log::warning('crawl:bbc-6min was invoked but is deprecated. Use crawl:bbc-lessons.');

        return self::SUCCESS;
    }

    /**
     * Kept for backward compatibility with existing tests.
     * These methods are no longer invoked by handle() but remain accessible.
     *
     * @deprecated since 2026-06-16. Will be removed in next major cleanup.
     */
    public function fetchEpisodeList_DEPRECATED(): array
    {
        return [];
    }

    public function parseEpisodeItems_DEPRECATED(string $html): array
    {
        return [];
    }

    public function extractSlug_DEPRECATED(string $url): string
    {
        return 'deprecated-' . substr(md5($url), 0, 8);
    }

    public function extractEpisodeCode_DEPRECATED(string $url): string
    {
        return '';
    }

    public function processEpisode_DEPRECATED(array $episode): array
    {
        return ['created' => false, 'has_transcript' => false];
    }

    public function extractTextFromPdf_DEPRECATED(string $pdfBody): string
    {
        return '';
    }

    public function slugify_DEPRECATED(string $text): string
    {
        return strtolower(preg_replace('/[^a-z0-9]+/', '-', trim($text)) ?? '');
    }

    public function parseDateFromCode_DEPRECATED(string $episodeCode): ?string
    {
        if (preg_match('/ep-(\d{2})(\d{2})(\d{2})/', $episodeCode, $m)) {
            return "20{$m[1]}-{$m[2]}-{$m[3]} 00:00:00";
        }
        return null;
    }

}

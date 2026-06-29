<?php

namespace Tests\Unit;

use App\Models\ListeningExternalLesson;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

/**
 * Verifies ListeningExternalLesson::toApiArray() correctly redacts
 * BBC-owned transcript content per .cursor/rules/bbc-feature.mdc.
 *
 * The 'legacy_bbc' source must have its segments text stripped before
 * being sent to the client. The 'user_provided' / 'manual' sources
 * must preserve the text because it is the user's own property.
 *
 * This is a pure unit test — no database, no Laravel container. It
 * exercises the model method directly.
 */
class ListeningExternalLessonRedactionTest extends TestCase
{
    private function makeLesson(?string $segmentsSource, ?array $metadata): ListeningExternalLesson
    {
        $lesson = new ListeningExternalLesson();
        $lesson->id = 1;
        $lesson->source_id = 1;
        $lesson->title = 'Test lesson';
        $lesson->slug = 'test-lesson';
        $lesson->source_url = 'https://example.com/test';
        $lesson->thumbnail_url = null;
        $lesson->level = 'intermediate';
        $lesson->duration_seconds = 360;
        $lesson->published_at = null;
        $lesson->metadata_json = $metadata;
        $lesson->segments_source = $segmentsSource;
        $lesson->created_at = CarbonImmutable::now();
        $lesson->updated_at = CarbonImmutable::now();

        return $lesson;
    }

    public function test_legacy_bbc_segments_have_text_redacted(): void
    {
        $lesson = $this->makeLesson(
            ListeningExternalLesson::SEGMENTS_SOURCE_LEGACY_BBC,
            [
                'segments' => [
                    ['index' => 0, 'text' => 'Hello world', 'word_count' => 2],
                    ['index' => 1, 'text' => 'BBC transcript text', 'word_count' => 3],
                ],
                'transcript_pdf_url' => 'https://bbc.co.uk/transcript.pdf',
            ]
        );

        $arr = $lesson->toApiArray();

        $this->assertSame('legacy_bbc', $arr['segments_source']);
        $this->assertArrayHasKey('metadata', $arr);
        $this->assertArrayNotHasKey('transcript_pdf_url', $arr['metadata']);

        foreach ($arr['metadata']['segments'] as $segment) {
            $this->assertArrayNotHasKey('text', $segment);
            $this->assertTrue($segment['redacted']);
            $this->assertSame('bbc_content_policy', $segment['redaction_reason']);
        }
    }

    public function test_user_provided_segments_preserve_text(): void
    {
        $lesson = $this->makeLesson(
            ListeningExternalLesson::SEGMENTS_SOURCE_USER_PROVIDED,
            [
                'segments' => [
                    ['index' => 0, 'text' => 'My own transcript', 'word_count' => 3],
                ],
            ]
        );

        $arr = $lesson->toApiArray();

        $this->assertSame('user_provided', $arr['segments_source']);
        $this->assertSame('My own transcript', $arr['metadata']['segments'][0]['text']);
        $this->assertArrayNotHasKey('redacted', $arr['metadata']['segments'][0]);
    }

    public function test_manual_segments_preserve_text(): void
    {
        $lesson = $this->makeLesson(
            ListeningExternalLesson::SEGMENTS_SOURCE_MANUAL,
            [
                'segments' => [
                    ['index' => 0, 'text' => 'Manually entered by user', 'word_count' => 4],
                ],
            ]
        );

        $arr = $lesson->toApiArray();

        $this->assertSame('Manually entered by user', $arr['metadata']['segments'][0]['text']);
    }

    public function test_lesson_without_segments_source_redacts_text(): void
    {
        // Legacy rows may have segments_source = NULL but still contain
        // segments text. They should be redacted to be safe.
        $lesson = $this->makeLesson(
            null,
            [
                'segments' => [
                    ['index' => 0, 'text' => 'Unsure source text', 'word_count' => 3],
                ],
            ]
        );

        $arr = $lesson->toApiArray();

        $this->assertArrayNotHasKey('text', $arr['metadata']['segments'][0]);
        $this->assertTrue($arr['metadata']['segments'][0]['redacted']);
    }

    public function test_lesson_without_segments_is_unchanged(): void
    {
        $lesson = $this->makeLesson(
            ListeningExternalLesson::SEGMENTS_SOURCE_LEGACY_BBC,
            ['episode_code' => 'ep-260528']
        );

        $arr = $lesson->toApiArray();

        $this->assertSame(['episode_code' => 'ep-260528'], $arr['metadata']);
    }

    public function test_curated_segments_are_redacted(): void
    {
        // 'curated' means we have BBC-derived content (just edited by hand),
        // so it must be redacted too.
        $lesson = $this->makeLesson(
            ListeningExternalLesson::SEGMENTS_SOURCE_CURATED,
            [
                'segments' => [
                    ['index' => 0, 'text' => 'Curated BBC text', 'word_count' => 3],
                ],
            ]
        );

        $arr = $lesson->toApiArray();

        $this->assertArrayNotHasKey('text', $arr['metadata']['segments'][0]);
        $this->assertTrue($arr['metadata']['segments'][0]['redacted']);
    }
}

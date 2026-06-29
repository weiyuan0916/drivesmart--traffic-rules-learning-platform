<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ListeningExternalLesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_id',
        'title',
        'slug',
        'source_url',
        'thumbnail_url',
        'level',
        'duration_seconds',
        'published_at',
        'metadata_json',
        'segments_source',
    ];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'published_at' => 'datetime',
            'metadata_json' => 'array',
        ];
    }

    public const SEGMENTS_SOURCE_LEGACY_BBC = 'legacy_bbc';
    public const SEGMENTS_SOURCE_USER_PROVIDED = 'user_provided';
    public const SEGMENTS_SOURCE_CURATED = 'curated';
    public const SEGMENTS_SOURCE_MANUAL = 'manual';

    public function hasBBCProvidedSegments(): bool
    {
        return in_array($this->segments_source, [
            self::SEGMENTS_SOURCE_LEGACY_BBC,
            self::SEGMENTS_SOURCE_CURATED,
        ], true);
    }

    public function hasUserProvidedSegments(): bool
    {
        return $this->segments_source === self::SEGMENTS_SOURCE_USER_PROVIDED;
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(ListeningSource::class, 'source_id');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(UserExternalLessonProgress::class, 'lesson_id');
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'source_id' => $this->source_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'source_url' => $this->source_url,
            'thumbnail_url' => $this->thumbnail_url,
            'level' => $this->level,
            'duration_seconds' => $this->duration_seconds,
            'published_at' => $this->published_at?->toIso8601String(),
            'metadata' => $this->sanitizeMetadataForApi($this->metadata_json),
            'segments_source' => $this->segments_source,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Strip BBC-owned transcript content from metadata before sending to the client.
     *
     * Compliance: .cursor/rules/bbc-feature.mdc
     * We never serve BBC transcript text through the API. The dictation
     * experience is "user_provided": users paste their own transcript,
     * and DriveSmart compares against that — never against BBC content
     * fetched from our backend.
     *
     * Segments text is preserved only when the lesson's segments_source
     * is "user_provided" or "manual" — meaning the text was supplied by
     * the user and is their property.
     *
     * Legacy rows that have segments_source = "legacy_bbc" get their
     * segment text redacted. The UI then shows a "Provide your own
     * audio + transcript" message rather than the BBC text.
     */
    private function sanitizeMetadataForApi(mixed $metadata): ?array
    {
        // Handle double-encoded JSON strings from legacy seed data
        if (is_string($metadata)) {
            $decoded = json_decode($metadata, true);
            if (is_array($decoded)) {
                $metadata = $decoded;
            } else {
                return null;
            }
        }

        if (! is_array($metadata)) {
            return null;
        }

        $preserveText = in_array($this->segments_source, [
            self::SEGMENTS_SOURCE_USER_PROVIDED,
            self::SEGMENTS_SOURCE_MANUAL,
        ], true);

        if (isset($metadata['segments']) && is_array($metadata['segments'])) {
            $metadata['segments'] = array_map(function (array $segment) use ($preserveText) {
                if (! $preserveText) {
                    unset($segment['text']);
                    $segment['redacted'] = true;
                    $segment['redaction_reason'] = 'bbc_content_policy';
                }
                return $segment;
            }, $metadata['segments']);
        }

        if (! $preserveText && isset($metadata['transcript_pdf_url'])) {
            unset($metadata['transcript_pdf_url']);
        }

        return $metadata;
    }
}

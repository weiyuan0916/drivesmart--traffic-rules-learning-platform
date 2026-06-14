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
    ];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'published_at' => 'datetime',
            'metadata_json' => 'array',
        ];
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
            'metadata' => $this->metadata_json,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

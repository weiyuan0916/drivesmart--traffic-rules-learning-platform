<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'slug',
        'name',
        'audio_path',   // R2 object key (signed URL generated at runtime)
        'duration',
        'vocab_level',
        'order_index',
        'practice_count',
        'avg_accuracy',
    ];

    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'order_index' => 'integer',
            'practice_count' => 'integer',
            'avg_accuracy' => 'decimal:2',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function clips(): HasMany
    {
        return $this->hasMany(LessonClip::class)->orderBy('order_index');
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'topic_id' => $this->topic_id,
            'slug' => $this->slug,
            'name' => $this->name,
            'audio_path' => $this->audio_path,
            'duration' => $this->duration,
            'vocab_level' => $this->vocab_level,
            'order_index' => $this->order_index,
            'practice_count' => $this->practice_count,
            'avg_accuracy' => (float) $this->avg_accuracy,
            'clip_count' => $this->clips()->count(),
            'topic' => $this->whenLoaded('topic', fn () => [
                'id' => $this->topic->id,
                'name' => $this->topic->name,
                'slug' => $this->topic->slug,
                'color' => $this->topic->color,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

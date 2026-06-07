<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonClip extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'transcript',
        'audio_path',  // R2 object key (signed URL generated at runtime)
        'duration',
        'order_index',
    ];

    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'order_index' => 'integer',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'transcript' => $this->transcript,
            'audio_path' => $this->audio_path,
            'duration' => $this->duration,
            'order_index' => $this->order_index,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

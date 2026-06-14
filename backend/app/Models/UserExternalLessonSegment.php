<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserExternalLessonSegment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'segment_index',
        'user_input',
        'correct_words',
        'wrong_words',
        'missing_words',
        'extra_words',
        'accuracy',
        'time_spent_ms',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'accuracy' => 'float',
            'time_spent_ms' => 'integer',
            'correct_words' => 'integer',
            'wrong_words' => 'integer',
            'missing_words' => 'integer',
            'extra_words' => 'integer',
            'segment_index' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(ListeningExternalLesson::class, 'lesson_id');
    }

    protected static function booted(): void
    {
        static::creating(function (UserExternalLessonSegment $segment) {
            if (! $segment->created_at) {
                $segment->created_at = now();
            }
        });
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'lesson_id' => $this->lesson_id,
            'segment_index' => $this->segment_index,
            'user_input' => $this->user_input,
            'correct_words' => $this->correct_words,
            'wrong_words' => $this->wrong_words,
            'missing_words' => $this->missing_words,
            'extra_words' => $this->extra_words,
            'accuracy' => $this->accuracy,
            'time_spent_ms' => $this->time_spent_ms,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

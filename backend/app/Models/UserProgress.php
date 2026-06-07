<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'accuracy',
        'xp_earned',
        'time_seconds',
        'attempt_count',
        'best_score',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'accuracy' => 'decimal:2',
            'xp_earned' => 'integer',
            'time_seconds' => 'integer',
            'attempt_count' => 'integer',
            'best_score' => 'decimal:2',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}

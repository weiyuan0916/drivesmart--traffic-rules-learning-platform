<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserClipProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'clip_id',
        'transcript_input',
        'accuracy',
        'transcribed_text',
        'speaking_score',
        'attempt_count',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'accuracy' => 'decimal:2',
            'speaking_score' => 'decimal:2',
            'attempt_count' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clip(): BelongsTo
    {
        return $this->belongsTo(LessonClip::class, 'clip_id');
    }
}

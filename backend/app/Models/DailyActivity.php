<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'lessons_done',
        'clips_done',
        'time_minutes',
        'xp_earned',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'lessons_done' => 'integer',
            'clips_done' => 'integer',
            'time_minutes' => 'integer',
            'xp_earned' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

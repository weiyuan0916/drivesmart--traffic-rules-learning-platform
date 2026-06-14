<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_url',
        'google_id',
        'github_id',
        'current_streak',
        'longest_streak',
        'streak_start_date',
        'last_lesson_date',
        'total_xp',
        'level',
        'learning_goal',
        'timezone',
        'daily_goal_minutes',
        'onboarding_completed',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'onboarding_completed' => 'boolean',
            'last_lesson_date' => 'date',
            'streak_start_date' => 'date',
            'total_xp' => 'integer',
            'level' => 'integer',
            'current_streak' => 'integer',
            'longest_streak' => 'integer',
            'daily_goal_minutes' => 'integer',
        ];
    }

    public function progress(): HasMany
    {
        return $this->hasMany(UserProgress::class);
    }

    public function clipProgress(): HasMany
    {
        return $this->hasMany(UserClipProgress::class);
    }

    public function externalLessonProgress(): HasMany
    {
        return $this->hasMany(UserExternalLessonProgress::class);
    }

    public function externalLessonNotes(): HasMany
    {
        return $this->hasMany(UserExternalLessonNote::class);
    }

    public function externalLessonVocabulary(): HasMany
    {
        return $this->hasMany(UserExternalLessonVocabulary::class);
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'level' => $this->level,
            'total_xp' => $this->total_xp,
            'current_streak' => $this->current_streak,
            'longest_streak' => $this->longest_streak,
            'last_lesson_date' => $this->last_lesson_date?->toDateString(),
            'learning_goal' => $this->learning_goal,
            'timezone' => $this->timezone,
            'daily_goal_minutes' => $this->daily_goal_minutes,
            'onboarding_completed' => $this->onboarding_completed,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

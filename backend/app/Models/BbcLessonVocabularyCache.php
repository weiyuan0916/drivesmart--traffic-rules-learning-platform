<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BbcLessonVocabularyCache extends Model
{
    use HasFactory;

    protected $table = 'bbc_lesson_vocabulary_cache';

    protected $fillable = [
        'lesson_id',
        'word',
        'brief_meaning',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(ListeningExternalLesson::class, 'lesson_id');
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'word' => $this->word,
            'brief_meaning' => $this->brief_meaning,
            'position' => $this->position,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

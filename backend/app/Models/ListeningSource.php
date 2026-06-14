<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ListeningSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
    ];

    public function lessons(): HasMany
    {
        return $this->hasMany(ListeningExternalLesson::class, 'source_id');
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'lesson_count' => $this->lessons()->count(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

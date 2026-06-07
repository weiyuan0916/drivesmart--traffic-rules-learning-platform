<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'name_vi',
        'description',
        'description_vi',
        'icon',
        'color',
        'order_index',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'order_index' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('order_index');
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'name_vi' => $this->name_vi,
            'description' => $this->description,
            'description_vi' => $this->description_vi,
            'icon' => $this->icon,
            'color' => $this->color,
            'order_index' => $this->order_index,
            'is_active' => $this->is_active,
            'lesson_count' => $this->lessons()->count(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\LessonClip;
use Illuminate\Database\Eloquent\Factories\Factory;

class LessonClipFactory extends Factory
{
    protected $model = LessonClip::class;

    public function definition(): array
    {
        return [
            'transcript' => $this->faker->sentence(8),
            'order_index' => $this->faker->numberBetween(0, 20),
        ];
    }
}

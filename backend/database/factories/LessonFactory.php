<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\Topic;
use Illuminate\Database\Eloquent\Factories\Factory;

class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    public function definition(): array
    {
        return [
            'topic_id' => Topic::factory(),
            'name' => $this->faker->sentence(4),
            'slug' => $this->faker->unique()->slug(3),
            'vocab_level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'order_index' => $this->faker->numberBetween(0, 50),
        ];
    }
}

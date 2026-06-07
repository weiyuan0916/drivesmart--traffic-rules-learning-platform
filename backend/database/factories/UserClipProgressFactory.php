<?php

namespace Database\Factories;

use App\Models\LessonClip;
use App\Models\User;
use App\Models\UserClipProgress;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserClipProgressFactory extends Factory
{
    protected $model = UserClipProgress::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'clip_id' => LessonClip::factory(),
            'transcript_input' => $this->faker->sentence(8),
            'accuracy' => $this->faker->randomFloat(2, 0, 100),
            'transcribed_text' => $this->faker->sentence(8),
            'speaking_score' => null,
            'attempt_count' => 1,
            'completed_at' => $this->faker->optional(0.8)->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'accuracy' => $this->faker->randomFloat(2, 50, 100),
        ]);
    }

    public function incomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => null,
            'accuracy' => $this->faker->randomFloat(2, 0, 49),
        ]);
    }
}

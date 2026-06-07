<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserProgressFactory extends Factory
{
    protected $model = UserProgress::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'lesson_id' => Lesson::factory(),
            'accuracy' => $this->faker->randomFloat(2, 0, 100),
            'xp_earned' => $this->faker->numberBetween(0, 100),
            'time_seconds' => $this->faker->numberBetween(30, 600),
            'attempt_count' => $this->faker->numberBetween(1, 5),
            'best_score' => $this->faker->randomFloat(2, 50, 100),
            'completed_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    public function incomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => null,
        ]);
    }
}

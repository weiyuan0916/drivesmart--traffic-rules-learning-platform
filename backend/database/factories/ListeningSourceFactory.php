<?php

namespace Database\Factories;

use App\Models\ListeningSource;
use Illuminate\Database\Eloquent\Factories\Factory;

class ListeningSourceFactory extends Factory
{
    protected $model = ListeningSource::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'slug' => $this->faker->unique()->slug(2),
        ];
    }

    public function bbc(): static
    {
        return $this->state(fn () => [
            'name' => 'BBC Learning English',
            'slug' => 'bbc-learning-english',
        ]);
    }
}

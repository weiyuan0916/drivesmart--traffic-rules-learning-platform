<?php

namespace Database\Factories;

use App\Models\ListeningExternalLesson;
use App\Models\ListeningSource;
use Illuminate\Database\Eloquent\Factories\Factory;

class ListeningExternalLessonFactory extends Factory
{
    protected $model = ListeningExternalLesson::class;

    public function definition(): array
    {
        return [
            'source_id' => ListeningSource::factory(),
            'title' => $this->faker->sentence(6),
            'slug' => $this->faker->unique()->slug(3),
            'source_url' => $this->faker->url(),
            'thumbnail_url' => null,
            'level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'duration_seconds' => $this->faker->numberBetween(180, 600),
            'published_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'metadata_json' => null,
        ];
    }

    public function withSegments(int $count = 10): static
    {
        $segments = [];
        for ($i = 0; $i < $count; $i++) {
            $words = $this->faker->words($this->faker->numberBetween(5, 15));
            $segments[] = [
                'id' => $i,
                'text' => ucfirst(implode(' ', $words)) . '.',
                'word_count' => count($words),
                'difficulty' => $this->faker->randomElement(['easy', 'medium', 'hard']),
                'estimated_duration' => count($words) * 2,
                'start_time' => $i * 10,
                'end_time' => ($i + 1) * 10,
            ];
        }

        return $this->state(fn () => [
            'metadata_json' => [
                'transcript_pdf_url' => 'https://downloads.bbc.co.uk/learningenglish/features/6min/test_transcript.pdf',
                'audio_url' => 'https://www.bbc.com/audio/play/test123',
                'episode_code' => 'ep-test-001',
                'segments' => $segments,
            ],
        ]);
    }
}

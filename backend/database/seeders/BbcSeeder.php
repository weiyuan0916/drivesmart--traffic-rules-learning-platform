<?php

namespace Database\Seeders;

use App\Models\ListeningSource;
use App\Models\ListeningExternalLesson;
use Illuminate\Database\Seeder;

class BbcSeeder extends Seeder
{
    public function run(): void
    {
        $source = ListeningSource::updateOrCreate(
            ['slug' => 'bbc-learning-english'],
            [
                'name' => 'BBC Learning English',
            ]
        );

        $lessonData = [
            [
                'title' => 'Why do we need to recycle?',
                'slug' => 'why-do-we-need-to-recycle',
                'source_url' => 'https://www.bbc.co.uk/learningenglish/english/features/6minute-english_20240105',
                'thumbnail_url' => 'https://ichef.bbci.co.uk/images/ic/1024x576/p0d01d64.jpg',
                'level' => 'intermediate',
                'duration_seconds' => 360,
                'published_at' => '2024-01-05',
                'metadata_json' => [
                    'series' => '6-minute-english',
                    'episode_code' => '20240105',
                    'segments' => [
                        ['index' => 0, 'text' => 'Hello, this is 6 Minute English, I\'m Neil.', 'estimated_duration' => 5, 'start_time' => 0, 'end_time' => 5, 'difficulty' => 'easy'],
                        ['index' => 1, 'text' => 'And I\'m Sam. Today we\'re talking about recycling.', 'estimated_duration' => 5, 'start_time' => 5, 'end_time' => 10, 'difficulty' => 'easy'],
                        ['index' => 2, 'text' => 'Do you recycle, Sam?', 'estimated_duration' => 4, 'start_time' => 10, 'end_time' => 14, 'difficulty' => 'easy'],
                        ['index' => 3, 'text' => 'Yes, I recycle everything I can. Paper, plastic, glass.', 'estimated_duration' => 6, 'start_time' => 14, 'end_time' => 20, 'difficulty' => 'medium'],
                        ['index' => 4, 'text' => 'Recycling is important for the environment.', 'estimated_duration' => 5, 'start_time' => 20, 'end_time' => 25, 'difficulty' => 'easy'],
                        ['index' => 5, 'text' => 'It reduces waste and saves natural resources.', 'estimated_duration' => 6, 'start_time' => 25, 'end_time' => 31, 'difficulty' => 'medium'],
                        ['index' => 6, 'text' => 'Let\'s start with a question. How much of the world\'s waste is recycled?', 'estimated_duration' => 7, 'start_time' => 31, 'end_time' => 38, 'difficulty' => 'medium'],
                        ['index' => 7, 'text' => 'Is it about nine percent, nineteen percent, or twenty-nine percent?', 'estimated_duration' => 7, 'start_time' => 38, 'end_time' => 45, 'difficulty' => 'medium'],
                        ['index' => 8, 'text' => 'That\'s a difficult question. Let me think.', 'estimated_duration' => 5, 'start_time' => 45, 'end_time' => 50, 'difficulty' => 'easy'],
                        ['index' => 9, 'text' => 'I think it\'s about nineteen percent.', 'estimated_duration' => 5, 'start_time' => 50, 'end_time' => 55, 'difficulty' => 'easy'],
                    ],
                ],
            ],
            [
                'title' => 'The hidden life of trees',
                'slug' => 'the-hidden-life-of-trees',
                'source_url' => 'https://www.bbc.co.uk/learningenglish/english/features/6minute-english_20241229',
                'thumbnail_url' => 'https://ichef.bbci.co.uk/images/ic/1024x576/p0d02c1z.jpg',
                'level' => 'intermediate',
                'duration_seconds' => 360,
                'published_at' => '2024-12-29',
                'metadata_json' => [
                    'series' => '6-minute-english',
                    'episode_code' => '20241229',
                    'segments' => [
                        ['index' => 0, 'text' => 'Hello, this is 6 Minute English, I\'m Neil.', 'estimated_duration' => 5, 'start_time' => 0, 'end_time' => 5, 'difficulty' => 'easy'],
                        ['index' => 1, 'text' => 'And I\'m Sam. Today we\'re discussing trees.', 'estimated_duration' => 5, 'start_time' => 5, 'end_time' => 10, 'difficulty' => 'easy'],
                        ['index' => 2, 'text' => 'Trees are amazing, aren\'t they?', 'estimated_duration' => 4, 'start_time' => 10, 'end_time' => 14, 'difficulty' => 'easy'],
                        ['index' => 3, 'text' => 'They produce oxygen and provide habitat for wildlife.', 'estimated_duration' => 6, 'start_time' => 14, 'end_time' => 20, 'difficulty' => 'medium'],
                        ['index' => 4, 'text' => 'Scientists say trees can communicate with each other.', 'estimated_duration' => 6, 'start_time' => 20, 'end_time' => 26, 'difficulty' => 'medium'],
                    ],
                ],
            ],
            [
                'title' => 'Are you an optimist?',
                'slug' => 'are-you-an-optimist',
                'source_url' => 'https://www.bbc.co.uk/learningenglish/english/features/6minute-english_20241222',
                'thumbnail_url' => 'https://ichef.bbci.co.uk/images/ic/1024x576/p0czxvkz.jpg',
                'level' => 'intermediate',
                'duration_seconds' => 360,
                'published_at' => '2024-12-22',
                'metadata_json' => [
                    'series' => '6-minute-english',
                    'episode_code' => '20241222',
                    'segments' => [
                        ['index' => 0, 'text' => 'Hello, this is 6 Minute English, I\'m Neil.', 'estimated_duration' => 5, 'start_time' => 0, 'end_time' => 5, 'difficulty' => 'easy'],
                        ['index' => 1, 'text' => 'And I\'m Sam. Today we\'re talking about optimism.', 'estimated_duration' => 5, 'start_time' => 5, 'end_time' => 10, 'difficulty' => 'easy'],
                        ['index' => 2, 'text' => 'An optimist expects good things to happen.', 'estimated_duration' => 5, 'start_time' => 10, 'end_time' => 15, 'difficulty' => 'easy'],
                        ['index' => 3, 'text' => 'A pessimist expects bad things to happen.', 'estimated_duration' => 5, 'start_time' => 15, 'end_time' => 20, 'difficulty' => 'easy'],
                        ['index' => 4, 'text' => 'Which one are you, Neil?', 'estimated_duration' => 4, 'start_time' => 20, 'end_time' => 24, 'difficulty' => 'easy'],
                    ],
                ],
            ],
            [
                'title' => 'Climate change: What can we do?',
                'slug' => 'climate-change-what-can-we-do',
                'source_url' => 'https://www.bbc.co.uk/learningenglish/english/features/6minute-english_20241215',
                'thumbnail_url' => 'https://ichef.bbci.co.uk/images/ic/1024x576/p0cxz0wz.jpg',
                'level' => 'intermediate',
                'duration_seconds' => 360,
                'published_at' => '2024-12-15',
                'metadata_json' => [
                    'series' => '6-minute-english',
                    'episode_code' => '20241215',
                    'segments' => [
                        ['index' => 0, 'text' => 'Hello, this is 6 Minute English, I\'m Neil.', 'estimated_duration' => 5, 'start_time' => 0, 'end_time' => 5, 'difficulty' => 'easy'],
                        ['index' => 1, 'text' => 'And I\'m Sam. Today we\'re discussing climate change.', 'estimated_duration' => 5, 'start_time' => 5, 'end_time' => 10, 'difficulty' => 'easy'],
                        ['index' => 2, 'text' => 'Climate change is one of the biggest challenges we face.', 'estimated_duration' => 7, 'start_time' => 10, 'end_time' => 17, 'difficulty' => 'medium'],
                        ['index' => 3, 'text' => 'Rising temperatures are affecting ecosystems worldwide.', 'estimated_duration' => 6, 'start_time' => 17, 'end_time' => 23, 'difficulty' => 'medium'],
                        ['index' => 4, 'text' => 'But there are things we can all do to help.', 'estimated_duration' => 5, 'start_time' => 23, 'end_time' => 28, 'difficulty' => 'easy'],
                    ],
                ],
            ],
            [
                'title' => 'Is it worth using a cryptocurrency?',
                'slug' => 'is-it-worth-using-a-cryptocurrency',
                'source_url' => 'https://www.bbc.co.uk/learningenglish/english/features/6minute-english_20241208',
                'thumbnail_url' => 'https://ichef.bbci.co.uk/images/ic/1024x576/p0cvzvkz.jpg',
                'level' => 'intermediate',
                'duration_seconds' => 360,
                'published_at' => '2024-12-08',
                'metadata_json' => [
                    'series' => '6-minute-english',
                    'episode_code' => '20241208',
                    'segments' => [
                        ['index' => 0, 'text' => 'Hello, this is 6 Minute English, I\'m Neil.', 'estimated_duration' => 5, 'start_time' => 0, 'end_time' => 5, 'difficulty' => 'easy'],
                        ['index' => 1, 'text' => 'And I\'m Sam. Today we\'re talking about cryptocurrency.', 'estimated_duration' => 5, 'start_time' => 5, 'end_time' => 10, 'difficulty' => 'easy'],
                        ['index' => 2, 'text' => 'Bitcoin and Ethereum are popular cryptocurrencies.', 'estimated_duration' => 6, 'start_time' => 10, 'end_time' => 16, 'difficulty' => 'medium'],
                        ['index' => 3, 'text' => 'Do you know how cryptocurrency works?', 'estimated_duration' => 5, 'start_time' => 16, 'end_time' => 21, 'difficulty' => 'easy'],
                    ],
                ],
            ],
        ];

        foreach ($lessonData as $data) {
            ListeningExternalLesson::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'source_id' => $source->id,
                    'title' => $data['title'],
                    'source_url' => $data['source_url'],
                    'thumbnail_url' => $data['thumbnail_url'],
                    'level' => $data['level'],
                    'duration_seconds' => $data['duration_seconds'],
                    'published_at' => $data['published_at'],
                    'metadata_json' => $data['metadata_json'],
                ]
            );
        }
    }
}

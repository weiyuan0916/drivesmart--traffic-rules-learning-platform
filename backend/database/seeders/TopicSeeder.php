<?php

namespace Database\Seeders;

use App\Models\Topic;
use Illuminate\Database\Seeder;

class TopicSeeder extends Seeder
{
    public function run(): void
    {
        $topics = [
            [
                'name' => 'Daily Conversations',
                'name_vi' => 'Hội thoại hàng ngày',
                'slug' => 'daily-conversations',
                'description' => 'Practice everyday English conversations about common situations.',
                'description_vi' => 'Luyện hội thoại tiếng Anh hàng ngày về các tình huống phổ biến.',
                'icon' => 'chat',
                'color' => '#35375B',
                'order_index' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Business English',
                'name_vi' => 'Tiếng Anh thương mại',
                'slug' => 'business-english',
                'description' => 'Professional English for meetings, emails, and workplace communication.',
                'description_vi' => 'Tiếng Anh chuyên nghiệp cho các cuộc họp, email và giao tiếp nơi làm việc.',
                'icon' => 'briefcase',
                'color' => '#2B5F8E',
                'order_index' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'IELTS Listening',
                'name_vi' => 'IELTS Listening',
                'slug' => 'ielts-listening',
                'description' => 'Practice IELTS-style listening exercises with transcripts and vocabulary.',
                'description_vi' => 'Luyện nghe IELTS với bản ghi và từ vựng.',
                'icon' => 'graduation-cap',
                'color' => '#00BE7C',
                'order_index' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Travel & Tourism',
                'name_vi' => 'Du lịch & Khám phá',
                'slug' => 'travel-tourism',
                'description' => 'Essential English for traveling, booking, and navigating foreign countries.',
                'description_vi' => 'Tiếng Anh thiết yếu cho du lịch, đặt phòng và khám phá các nước ngoài.',
                'icon' => 'plane',
                'color' => '#FF5632',
                'order_index' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Short Stories',
                'name_vi' => 'Truyện ngắn',
                'slug' => 'short-stories',
                'description' => 'Engaging short stories to improve comprehension and vocabulary.',
                'description_vi' => 'Những câu chuyện ngắn hấp dẫn giúp cải thiện kỹ năng hiểu và từ vựng.',
                'icon' => 'book-open',
                'color' => '#8B5CF6',
                'order_index' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($topics as $topic) {
            Topic::updateOrCreate(
                ['slug' => $topic['slug']],
                $topic
            );
        }

        $this->command->info('Seeded ' . Topic::count() . ' topics.');
    }
}

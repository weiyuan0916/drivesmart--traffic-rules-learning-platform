<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\LessonClip;
use App\Models\Topic;
use Illuminate\Database\Seeder;

/**
 * Seeds lessons and their clips atomically.
 *
 * Note: When lesson clip count exceeds 500, extract clips into a dedicated ClipSeeder.
 * The seeder order will become: TopicSeeder → LessonSeeder → ClipSeeder.
 */
class LessonSeeder extends Seeder
{
    public function run(): void
    {
        $topics = Topic::all();

        foreach ($topics as $topicIndex => $topic) {
            $this->seedLessonsForTopic($topic, $topicIndex);
        }

        $this->command->info('Seeded ' . Lesson::count() . ' lessons and ' . LessonClip::count() . ' clips.');
    }

    private function seedLessonsForTopic(Topic $topic, int $topicIndex): void
    {
        $lessons = $this->getLessonsForTopic($topic->slug);

        foreach ($lessons as $lessonIndex => $lessonData) {
            $lesson = Lesson::updateOrCreate(
                [
                    'topic_id' => $topic->id,
                    'slug' => $lessonData['slug'],
                ],
                [
                    'name' => $lessonData['name'],
                    'vocab_level' => $lessonData['vocab_level'],
                    'order_index' => $lessonIndex,
                ]
            );

            foreach ($lessonData['clips'] as $clipIndex => $transcript) {
                LessonClip::updateOrCreate(
                    [
                        'lesson_id' => $lesson->id,
                        'order_index' => $clipIndex,
                    ],
                    [
                        'transcript' => $transcript,
                        'duration' => rand(15, 45),
                    ]
                );
            }
        }
    }

    private function getLessonsForTopic(string $topicSlug): array
    {
        return match ($topicSlug) {
            'daily-conversations' => [
                [
                    'slug' => 'introducing-yourself',
                    'name' => 'Introducing Yourself',
                    'vocab_level' => 'beginner',
                    'clips' => [
                        "Hello, my name is Sarah. Nice to meet you.",
                        "Where are you from? I'm from Hanoi.",
                        "What do you do for work? I teach English.",
                        "How long have you been living here? About two years.",
                    ],
                ],
                [
                    'slug' => 'ordering-at-restaurant',
                    'name' => 'Ordering at a Restaurant',
                    'vocab_level' => 'beginner',
                    'clips' => [
                        "Good evening. Do you have a table for two?",
                        "Yes, right this way. Here's your menu.",
                        "What would you like to start with?",
                        "Can I see the wine list please?",
                        "We're ready to order. I'll have the grilled salmon.",
                        "Would you like dessert? No thank you, just the bill please.",
                    ],
                ],
                [
                    'slug' => 'asking-for-directions',
                    'name' => 'Asking for Directions',
                    'vocab_level' => 'beginner',
                    'clips' => [
                        "Excuse me, could you tell me how to get to the train station?",
                        "Go straight for two blocks, then turn left at the traffic lights.",
                        "Is it far from here? It's about a ten minute walk.",
                        "Is there a bus that goes there? Yes, the number five.",
                    ],
                ],
                [
                    'slug' => 'shopping-conversation',
                    'name' => 'Shopping Conversation',
                    'vocab_level' => 'intermediate',
                    'clips' => [
                        "Can I help you find something today?",
                        "Yes, I'm looking for a blue shirt in size medium.",
                        "Let me check our inventory. We have one left in stock.",
                        "Can I try it on? The fitting room is over there.",
                        "It fits perfectly. I'll take it. Do you accept credit cards?",
                    ],
                ],
            ],

            'business-english' => [
                [
                    'slug' => 'job-interview-basics',
                    'name' => 'Job Interview Basics',
                    'vocab_level' => 'intermediate',
                    'clips' => [
                        "Thank you for coming in today. Please have a seat.",
                        "Can you tell me about your previous work experience?",
                        "I worked as a project manager for three years at TechCorp.",
                        "What are your greatest strengths and weaknesses?",
                        "Where do you see yourself in five years?",
                        "Do you have any questions for us?",
                    ],
                ],
                [
                    'slug' => 'email-writing',
                    'name' => 'Professional Email Writing',
                    'vocab_level' => 'intermediate',
                    'clips' => [
                        "Dear Mr. Johnson, I'm writing to follow up on our meeting last week.",
                        "As discussed, I've attached the updated project proposal.",
                        "Please let me know if you have any questions or concerns.",
                        "I look forward to hearing from you at your earliest convenience.",
                        "Best regards, Emily Chen.",
                    ],
                ],
                [
                    'slug' => 'meeting-phrases',
                    'name' => 'Meeting Essential Phrases',
                    'vocab_level' => 'advanced',
                    'clips' => [
                        "Let's get started. Is everyone here?",
                        "I'd like to go over the agenda for today.",
                        "Can we circle back to that point later?",
                        "To play devil's advocate, what if the budget is cut?",
                        "Can you take the minutes this time, please?",
                        "Let's table this discussion for our next meeting.",
                    ],
                ],
            ],

            'ielts-listening' => [
                [
                    'slug' => 'ielts-section-1',
                    'name' => 'IELTS Listening Section 1',
                    'vocab_level' => 'intermediate',
                    'clips' => [
                        "Good morning. How can I help you?",
                        "I'd like to enrol in an English course please.",
                        "Have you studied English before?",
                        "What level are you currently at? Intermediate, I believe.",
                        "Here are the course options available for this term.",
                    ],
                ],
                [
                    'slug' => 'ielts-section-2',
                    'name' => 'IELTS Listening Section 2',
                    'vocab_level' => 'intermediate',
                    'clips' => [
                        "Welcome to Greenfield College. Today I'll be showing you around the campus.",
                        "First, let's look at the library which is open twenty-four hours a day.",
                        "The cafeteria is located in the main building near the entrance.",
                        "If you have any questions, please don't hesitate to ask our student helpers.",
                    ],
                ],
                [
                    'slug' => 'ielts-section-3',
                    'name' => 'IELTS Listening Section 3',
                    'vocab_level' => 'advanced',
                    'clips' => [
                        "I think we should reconsider the methodology for this research.",
                        "Have you looked at the latest findings from the Cambridge study?",
                        "That's a good point. We might need to adjust our hypothesis.",
                        "When is the deadline for the preliminary report?",
                        "I suggest we meet again next Thursday to finalize everything.",
                    ],
                ],
                [
                    'slug' => 'ielts-section-4',
                    'name' => 'IELTS Listening Section 4',
                    'vocab_level' => 'advanced',
                    'clips' => [
                        "Today we'll be discussing the impact of urbanisation on wildlife.",
                        "As cities expand, natural habitats are increasingly fragmented.",
                        "This phenomenon is known as habitat fragmentation.",
                        "Researchers have identified several strategies to mitigate these effects.",
                        "Green corridors allow animals to move between isolated habitats.",
                    ],
                ],
            ],

            'travel-tourism' => [
                [
                    'slug' => 'airport-checkin',
                    'name' => 'Airport Check-in',
                    'vocab_level' => 'beginner',
                    'clips' => [
                        "Good afternoon. May I see your passport and booking confirmation?",
                        "Would you like a window seat or an aisle seat?",
                        "Do you have any bags to check in? Yes, one suitcase.",
                        "Your boarding pass. Gate B12. Boarding starts at three forty-five.",
                        "Have a pleasant flight.",
                    ],
                ],
                [
                    'slug' => 'hotel-reservation',
                    'name' => 'Hotel Reservation',
                    'vocab_level' => 'beginner',
                    'clips' => [
                        "Hello, I'd like to book a room for next weekend.",
                        "What kind of room are you looking for? A double room.",
                        "How many nights will you be staying? Three nights.",
                        "Can I have your credit card to hold the reservation?",
                        "Check-in is from two PM. Breakfast is included.",
                    ],
                ],
                [
                    'slug' => 'travel-planning',
                    'name' => 'Travel Planning',
                    'vocab_level' => 'intermediate',
                    'clips' => [
                        "What would you recommend for a first-time visitor?",
                        "I'd suggest starting with the Old Town and the cathedral.",
                        "How do I get to the museum from here?",
                        "Is it better to take a taxi or use public transport?",
                        "Can you recommend a good restaurant nearby?",
                    ],
                ],
            ],

            'short-stories' => [
                [
                    'slug' => 'the-lost-key',
                    'name' => 'The Lost Key',
                    'vocab_level' => 'beginner',
                    'clips' => [
                        "Mia couldn't find her house keys anywhere.",
                        "She searched her bag, her pockets, even under the sofa.",
                        "Suddenly she remembered. She left them in the car.",
                        "She ran outside and found them sitting on the driver's seat.",
                    ],
                ],
                [
                    'slug' => 'first-day-at-work',
                    'name' => 'First Day at Work',
                    'vocab_level' => 'intermediate',
                    'clips' => [
                        "Tom arrived at the office at eight in the morning.",
                        "He was nervous because it was his first day.",
                        "His manager greeted him and showed him to his desk.",
                        "There was a welcome card signed by the whole team.",
                        "By lunch time, Tom felt like he had been there for months.",
                    ],
                ],
                [
                    'slug' => 'the-unexpected-guest',
                    'name' => 'The Unexpected Guest',
                    'vocab_level' => 'advanced',
                    'clips' => [
                        "The doorbell rang at midnight on a stormy Thursday.",
                        "Sarah opened the door to find a soaking wet stranger.",
                        "I'm terribly sorry to bother you at this hour.",
                        "I seem to have taken a wrong turn and my car broke down.",
                        "Sarah hesitated, then stepped aside and let him in.",
                    ],
                ],
                [
                    'slug' => 'the-last-page',
                    'name' => 'The Last Page',
                    'vocab_level' => 'advanced',
                    'clips' => [
                        "Grandfather had been reading the same book for years.",
                        "He claimed it was the most beautiful story ever written.",
                        "One day, Anna finally asked to read it herself.",
                        "She opened to the last page and found only three words.",
                        "She smiled, closed the book, and understood everything.",
                    ],
                ],
            ],

            default => [],
        };
    }
}

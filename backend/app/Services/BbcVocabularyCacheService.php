<?php

namespace App\Services;

use App\Models\BbcLessonVocabularyCache;
use App\Models\ListeningExternalLesson;
use Illuminate\Support\Collection;

/**
 * BbcVocabularyCacheService — vocabulary metadata cache for BBC lessons.
 *
 * Compliance: .cursor/rules/bbc-feature.mdc
 * Caches only public metadata already exposed on the BBC episode page:
 *   - the word itself
 *   - a one-line brief meaning (max 500 chars)
 *
 * It does NOT store:
 *   - the full transcript
 *   - the audio file
 *   - extended definitions beyond what BBC already shows on the page
 *   - example sentences (those are user-supplied in their own notebook)
 *
 * This lets the frontend show vocabulary suggestions that the user can
 * quickly add to their own UserExternalLessonVocabulary notebook.
 */
class BbcVocabularyCacheService
{
    public function getVocabulary(int $lessonId): Collection
    {
        return BbcLessonVocabularyCache::where('lesson_id', $lessonId)
            ->orderBy('position')
            ->get();
    }

    public function addVocabulary(int $lessonId, string $word, ?string $briefMeaning, int $position): BbcLessonVocabularyCache
    {
        return BbcLessonVocabularyCache::updateOrCreate(
            ['lesson_id' => $lessonId, 'word' => $word],
            [
                'brief_meaning' => $briefMeaning !== null ? mb_substr($briefMeaning, 0, 500) : null,
                'position' => $position,
            ]
        );
    }

    public function addBulk(int $lessonId, array $items): Collection
    {
        $created = collect();
        foreach ($items as $i => $item) {
            $word = trim((string) ($item['word'] ?? ''));
            if ($word === '') {
                continue;
            }
            $meaning = isset($item['brief_meaning']) ? (string) $item['brief_meaning'] : null;
            $position = isset($item['position']) ? (int) $item['position'] : $i;
            $created->push($this->addVocabulary($lessonId, $word, $meaning, $position));
        }
        return $created;
    }

    public function clearForLesson(int $lessonId): int
    {
        return BbcLessonVocabularyCache::where('lesson_id', $lessonId)->delete();
    }
}

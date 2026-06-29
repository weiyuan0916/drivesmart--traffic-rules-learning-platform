<?php

namespace App\Services;

use App\Models\ListeningExternalLesson;
use App\Models\ListeningSource;
use App\Models\User;
use App\Models\UserExternalLessonNote;
use App\Models\UserExternalLessonProgress;
use App\Models\UserExternalLessonVocabulary;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * BbcCatalogService — non-dictation BBC operations.
 *
 * Compliance: .cursor/rules/bbc-feature.mdc
 * This service handles listing, notes, vocabulary, progress and dashboard
 * metrics. It does NOT process transcripts, audio, or any BBC-owned
 * content. It works exclusively with public metadata.
 *
 * Service architecture:
 *   BbcCatalogService       (this file)  — catalog + user data
 *   BbcDictationService                 — dictation session + scoring
 *   DictationScoringService             — shared pure scoring logic
 *
 * This split makes it possible to remove BbcDictationService without
 * touching the catalog, and vice-versa. It also keeps the BBC code
 * structurally similar to the DailyDictation Python service, which is
 * split into topic_crawler / section_crawler / lesson_crawler / audio_slicer
 * for the same reason.
 */
class BbcCatalogService
{
    public function getSource(): ListeningSource
    {
        return ListeningSource::where('slug', 'bbc-learning-english')->firstOrFail();
    }

    public function listLessons(array $filters = []): LengthAwarePaginator
    {
        $source = $this->getSource();

        $query = ListeningExternalLesson::where('source_id', $source->id);

        if (! empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        if (! empty($filters['search'])) {
            $query->where('title', 'ILIKE', '%' . $filters['search'] . '%');
        }

        $sortBy = $filters['sort_by'] ?? 'latest';
        if ($sortBy === 'oldest') {
            $query->orderBy('published_at', 'asc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        $perPage = (int) ($filters['per_page'] ?? 20);
        $page = (int) ($filters['page'] ?? 1);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function getLesson(string $slug): ?ListeningExternalLesson
    {
        $source = $this->getSource();

        return ListeningExternalLesson::where('source_id', $source->id)
            ->where('slug', $slug)
            ->first();
    }

    public function getLessonById(int $id): ?ListeningExternalLesson
    {
        return ListeningExternalLesson::find($id);
    }

    public function getProgress(User $user, int $lessonId): ?UserExternalLessonProgress
    {
        return UserExternalLessonProgress::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->first();
    }

    public function upsertProgress(User $user, int $lessonId, string $status): UserExternalLessonProgress
    {
        return UserExternalLessonProgress::updateOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $lessonId],
            [
                'status' => $status,
                'started_at' => $status !== 'not_started' ? now() : null,
                'completed_at' => $status === 'completed' ? now() : null,
                'last_accessed_at' => now(),
            ]
        );
    }

    public function markInProgress(User $user, int $lessonId): UserExternalLessonProgress
    {
        return $this->upsertProgress($user, $lessonId, 'in_progress');
    }

    public function markCompleted(User $user, int $lessonId): UserExternalLessonProgress
    {
        return $this->upsertProgress($user, $lessonId, 'completed');
    }

    public function getNotes(User $user, int $lessonId): ?UserExternalLessonNote
    {
        return UserExternalLessonNote::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->first();
    }

    public function upsertNotes(User $user, int $lessonId, string $content): UserExternalLessonNote
    {
        return UserExternalLessonNote::updateOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $lessonId],
            ['content' => $content]
        );
    }

    public function getVocabulary(User $user, int $lessonId): Collection
    {
        return UserExternalLessonVocabulary::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function saveVocabulary(User $user, int $lessonId, array $data): UserExternalLessonVocabulary
    {
        return UserExternalLessonVocabulary::create([
            'user_id' => $user->id,
            'lesson_id' => $lessonId,
            'word' => $data['word'],
            'meaning' => $data['meaning'] ?? null,
            'example' => $data['example'] ?? null,
            'note' => $data['note'] ?? null,
        ]);
    }

    public function updateVocabulary(User $user, int $vocabularyId, array $data): ?UserExternalLessonVocabulary
    {
        $vocab = UserExternalLessonVocabulary::where('id', $vocabularyId)
            ->where('user_id', $user->id)
            ->first();

        if (! $vocab) {
            return null;
        }

        $vocab->update(array_filter([
            'word' => $data['word'] ?? null,
            'meaning' => $data['meaning'] ?? null,
            'example' => $data['example'] ?? null,
            'note' => $data['note'] ?? null,
        ], fn ($v) => array_key_exists($v, $data) || $v !== null));

        return $vocab->fresh();
    }

    public function deleteVocabulary(User $user, int $vocabularyId): bool
    {
        return (bool) UserExternalLessonVocabulary::where('id', $vocabularyId)
            ->where('user_id', $user->id)
            ->delete();
    }

    public function getDashboardMetrics(User $user): array
    {
        $progress = UserExternalLessonProgress::where('user_id', $user->id)->get();

        return [
            'lessons_started' => $progress->where('status', 'in_progress')->count(),
            'lessons_completed' => $progress->where('status', 'completed')->count(),
            'completion_rate' => $progress->count() > 0
                ? round($progress->where('status', 'completed')->count() / $progress->count() * 100, 1)
                : 0,
        ];
    }

    public function ensureSourceExists(): ListeningSource
    {
        return ListeningSource::firstOrCreate(
            ['slug' => 'bbc-learning-english'],
            ['name' => 'BBC Learning English']
        );
    }

    public function upsertLesson(array $data): ListeningExternalLesson
    {
        $source = $this->ensureSourceExists();

        return ListeningExternalLesson::updateOrCreate(
            ['source_id' => $source->id, 'slug' => $data['slug']],
            [
                'title' => $data['title'],
                'source_url' => $data['source_url'],
                'thumbnail_url' => $data['thumbnail_url'] ?? null,
                'level' => $data['level'] ?? null,
                'duration_seconds' => $data['duration_seconds'] ?? null,
                'published_at' => $data['published_at'] ?? null,
                'metadata_json' => $data['metadata_json'] ?? null,
                'segments_source' => $data['segments_source'] ?? null,
            ]
        );
    }
}

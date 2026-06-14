<?php

namespace App\Services;

use App\Models\ListeningExternalLesson;
use App\Models\ListeningSource;
use App\Models\User;
use App\Models\UserExternalLessonNote;
use App\Models\UserExternalLessonProgress;
use App\Models\UserExternalLessonSegment;
use App\Models\UserExternalLessonVocabulary;
use App\Services\DictationScoringService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BbcService
{
    public function __construct(
        private readonly DictationScoringService $scoringService = new DictationScoringService()
    ) {}
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

        if (! empty($filters['series']) && $filters['series'] === '6-minute-english') {
            // Filter lessons that have dictation segments
            // metadata_json is json/jsonb — cast to jsonb for operator compatibility
            $query->whereNotNull('metadata_json')
                ->whereRaw("(metadata_json::jsonb)->'segments' IS NOT NULL")
                ->whereRaw("jsonb_array_length((metadata_json::jsonb)->'segments') > 0");
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
            ]
        );
    }

    // ── Dictation Methods ─────────────────────────────────────

    public function getDictation(int $lessonId): ?ListeningExternalLesson
    {
        return ListeningExternalLesson::find($lessonId);
    }

    public function hasDictationSegments(int $lessonId): bool
    {
        $lesson = ListeningExternalLesson::find($lessonId);
        if (! $lesson) {
            return false;
        }

        $metadata = $lesson->metadata_json;
        if (! is_array($metadata)) {
            return false;
        }

        $segments = $metadata['segments'] ?? null;
        return is_array($segments) && count($segments) > 0;
    }

    public function getSegmentText(int $lessonId, int $segmentIndex): ?string
    {
        $lesson = ListeningExternalLesson::find($lessonId);
        if (! $lesson) {
            return null;
        }

        $metadata = $lesson->metadata_json;
        if (! is_array($metadata)) {
            return null;
        }

        $segments = $metadata['segments'] ?? null;
        if (! is_array($segments) || ! isset($segments[$segmentIndex])) {
            return null;
        }

        return $segments[$segmentIndex]['text'] ?? null;
    }

    public function scoreSegment(
        int $userId,
        int $lessonId,
        int $segmentIndex,
        string $userInput,
        int $timeSpentMs
    ): ?array {
        $segmentText = $this->getSegmentText($lessonId, $segmentIndex);
        if ($segmentText === null) {
            return null;
        }

        $score = $this->scoringService->scoreSegment($segmentText, $userInput);

        UserExternalLessonSegment::updateOrCreate(
            [
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'segment_index' => $segmentIndex,
            ],
            [
                'user_input' => $userInput,
                'correct_words' => $score['correct_count'],
                'wrong_words' => $score['wrong_count'],
                'missing_words' => $score['missing_count'],
                'extra_words' => $score['wrong_count'],
                'accuracy' => $score['accuracy'],
                'time_spent_ms' => $timeSpentMs,
            ]
        );

        return $score;
    }

    public function getDictationSummary(int $userId, int $lessonId): array
    {
        $segments = UserExternalLessonSegment::where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->orderBy('segment_index')
            ->get();

        if ($segments->isEmpty()) {
            return [
                'segments_completed' => 0,
                'overall_accuracy' => 0.0,
                'total_time_ms' => 0,
                'segment_scores' => [],
            ];
        }

        $totalAccuracy = $segments->avg('accuracy') ?? 0.0;
        $totalTime = $segments->sum('time_spent_ms');

        return [
            'segments_completed' => $segments->count(),
            'overall_accuracy' => round($totalAccuracy, 1),
            'total_time_ms' => (int) $totalTime,
            'segment_scores' => $segments->map(fn ($s) => [
                'segment_index' => $s->segment_index,
                'accuracy' => $s->accuracy,
                'correct_count' => $s->correct_words,
                'wrong_count' => $s->wrong_words,
                'missing_count' => $s->missing_words,
                'time_spent_ms' => $s->time_spent_ms,
            ])->toArray(),
        ];
    }

    public function completeDictation(int $userId, int $lessonId): UserExternalLessonProgress
    {
        $user = User::findOrFail($userId);
        return $this->upsertProgress($user, $lessonId, 'completed');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ListeningExternalLesson;
use App\Services\BbcCatalogService;
use App\Services\BbcDictationService;
use App\Services\BbcVocabularyCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BbcController extends Controller
{
    public function __construct(
        private readonly BbcCatalogService $catalog,
        private readonly BbcDictationService $dictation,
        private readonly BbcVocabularyCacheService $vocabCache
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'level' => $request->query('level'),
            'search' => $request->query('search'),
            'series' => $request->query('series'),
            'sort_by' => $request->query('sort_by', 'latest'),
            'per_page' => $request->query('per_page', 20),
            'page' => $request->query('page', 1),
        ];

        if (isset($filters['level']) && ! in_array($filters['level'], ['beginner', 'intermediate', 'advanced'])) {
            unset($filters['level']);
        }

        if (isset($filters['series']) && ! in_array($filters['series'], ['6-minute-english', 'all'])) {
            unset($filters['series']);
        }

        if (isset($filters['sort_by']) && ! in_array($filters['sort_by'], ['latest', 'oldest'])) {
            $filters['sort_by'] = 'latest';
        }

        $paginated = $this->catalog->listLessons($filters);

        $user = $request->user();

        $lessonIds = $paginated->pluck('id')->toArray();
        $progressMap = [];
        if ($user && count($lessonIds) > 0) {
            $progress = \App\Models\UserExternalLessonProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $lessonIds)
                ->get()
                ->keyBy('lesson_id');
            $progressMap = $progress->map(fn ($p) => [
                'status' => $p->status,
                'started_at' => $p->started_at?->toIso8601String(),
                'completed_at' => $p->completed_at?->toIso8601String(),
            ])->toArray();
        }

        $data = $paginated->map(function ($lesson) use ($progressMap) {
            $arr = $lesson->toApiArray();
            $arr['progress'] = $progressMap[$lesson->id] ?? null;
            return $arr;
        });

        return response()->json([
            'data' => $data,
            'source' => $this->catalog->getSource()->toApiArray(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $lesson = $this->catalog->getLesson($slug);

        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $user = request()->user();
        $progress = $user ? $this->catalog->getProgress($user, $lesson->id)?->toApiArray() : null;

        $arr = $lesson->toApiArray();
        $arr['progress'] = $progress;
        $arr['source'] = $lesson->source->toApiArray();

        return response()->json(['data' => $arr]);
    }

    public function updateProgress(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['not_started', 'in_progress', 'completed'])],
        ]);

        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $user = $request->user();
        $status = $request->input('status');

        if ($status === 'in_progress') {
            $progress = $this->catalog->markInProgress($user, $id);
        } elseif ($status === 'completed') {
            $progress = $this->catalog->markCompleted($user, $id);
        } else {
            $progress = $this->catalog->upsertProgress($user, $id, $status);
        }

        return response()->json(['data' => $progress->toApiArray()]);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $progress = $this->catalog->markCompleted($request->user(), $id);

        return response()->json(['data' => $progress->toApiArray()]);
    }

    public function getNotes(Request $request, int $id): JsonResponse
    {
        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $notes = $this->catalog->getNotes($request->user(), $id);

        return response()->json([
            'data' => $notes?->toApiArray() ?? ['lesson_id' => $id, 'content' => ''],
        ]);
    }

    public function updateNotes(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'content' => 'nullable|string',
        ]);

        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $notes = $this->catalog->upsertNotes($request->user(), $id, $request->input('content', ''));

        return response()->json(['data' => $notes->toApiArray()]);
    }

    public function getVocabulary(Request $request, int $id): JsonResponse
    {
        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $vocab = $this->catalog->getVocabulary($request->user(), $id);

        return response()->json([
            'data' => $vocab->map(fn ($v) => $v->toApiArray()),
        ]);
    }

    public function saveVocabulary(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'word' => 'required|string|max:255',
            'meaning' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:2000',
            'note' => 'nullable|string|max:2000',
        ]);

        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $vocab = $this->catalog->saveVocabulary($request->user(), $id, $request->only(['word', 'meaning', 'example', 'note']));

        return response()->json(['data' => $vocab->toApiArray()], 201);
    }

    public function updateVocabulary(Request $request, int $id, int $vocabularyId): JsonResponse
    {
        $request->validate([
            'word' => 'nullable|string|max:255',
            'meaning' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:2000',
            'note' => 'nullable|string|max:2000',
        ]);

        $vocab = $this->catalog->updateVocabulary(
            $request->user(),
            $vocabularyId,
            $request->only(['word', 'meaning', 'example', 'note'])
        );

        if (! $vocab) {
            return response()->json(['error' => 'Vocabulary not found'], 404);
        }

        return response()->json(['data' => $vocab->toApiArray()]);
    }

    public function deleteVocabulary(Request $request, int $id, int $vocabularyId): JsonResponse
    {
        $deleted = $this->catalog->deleteVocabulary($request->user(), $vocabularyId);

        if (! $deleted) {
            return response()->json(['error' => 'Vocabulary not found'], 404);
        }

        return response()->json(['data' => ['deleted' => true]]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $metrics = $this->catalog->getDashboardMetrics($request->user());

        return response()->json(['data' => $metrics]);
    }

    // ── Dictation Endpoints ───────────────────────────────────

    public function getDictation(Request $request, int $id): JsonResponse
    {
        $lesson = $this->dictation->getDictation($id);

        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $metadata = $lesson->metadata_json ?? [];
        $segments = $metadata['segments'] ?? [];
        $hasSegments = is_array($segments) && count($segments) > 0;

        $response = [
            'data' => [
                'lesson' => $lesson->toApiArray(),
                'has_segments' => $hasSegments,
                'segments' => $hasSegments ? $segments : [],
                'audio_url' => $metadata['audio_url'] ?? null,
                'episode_code' => $metadata['episode_code'] ?? null,
                'segments_source' => $lesson->segments_source,
                'requires_user_transcript' => $lesson->segments_source === ListeningExternalLesson::SEGMENTS_SOURCE_LEGACY_BBC,
            ],
        ];

        return response()->json($response);
    }

    public function submitSegment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'segment_index' => 'required|integer|min:0',
            'user_input' => 'required|string|min:1|max:5000',
            'time_spent_ms' => 'required|integer|min:0',
        ]);

        $lesson = $this->dictation->getDictation($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        if (! $this->dictation->hasDictationSegments($id)) {
            return response()->json(['error' => 'Dictation not available for this lesson'], 400);
        }

        if ($lesson->segments_source === ListeningExternalLesson::SEGMENTS_SOURCE_LEGACY_BBC) {
            return response()->json([
                'error' => 'Legacy BBC content has been retired for content-policy reasons. Please provide your own audio and transcript.',
                'code' => 'BBC_CONTENT_RETIRED',
            ], 410);
        }

        $result = $this->dictation->scoreSegment(
            $request->user()->id,
            $id,
            (int) $request->input('segment_index'),
            $request->input('user_input'),
            (int) $request->input('time_spent_ms'),
        );

        if ($result === null) {
            return response()->json(['error' => 'Could not score segment'], 400);
        }

        return response()->json($result);
    }

    public function getDictationSummary(Request $request, int $id): JsonResponse
    {
        $lesson = $this->dictation->getDictation($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $summary = $this->dictation->getDictationSummary($request->user()->id, $id);

        return response()->json(['data' => $summary]);
    }

    public function completeDictation(Request $request, int $id): JsonResponse
    {
        $lesson = $this->dictation->getDictation($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $progress = $this->dictation->completeDictation($request->user()->id, $id);

        return response()->json(['data' => $progress->toApiArray()]);
    }

    // ── Vocabulary Cache Endpoints ───────────────────────────

    public function getVocabularyCache(int $id): JsonResponse
    {
        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        $vocab = $this->vocabCache->getVocabulary($id);

        return response()->json([
            'data' => $vocab->map(fn ($v) => $v->toApiArray()),
        ]);
    }

    public function syncVocabularyCache(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'items' => 'required|array|max:200',
            'items.*.word' => 'required|string|max:100',
            'items.*.brief_meaning' => 'nullable|string|max:500',
            'items.*.position' => 'nullable|integer|min:0',
        ]);

        $lesson = $this->catalog->getLessonById($id);
        if (! $lesson) {
            return response()->json(['error' => 'Lesson not found'], 404);
        }

        // Atomic replace: clear and re-insert. Vocabulary cache is small
        // (max ~50 entries per lesson) so this is cheap and avoids
        // subtle "did this term get removed?" reconciliation logic.
        $this->vocabCache->clearForLesson($id);
        $created = $this->vocabCache->addBulk($id, $request->input('items'));

        return response()->json([
            'data' => $created->map(fn ($v) => $v->toApiArray()),
        ]);
    }
}

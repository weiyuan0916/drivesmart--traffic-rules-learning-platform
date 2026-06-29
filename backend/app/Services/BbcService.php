<?php

namespace App\Services;

use App\Models\ListeningExternalLesson;
use App\Models\ListeningSource;
use App\Models\User;
use App\Models\UserExternalLessonNote;
use App\Models\UserExternalLessonProgress;
use App\Models\UserExternalLessonSegment;
use App\Models\UserExternalLessonVocabulary;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * BbcService — facade preserved for backward compatibility.
 *
 * After the 2026-06-16 content-policy audit (.cursor/rules/bbc-feature.mdc),
 * BBC logic was split into two services:
 *
 *   BbcCatalogService     — listing, notes, vocabulary, progress, dashboard
 *   BbcDictationService   — dictation session, scoring, summary, complete
 *
 * This facade still exposes the original method signatures so that
 * BbcController, CrawlBbcLessons, CrawlBbc6MinLessons (deprecated), and
 * the existing test suite continue to work without modification.
 *
 * New code should depend on the two split services directly so that
 * service boundaries are explicit at the call site.
 *
 * @deprecated since 2026-06-16. Inject BbcCatalogService and
 *             BbcDictationService directly in new code.
 */
class BbcService
{
    public function __construct(
        private readonly BbcCatalogService $catalog = new BbcCatalogService(),
        private readonly BbcDictationService $dictation = new BbcDictationService()
    ) {}

    // ── Catalog pass-through ──────────────────────────────────

    public function getSource(): ListeningSource
    {
        return $this->catalog->getSource();
    }

    public function listLessons(array $filters = []): LengthAwarePaginator
    {
        return $this->catalog->listLessons($filters);
    }

    public function getLesson(string $slug): ?ListeningExternalLesson
    {
        return $this->catalog->getLesson($slug);
    }

    public function getLessonById(int $id): ?ListeningExternalLesson
    {
        return $this->catalog->getLessonById($id);
    }

    public function getProgress(User $user, int $lessonId): ?UserExternalLessonProgress
    {
        return $this->catalog->getProgress($user, $lessonId);
    }

    public function upsertProgress(User $user, int $lessonId, string $status): UserExternalLessonProgress
    {
        return $this->catalog->upsertProgress($user, $lessonId, $status);
    }

    public function markInProgress(User $user, int $lessonId): UserExternalLessonProgress
    {
        return $this->catalog->markInProgress($user, $lessonId);
    }

    public function markCompleted(User $user, int $lessonId): UserExternalLessonProgress
    {
        return $this->catalog->markCompleted($user, $lessonId);
    }

    public function getNotes(User $user, int $lessonId): ?UserExternalLessonNote
    {
        return $this->catalog->getNotes($user, $lessonId);
    }

    public function upsertNotes(User $user, int $lessonId, string $content): UserExternalLessonNote
    {
        return $this->catalog->upsertNotes($user, $lessonId, $content);
    }

    public function getVocabulary(User $user, int $lessonId): Collection
    {
        return $this->catalog->getVocabulary($user, $lessonId);
    }

    public function saveVocabulary(User $user, int $lessonId, array $data): UserExternalLessonVocabulary
    {
        return $this->catalog->saveVocabulary($user, $lessonId, $data);
    }

    public function updateVocabulary(User $user, int $vocabularyId, array $data): ?UserExternalLessonVocabulary
    {
        return $this->catalog->updateVocabulary($user, $vocabularyId, $data);
    }

    public function deleteVocabulary(User $user, int $vocabularyId): bool
    {
        return $this->catalog->deleteVocabulary($user, $vocabularyId);
    }

    public function getDashboardMetrics(User $user): array
    {
        return $this->catalog->getDashboardMetrics($user);
    }

    public function ensureSourceExists(): ListeningSource
    {
        return $this->catalog->ensureSourceExists();
    }

    public function upsertLesson(array $data): ListeningExternalLesson
    {
        return $this->catalog->upsertLesson($data);
    }

    // ── Dictation pass-through ────────────────────────────────

    public function getDictation(int $lessonId): ?ListeningExternalLesson
    {
        return $this->dictation->getDictation($lessonId);
    }

    public function hasDictationSegments(int $lessonId): bool
    {
        return $this->dictation->hasDictationSegments($lessonId);
    }

    public function getSegmentText(int $lessonId, int $segmentIndex): ?string
    {
        return $this->dictation->getSegmentText($lessonId, $segmentIndex);
    }

    public function scoreSegment(
        int $userId,
        int $lessonId,
        int $segmentIndex,
        string $userInput,
        int $timeSpentMs
    ): ?array {
        return $this->dictation->scoreSegment($userId, $lessonId, $segmentIndex, $userInput, $timeSpentMs);
    }

    public function getDictationSummary(int $userId, int $lessonId): array
    {
        return $this->dictation->getDictationSummary($userId, $lessonId);
    }

    public function completeDictation(int $userId, int $lessonId): UserExternalLessonSegment
    {
        return $this->dictation->completeDictation($userId, $lessonId);
    }
}

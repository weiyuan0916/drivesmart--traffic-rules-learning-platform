// ============================================================
// BBC API — VinaListen
// API calls for BBC Learning English integration
// ============================================================

import { apiClient } from '../api/client'
import { API_BASE } from './constants'
import type {
  BbcLesson,
  BbcLessonResponse,
  BbcListResponse,
  BbcLessonNote,
  BbcVocabularyItem,
  BbcVocabularyPayload,
  BbcDashboardMetrics,
  BbcLevelFilter,
  BbcSortBy,
} from '../types/bbc'

const BASE_PATH = `${API_BASE}/listening/bbc`

// ── Response Transformers ────────────────────────────────────

function transformLesson(raw: Record<string, unknown>): BbcLesson {
  return {
    id: Number(raw.id),
    sourceId: Number(raw.source_id),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    sourceUrl: String(raw.source_url ?? ''),
    thumbnailUrl: raw.thumbnail_url ? String(raw.thumbnail_url) : null,
    level: raw.level ? (raw.level as BbcLesson['level']) : null,
    durationSeconds: raw.duration_seconds != null ? Number(raw.duration_seconds) : null,
    publishedAt: raw.published_at ? String(raw.published_at) : null,
    metadata: raw.metadata as BbcLesson['metadata'] ?? null,
    createdAt: raw.created_at ? String(raw.created_at) : '',
    updatedAt: raw.updated_at ? String(raw.updated_at) : '',
    progress: raw.progress
      ? {
          status: (raw.progress as Record<string, unknown>).status as BbcLesson['progress'] extends null ? never : NonNullable<BbcLesson['progress']>['status'],
          startedAt: (raw.progress as Record<string, unknown>).started_at
            ? String((raw.progress as Record<string, unknown>).started_at)
            : null,
          completedAt: (raw.progress as Record<string, unknown>).completed_at
            ? String((raw.progress as Record<string, unknown>).completed_at)
            : null,
        }
      : null,
    source: raw.source
      ? {
          id: Number((raw.source as Record<string, unknown>).id),
          name: String((raw.source as Record<string, unknown>).name),
          slug: String((raw.source as Record<string, unknown>).slug),
          lessonCount: Number((raw.source as Record<string, unknown>).lesson_count ?? 0),
          createdAt: String((raw.source as Record<string, unknown>).created_at ?? ''),
          updatedAt: String((raw.source as Record<string, unknown>).updated_at ?? ''),
        }
      : undefined,
  }
}

function transformNote(raw: Record<string, unknown>): BbcLessonNote {
  return {
    id: Number(raw.id ?? 0),
    lessonId: Number(raw.lesson_id),
    content: String(raw.content ?? ''),
    updatedAt: raw.updated_at ? String(raw.updated_at) : undefined,
    createdAt: raw.created_at ? String(raw.created_at) : undefined,
  }
}

function transformVocabulary(raw: Record<string, unknown>): BbcVocabularyItem {
  return {
    id: Number(raw.id),
    lessonId: Number(raw.lesson_id),
    word: String(raw.word ?? ''),
    meaning: raw.meaning ? String(raw.meaning) : null,
    example: raw.example ? String(raw.example) : null,
    note: raw.note ? String(raw.note) : null,
    createdAt: raw.created_at ? String(raw.created_at) : '',
    updatedAt: raw.updated_at ? String(raw.updated_at) : '',
  }
}

// ── API Functions ────────────────────────────────────────────

export interface BbcListParams {
  level?: BbcLevelFilter
  search?: string
  series?: string
  sortBy?: BbcSortBy
  page?: number
  perPage?: number
}

export const bbcApi = {
  listLessons(params: BbcListParams = {}): Promise<BbcListResponse> {
    const searchParams = new URLSearchParams()
    if (params.level) searchParams.set('level', params.level)
    if (params.search) searchParams.set('search', params.search)
    if (params.series) searchParams.set('series', params.series)
    if (params.sortBy) searchParams.set('sort_by', params.sortBy)
    if (params.page) searchParams.set('page', String(params.page))
    if (params.perPage) searchParams.set('per_page', String(params.perPage))

    const qs = searchParams.toString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (apiClient.get<any>(`${BASE_PATH}/${qs ? `?${qs}` : ''}`) as Promise<{ data: Record<string, unknown>[]; source: Record<string, unknown>; pagination: Record<string, number> }>)
      .then((r) => ({
        data: r.data.map(transformLesson),
        source: {
          id: Number(r.source.id),
          name: String(r.source.name),
          slug: String(r.source.slug),
          lessonCount: Number(r.source.lesson_count ?? 0),
          createdAt: String(r.source.created_at ?? ''),
          updatedAt: String(r.source.updated_at ?? ''),
        },
        pagination: {
          currentPage: Number(r.pagination.current_page),
          lastPage: Number(r.pagination.last_page),
          perPage: Number(r.pagination.per_page),
          total: Number(r.pagination.total),
        },
      }))
  },

  getLesson(slug: string): Promise<BbcLesson> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (apiClient.get<any>(`${BASE_PATH}/${slug}`) as Promise<{ data: Record<string, unknown> }>)
      .then((r) => transformLesson(r.data))
  },

  updateProgress(lessonId: number, status: 'not_started' | 'in_progress' | 'completed'): Promise<void> {
    return apiClient.post(`${BASE_PATH}/${lessonId}/progress`, { status })
  },

  markComplete(lessonId: number): Promise<void> {
    return apiClient.post(`${BASE_PATH}/${lessonId}/complete`)
  },

  getNotes(lessonId: number): Promise<BbcLessonNote> {
    return apiClient
      .get<{ data: Record<string, unknown> }>(`${BASE_PATH}/${lessonId}/notes`)
      .then((r) => transformNote(r.data))
  },

  updateNotes(lessonId: number, content: string): Promise<BbcLessonNote> {
    return apiClient
      .put<{ data: Record<string, unknown> }>(`${BASE_PATH}/${lessonId}/notes`, { content })
      .then((r) => transformNote(r.data))
  },

  getVocabulary(lessonId: number): Promise<BbcVocabularyItem[]> {
    return apiClient
      .get<{ data: Record<string, unknown>[] }>(`${BASE_PATH}/${lessonId}/vocabulary`)
      .then((r) => r.data.map(transformVocabulary))
  },

  saveVocabulary(lessonId: number, payload: BbcVocabularyPayload): Promise<BbcVocabularyItem> {
    return apiClient
      .post<{ data: Record<string, unknown> }>(`${BASE_PATH}/${lessonId}/vocabulary`, payload)
      .then((r) => transformVocabulary(r.data))
  },

  updateVocabulary(
    lessonId: number,
    vocabularyId: number,
    payload: Partial<BbcVocabularyPayload>,
  ): Promise<BbcVocabularyItem> {
    return apiClient
      .put<{ data: Record<string, unknown> }>(
        `${BASE_PATH}/${lessonId}/vocabulary/${vocabularyId}`,
        payload,
      )
      .then((r) => transformVocabulary(r.data))
  },

  deleteVocabulary(lessonId: number, vocabularyId: number): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/${lessonId}/vocabulary/${vocabularyId}`)
  },

  getDashboard(): Promise<BbcDashboardMetrics> {
    return apiClient
      .get<{ data: Record<string, unknown> }>(`${BASE_PATH}/dashboard`)
      .then((r) => ({
        lessonsStarted: Number(r.data.lessons_started ?? 0),
        lessonsCompleted: Number(r.data.lessons_completed ?? 0),
        completionRate: Number(r.data.completion_rate ?? 0),
      }))
  },
}

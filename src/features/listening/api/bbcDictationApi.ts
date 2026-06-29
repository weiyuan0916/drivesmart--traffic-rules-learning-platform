// ============================================================
// BBC Dictation API — VinaListen
// API calls for BBC micro dictation
// ============================================================

import { apiClient } from './client'
import { API_BASE } from './constants'
import type {
  BbcDictationSession,
  BbcLesson,
  BbcSegmentScore,
  BbcDictationSummary,
} from '../types/bbc'

const BASE_PATH = `${API_BASE}/listening/bbc`

function transformLesson(raw: Record<string, unknown>): BbcLesson {
  return {
    id: Number(raw.id ?? 0),
    sourceId: Number(raw.source_id ?? 0),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    sourceUrl: String(raw.source_url ?? ''),
    thumbnailUrl: raw.thumbnail_url ? String(raw.thumbnail_url) : null,
    level: raw.level ? (raw.level as 'beginner' | 'intermediate' | 'advanced') : null,
    durationSeconds: raw.duration_seconds != null ? Number(raw.duration_seconds) : null,
    publishedAt: raw.published_at ? String(raw.published_at) : null,
    metadata: raw.metadata as Record<string, unknown> ?? null,
    createdAt: String(raw.created_at ?? ''),
    updatedAt: String(raw.updated_at ?? ''),
    progress: null,
  }
}

function transformSegments(raw: Record<string, unknown>[]): BbcDictationSession['segments'] {
  return raw.map((seg, i) => ({
    id: Number(seg.id ?? i),
    index: seg.index !== undefined ? Number(seg.index) : i,
    text: String(seg.text ?? ''),
    wordCount: Number(seg.word_count ?? 0),
    difficulty: (seg.difficulty ?? 'easy') as 'easy' | 'medium' | 'hard',
    estimatedDuration: Number(seg.estimated_duration ?? 3),
    startTime: seg.start_time !== undefined ? Number(seg.start_time) : undefined,
    endTime: seg.end_time !== undefined ? Number(seg.end_time) : undefined,
  }))
}

function transformScore(raw: Record<string, unknown>): BbcSegmentScore {
  return {
    correct: Array.isArray(raw.correct) ? raw.correct.map(String) : [],
    wrong: Array.isArray(raw.wrong) ? raw.wrong.map(String) : [],
    missing: Array.isArray(raw.missing) ? raw.missing.map(String) : [],
    accuracy: Number(raw.accuracy ?? 0),
    totalWords: Number(raw.total_words ?? 0),
    correctCount: Number(raw.correct_count ?? 0),
    wrongCount: Number(raw.wrong_count ?? 0),
    missingCount: Number(raw.missing_count ?? 0),
  }
}

export const bbcDictationApi = {
  getDictation(lessonId: number): Promise<BbcDictationSession> {
    return apiClient
      .get<{ data: Record<string, unknown> }>(`${BASE_PATH}/${lessonId}/dictation`)
      .then((r) => {
        const d = r.data
        return {
          lesson: transformLesson(d.lesson as Record<string, unknown>),
          hasSegments: Boolean(d.has_segments),
          segments: Array.isArray(d.segments)
            ? transformSegments(d.segments as Record<string, unknown>[])
            : [],
          audioUrl: d.audio_url ? String(d.audio_url) : null,
          episodeCode: d.episode_code ? String(d.episode_code) : null,
          segmentsSource: (d.segments_source ?? null) as BbcDictationSession['segmentsSource'],
          requiresUserTranscript: Boolean(d.requires_user_transcript),
        }
      })
  },

  submitSegment(
    lessonId: number,
    payload: {
      segment_index: number
      user_input: string
      time_spent_ms: number
    }
  ): Promise<BbcSegmentScore> {
    return apiClient
      .post<Record<string, unknown>>(`${BASE_PATH}/${lessonId}/dictation/segments`, payload)
      .then(transformScore)
  },

  getSummary(lessonId: number): Promise<BbcDictationSummary> {
    return apiClient
      .get<{ data: Record<string, unknown> }>(`${BASE_PATH}/${lessonId}/dictation/summary`)
      .then((r) => ({
        segmentsCompleted: Number(r.data.segments_completed ?? 0),
        overallAccuracy: Number(r.data.overall_accuracy ?? 0),
        totalTimeMs: Number(r.data.total_time_ms ?? 0),
        segmentScores: Array.isArray(r.data.segment_scores)
          ? (r.data.segment_scores as Record<string, unknown>[]).map(transformScore)
          : [],
      }))
  },

  complete(lessonId: number): Promise<void> {
    return apiClient.post(`${BASE_PATH}/${lessonId}/dictation/complete`)
  },
}

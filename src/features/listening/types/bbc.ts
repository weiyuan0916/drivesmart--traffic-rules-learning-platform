// ============================================================
// BBC Types — VinaListen
// ============================================================

export interface BbcSource {
  id: number
  name: string
  slug: string
  lessonCount: number
  createdAt: string
  updatedAt: string
}

export interface BbcLessonProgress {
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt: string | null
  completedAt: string | null
}

export interface BbcLesson {
  id: number
  sourceId: number
  title: string
  slug: string
  sourceUrl: string
  thumbnailUrl: string | null
  level: 'beginner' | 'intermediate' | 'advanced' | null
  durationSeconds: number | null
  publishedAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  progress: BbcLessonProgress | null
  source?: BbcSource
}

export interface BbcLessonNote {
  id?: number
  lessonId: number
  content: string
  updatedAt?: string
  createdAt?: string
}

export interface BbcVocabularyItem {
  id: number
  lessonId: number
  word: string
  meaning: string | null
  example: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface BbcVocabularyPayload {
  word: string
  meaning?: string
  example?: string
  note?: string
}

export interface BbcDashboardMetrics {
  lessonsStarted: number
  lessonsCompleted: number
  completionRate: number
}

export interface BbcPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export interface BbcListResponse {
  data: BbcLesson[]
  source: BbcSource
  pagination: BbcPagination
}

export interface BbcLessonResponse {
  data: BbcLesson
}

export type BbcLevelFilter = 'beginner' | 'intermediate' | 'advanced'
export type BbcSortBy = 'latest' | 'oldest'

// ── Micro Dictation Types ──────────────────────────────────

export interface BbcSegment {
  id: number
  index?: number
  text: string
  wordCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDuration: number
  startTime?: number
  endTime?: number
}

export interface BbcDictationSession {
  lesson: BbcLesson
  hasSegments: boolean
  segments: BbcSegment[]
  audioUrl: string | null
  episodeCode: string | null
}

export interface BbcSegmentScore {
  correct: string[]
  wrong: string[]
  missing: string[]
  accuracy: number
  totalWords: number
  correctCount: number
  wrongCount: number
  missingCount: number
}

export interface BbcSegmentAttempt {
  segmentIndex: number
  userInput: string
  timeSpentMs: number
  score: BbcSegmentScore
}

export interface BbcDictationSummary {
  segmentsCompleted: number
  overallAccuracy: number
  totalTimeMs: number
  segmentScores: BbcSegmentScore[]
}

export type MicroSegmentLength = 3 | 5 | 10
export type MicroPlaybackSpeed = 0.75 | 1 | 1.25

export interface MicroSettings {
  segmentLength: MicroSegmentLength
  playbackSpeed: MicroPlaybackSpeed
  showTranscriptAfter: boolean
  autoAdvance: boolean
}

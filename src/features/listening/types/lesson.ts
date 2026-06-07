// ============================================================
// Listening Feature Types — VinaListen
// Types for the lesson practice experience (T-B-002)
// ============================================================

import type { ApiResponse } from '../types'
import type { Lesson, LessonClip } from '../types'

// --- Lesson State Machine ---

export type LessonPracticeState =
  | 'idle'
  | 'playing'
  | 'ready_to_type'
  | 'waiting_input'
  | 'checking'
  | 'showing_result'
  | 'lesson_complete'

// --- Clip Status ---

export type ClipStatus = 'not_started' | 'in_progress' | 'completed' | 'failed'

// --- Word Result ---

export interface CheckWordResult {
  word: string
  status: WordStatus
  expected?: string
  actual?: string
}

export type WordStatus = 'correct' | 'wrong' | 'missing' | 'extra'

// --- Check Answer API ---

export interface CheckRequest {
  clip_id: number
  transcript: string
}

export interface LessonProgressSummary {
  clips_completed: number
  clips_total: number
  accuracy: number
}

export interface CheckData {
  clip_id: number
  correct_transcript: string
  user_transcript: string
  accuracy: number
  words_total: number
  words_correct: number
  words_wrong: number
  words_missing: number
  word_results: CheckWordResult[]
  xp_earned: number
  attempt_number: number
  best_accuracy: number
  is_new_best: boolean
  clip_completed: boolean
  clip_status: ClipStatus
  lesson_progress: LessonProgressSummary
}

export type CheckResponse = ApiResponse<CheckData>

// --- Reset Progress API ---

export interface ResetProgressData {
  lesson_id: number
  progress_cleared: boolean
}

export type ResetProgressResponse = ApiResponse<ResetProgressData>

// --- Lesson with Clips ---

export interface LessonWithClips extends Lesson {
  clips: LessonClip[]
  practice_count?: number
  avg_accuracy?: number
  topicSlug?: string
  topic?: {
    id: string
    name: string
    slug: string
    color: string
  }
}

// --- Clip Attempt State ---

export interface ClipAttemptState {
  clipId: string
  status: ClipStatus
  bestAccuracy: number
  attemptCount: number
  lastResult: CheckData | null
}

// --- Audio Player State ---

export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  isLoaded: boolean
  isError: boolean
}

// --- Result Display Word ---

export interface ResultWord {
  word: string
  status: WordStatus
  expected?: string
  actual?: string
  isMissing?: boolean
  isExtra?: boolean
}

// --- Lesson Complete Stats ---

export interface LessonCompleteStats {
  accuracy: number
  bestAccuracy: number
  totalClips: number
  completedClips: number
  totalCorrect: number
  totalWrong: number
  totalMissing: number
  totalAttempts: number
  xpEarned: number
  streak: number
}

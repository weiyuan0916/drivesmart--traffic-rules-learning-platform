// ============================================================
// Lesson Practice Store — VinaListen
// Zustand store for lesson practice UI state
// Does not duplicate uiStore — handles only lesson-practice-specific state
// ============================================================

import { create } from 'zustand'
import type { LessonPracticeState, ClipStatus, CheckData } from '../types/lesson'

interface ClipAttemptRecord {
  status: ClipStatus
  bestAccuracy: number
  attemptCount: number
  lastResult: CheckData | null
}

interface LessonStore {
  // Lesson state
  lessonId: string | null
  currentClipIndex: number
  totalClips: number
  transcriptInput: string
  practiceState: LessonPracticeState

  // Per-clip attempts (keyed by clipId)
  clipAttempts: Record<string, ClipAttemptRecord>

  // Current result
  currentResult: CheckData | null

  // Reset modal
  isResetModalOpen: boolean

  // Actions
  setLesson: (lessonId: string, totalClips: number) => void
  setCurrentClipIndex: (index: number) => void
  setTranscriptInput: (value: string) => void
  setPracticeState: (state: LessonPracticeState) => void
  setCurrentResult: (result: CheckData | null) => void
  updateClipAttempt: (clipId: string, data: Partial<ClipAttemptRecord>) => void
  openResetModal: () => void
  closeResetModal: () => void
  resetLessonState: () => void
}

export const useLessonStore = create<LessonStore>()((set) => ({
  lessonId: null,
  currentClipIndex: 0,
  totalClips: 0,
  transcriptInput: '',
  practiceState: 'idle',
  clipAttempts: {},
  currentResult: null,
  isResetModalOpen: false,

  setLesson: (lessonId, totalClips) =>
    set({
      lessonId,
      totalClips,
      currentClipIndex: 0,
      transcriptInput: '',
      practiceState: 'idle',
      currentResult: null,
    }),

  setCurrentClipIndex: (index) =>
    set({
      currentClipIndex: index,
      transcriptInput: '',
      practiceState: 'idle',
      currentResult: null,
    }),

  setTranscriptInput: (transcriptInput) => set({ transcriptInput }),

  setPracticeState: (practiceState) => set({ practiceState }),

  setCurrentResult: (currentResult) => set({ currentResult }),

  updateClipAttempt: (clipId, data) =>
    set((state) => {
      const existing = state.clipAttempts[clipId] ?? {
        status: 'not_started' as ClipStatus,
        bestAccuracy: 0,
        attemptCount: 0,
        lastResult: null,
      }
      return {
        clipAttempts: {
          ...state.clipAttempts,
          [clipId]: { ...existing, ...data },
        },
      }
    }),

  openResetModal: () => set({ isResetModalOpen: true }),

  closeResetModal: () => set({ isResetModalOpen: false }),

  resetLessonState: () =>
    set({
      currentClipIndex: 0,
      transcriptInput: '',
      practiceState: 'idle',
      currentResult: null,
      clipAttempts: {},
    }),
}))

// ============================================================
// BBC Micro Dictation Store — VinaListen
// Zustand store for micro dictation session state
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BbcDictationSession,
  BbcSegmentAttempt,
  MicroSettings,
} from '../types/bbc'

type DictationPhase = 'intro' | 'playing' | 'input' | 'checking' | 'results' | 'summary'

interface BbcMicroDictationState {
  lesson: BbcDictationSession | null
  currentIndex: number
  phase: DictationPhase
  isPlaying: boolean
  hasChecked: boolean
  attempts: BbcSegmentAttempt[]
  settings: MicroSettings
  startedAt: string | null

  initSession: (lesson: BbcDictationSession) => void
  setPhase: (phase: DictationPhase) => void
  setCurrentIndex: (index: number) => void
  playSegment: () => void
  pauseSegment: () => void
  submitAttempt: (attempt: BbcSegmentAttempt) => void
  updateSettings: (partial: Partial<MicroSettings>) => void
  resetSession: () => void
}

const DEFAULT_SETTINGS: MicroSettings = {
  segmentLength: 5,
  playbackSpeed: 1,
  showTranscriptAfter: true,
  autoAdvance: false,
}

export const useBbcMicroDictationStore = create<BbcMicroDictationState>()(
  persist(
    (set) => ({
      lesson: null,
      currentIndex: 0,
      phase: 'intro',
      isPlaying: false,
      hasChecked: false,
      attempts: [],
      settings: DEFAULT_SETTINGS,
      startedAt: null,

      initSession: (lesson) => {
        set({
          lesson,
          currentIndex: 0,
          phase: 'intro',
          isPlaying: false,
          hasChecked: false,
          attempts: [],
          startedAt: new Date().toISOString(),
        })
      },

      setPhase: (phase) => set({ phase }),

      setCurrentIndex: (index) =>
        set({
          currentIndex: index,
          hasChecked: false,
          phase: 'intro',
          isPlaying: false,
        }),

      playSegment: () => set({ isPlaying: true, phase: 'playing' }),

      pauseSegment: () => set({ isPlaying: false, phase: 'input' }),

      submitAttempt: (attempt) =>
        set((state) => {
          const existing = state.attempts.findIndex((a) => a.segmentIndex === attempt.segmentIndex)
          const newAttempts =
            existing >= 0
              ? state.attempts.map((a, i) => (i === existing ? attempt : a))
              : [...state.attempts, attempt]
          return {
            hasChecked: true,
            phase: 'results',
            isPlaying: false,
            attempts: newAttempts,
          }
        }),

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      resetSession: () =>
        set({
          lesson: null,
          currentIndex: 0,
          phase: 'intro',
          isPlaying: false,
          hasChecked: false,
          attempts: [],
          settings: DEFAULT_SETTINGS,
          startedAt: null,
        }),
    }),
    {
      name: 'drivesmart_bbc_dictation',
      partialize: ({ lesson, currentIndex, attempts, startedAt }) => ({
        lesson,
        currentIndex,
        attempts,
        startedAt,
      }),
    }
  )
)

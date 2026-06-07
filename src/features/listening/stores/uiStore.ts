// ============================================================
// UI Store — VinaListen
// Zustand store for global UI state
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ListeningView } from '../types'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

interface UIState {
  // Listening module view
  listeningView: ListeningView
  currentTopicSlug: string | null
  currentLessonId: string | null
  currentClipIndex: number

  // Audio player
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number

  // Toasts
  toasts: Toast[]

  // Mobile nav
  activeMobileTab: 'home' | 'topics' | 'progress' | 'profile'

  // Onboarding
  hasCompletedOnboarding: boolean

  // Actions
  setListeningView: (view: ListeningView, topicSlug?: string, lessonId?: string) => void
  setCurrentClipIndex: (index: number) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: number) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setActiveMobileTab: (tab: UIState['activeMobileTab']) => void
  setHasCompletedOnboarding: (completed: boolean) => void
  resetLessonState: () => void
}

let toastIdCounter = 0

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      listeningView: 'topics',
      currentTopicSlug: null,
      currentLessonId: null,
      currentClipIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      toasts: [],
      activeMobileTab: 'home',
      hasCompletedOnboarding: false,

      setListeningView: (view, topicSlug, lessonId) =>
        set({
          listeningView: view,
          currentTopicSlug: topicSlug ?? null,
          currentLessonId: lessonId ?? null,
          currentClipIndex: 0,
        }),

      setCurrentClipIndex: (index) => set({ currentClipIndex: index }),

      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setCurrentTime: (currentTime) => set({ currentTime }),

      setDuration: (duration) => set({ duration }),

      setPlaybackRate: (playbackRate) => set({ playbackRate }),

      addToast: (toast) => {
        const id = `toast-${++toastIdCounter}`
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }))
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }))
        }, 4000)
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      setActiveMobileTab: (activeMobileTab) => set({ activeMobileTab }),

      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),

      resetLessonState: () =>
        set({
          currentClipIndex: 0,
          isPlaying: false,
          currentTime: 0,
        }),
    }),
    {
      name: 'vinalisten-ui',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        playbackRate: state.playbackRate,
      }),
    },
  ),
)

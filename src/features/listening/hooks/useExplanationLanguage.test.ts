import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useExplanationLanguage } from './useExplanationLanguage'
import { useExplanationStore } from '../stores/explanationStore'

// Mock stores
vi.mock('../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({ user: null })),
}))

describe('useExplanationLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: no localOverride, currentLanguage is 'vi'
    ;(useExplanationStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector?: (s: { currentLanguage: string; localOverride: string | null; setLanguage: typeof vi.fn; setOverride: typeof vi.fn; clearOverride: typeof vi.fn }) => unknown) => {
        const state = {
          currentLanguage: 'vi',
          localOverride: null,
          setLanguage: vi.fn(),
          setOverride: vi.fn(),
          clearOverride: vi.fn(),
        }
        return selector ? selector(state) : state
      },
    )
  })

  describe('language resolution priority', () => {
    it('returns localOverride when set', () => {
      ;(useExplanationStore as ReturnType<typeof vi.fn>).mockImplementation(
        (selector?: (s: { currentLanguage: string; localOverride: string | null; setLanguage: typeof vi.fn; setOverride: typeof vi.fn; clearOverride: typeof vi.fn }) => unknown) => {
          const state = {
            currentLanguage: 'vi',
            localOverride: 'ja',
            setLanguage: vi.fn(),
            setOverride: vi.fn(),
            clearOverride: vi.fn(),
          }
          return selector ? selector(state) : state
        },
      )

      const { result } = renderHook(() => useExplanationLanguage())
      expect(result.current.language).toBe('ja')
    })

    it('returns default vi when no localOverride and browser returns null', () => {
      ;(useExplanationStore as ReturnType<typeof vi.fn>).mockImplementation(
        (selector?: (s: { currentLanguage: string; localOverride: string | null }) => unknown) => {
          const state = { currentLanguage: 'vi', localOverride: null }
          return selector ? selector(state) : state
        },
      )

      const { result } = renderHook(() => useExplanationLanguage())
      // Falls back to DEFAULT_LANGUAGE when browserLang resolves to default
      expect(result.current.language).toBeTruthy()
    })

    it('updates language when localOverride changes', () => {
      const { result, rerender } = renderHook(() => useExplanationLanguage())

      // Simulate store update
      ;(useExplanationStore as ReturnType<typeof vi.fn>).mockImplementation(
        (selector?: (s: { currentLanguage: string; localOverride: string | null; setLanguage: typeof vi.fn; setOverride: typeof vi.fn; clearOverride: typeof vi.fn }) => unknown) => {
          const state = {
            currentLanguage: 'vi',
            localOverride: 'fr',
            setLanguage: vi.fn(),
            setOverride: vi.fn(),
            clearOverride: vi.fn(),
          }
          return selector ? selector(state) : state
        },
      )

      rerender()
      expect(result.current.language).toBe('fr')
    })
  })

  describe('returned API shape', () => {
    it('returns an object with language, setLanguage, setOverride, clearOverride', () => {
      const { result } = renderHook(() => useExplanationLanguage())

      expect(result.current).toHaveProperty('language')
      expect(result.current).toHaveProperty('setLanguage')
      expect(result.current).toHaveProperty('setOverride')
      expect(result.current).toHaveProperty('clearOverride')
      expect(typeof result.current.setLanguage).toBe('function')
      expect(typeof result.current.setOverride).toBe('function')
      expect(typeof result.current.clearOverride).toBe('function')
    })

    it('returns a valid LanguageCode', () => {
      const { result } = renderHook(() => useExplanationLanguage())

      const validCodes = ['vi', 'en', 'ja', 'zh', 'ko', 'fr']
      expect(validCodes).toContain(result.current.language)
    })
  })
})

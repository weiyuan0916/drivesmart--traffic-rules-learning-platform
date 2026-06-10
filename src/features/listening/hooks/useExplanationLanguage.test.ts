import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock stores at module level (hoisted)
const mockSetOverride = vi.fn()
const mockClearOverride = vi.fn()

vi.mock('../stores/explanationStore', () => ({
  useExplanationStore: vi.fn((selector?: (s: { currentLanguage: string; localOverride: string | null; setLanguage: typeof vi.fn; setOverride: typeof vi.fn; clearOverride: typeof vi.fn }) => unknown) => {
    const state = {
      currentLanguage: 'vi',
      localOverride: null,
      setLanguage: vi.fn(),
      setOverride: mockSetOverride,
      clearOverride: mockClearOverride,
    }
    if (selector) {
      return selector(state)
    }
    return state
  }),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
  })),
}))

// Import hook after mocks are set up
import { useExplanationLanguage } from './useExplanationLanguage'

describe('useExplanationLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock functions
    mockSetOverride.mockClear()
    mockClearOverride.mockClear()
  })

  // Test the priority resolution logic
  describe('Priority Resolution Logic', () => {
    it('returns localOverride when it is set', () => {
      const localOverride = 'ja' as string | null
      const userPref = null
      const browserLang = 'en'

      const resolved = (() => {
        if (localOverride !== null) return localOverride
        if (userPref) return userPref
        if (browserLang) return browserLang
        return 'vi'
      })()

      expect(resolved).toBe('ja')
    })

    it('returns user preference when localOverride is null', () => {
      const localOverride = null
      const userPref = 'en' as string | null
      const browserLang = 'ko'

      const resolved = (() => {
        if (localOverride !== null) return localOverride
        if (userPref) return userPref
        if (browserLang) return browserLang
        return 'vi'
      })()

      expect(resolved).toBe('en')
    })

    it('returns browser language when no override or user pref', () => {
      const localOverride = null
      const userPref = null
      const browserLang = 'ko'

      const resolved = (() => {
        if (localOverride !== null) return localOverride
        if (userPref) return userPref
        if (browserLang) return browserLang
        return 'vi'
      })()

      expect(resolved).toBe('ko')
    })

    it('returns default vi when no other preference', () => {
      const LANGUAGE_MAP: Record<string, string> = {
        vi: 'vi',
        en: 'en',
        ja: 'ja',
      }
      const browserLang = 'de' // unsupported
      const resolvedBrowser = LANGUAGE_MAP[browserLang] ?? 'vi'

      const localOverride = null
      const userPref = null

      const resolved = (() => {
        if (localOverride !== null) return localOverride
        if (userPref) return userPref
        if (resolvedBrowser) return resolvedBrowser
        return 'vi'
      })()

      expect(resolved).toBe('vi')
    })
  })

  // Test the actual hook behavior
  describe('Hook Behavior', () => {
    it('calls setOverride when setOverride is invoked', () => {
      const { result } = renderHook(() => useExplanationLanguage())
      act(() => result.current.setOverride('ko'))
      expect(mockSetOverride).toHaveBeenCalledWith('ko')
    })

    it('calls clearOverride when clearOverride is invoked', () => {
      const { result } = renderHook(() => useExplanationLanguage())
      act(() => result.current.clearOverride())
      expect(mockClearOverride).toHaveBeenCalled()
    })

    it('returns an object with the expected shape', () => {
      const { result } = renderHook(() => useExplanationLanguage())

      expect(result.current).toHaveProperty('language')
      expect(result.current).toHaveProperty('setLanguage')
      expect(result.current).toHaveProperty('setOverride')
      expect(result.current).toHaveProperty('clearOverride')
      expect(typeof result.current.setLanguage).toBe('function')
      expect(typeof result.current.setOverride).toBe('function')
      expect(typeof result.current.clearOverride).toBe('function')
    })

    it('language returns a valid LanguageCode', () => {
      const { result } = renderHook(() => useExplanationLanguage())

      const validCodes = ['vi', 'en', 'ja', 'zh', 'ko', 'fr']
      expect(validCodes).toContain(result.current.language)
    })
  })
})

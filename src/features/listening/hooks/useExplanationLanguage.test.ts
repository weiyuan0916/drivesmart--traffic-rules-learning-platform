import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExplanationLanguage } from './useExplanationLanguage'

// Use module-level mock functions so they can be verified after hook calls
const mockSetLanguage = vi.fn()
const mockSetOverride = vi.fn()
const mockClearOverride = vi.fn()

// Stable mock state — shared across all mock calls
const mockStoreState = {
  currentLanguage: 'vi',
  localOverride: null as string | null,
  setLanguage: mockSetLanguage,
  setOverride: mockSetOverride,
  clearOverride: mockClearOverride,
}

vi.mock('../stores/explanationStore', () => ({
  useExplanationStore: vi.fn((selector?: (s: typeof mockStoreState) => unknown) => {
    if (selector) return selector(mockStoreState)
    return mockStoreState
  }),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({ user: null })),
}))

describe('useExplanationLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoreState.localOverride = null
    mockStoreState.currentLanguage = 'vi'
  })

  describe('language resolution', () => {
    it('returns localOverride when set', () => {
      mockStoreState.localOverride = 'ja'

      const { result } = renderHook(() => useExplanationLanguage())
      expect(result.current.language).toBe('ja')
    })

    it('returns default when localOverride is null', () => {
      mockStoreState.localOverride = null

      const { result } = renderHook(() => useExplanationLanguage())
      expect(result.current.language).toBeTruthy()
    })

    it('updates when localOverride changes between renders', () => {
      const { result, rerender } = renderHook(() => useExplanationLanguage())
      expect(result.current.language).toBeTruthy()

      mockStoreState.localOverride = 'fr'
      rerender()
      expect(result.current.language).toBe('fr')
    })
  })

  describe('returned API shape', () => {
    it('returns language, setLanguage, setOverride, clearOverride', () => {
      const { result } = renderHook(() => useExplanationLanguage())

      expect(result.current).toHaveProperty('language')
      expect(result.current).toHaveProperty('setLanguage')
      expect(result.current).toHaveProperty('setOverride')
      expect(result.current).toHaveProperty('clearOverride')
      expect(typeof result.current.setLanguage).toBe('function')
      expect(typeof result.current.setOverride).toBe('function')
      expect(typeof result.current.clearOverride).toBe('function')
    })

    it('returns a valid LanguageCode string', () => {
      const { result } = renderHook(() => useExplanationLanguage())
      const lang = result.current.language
      expect(typeof lang).toBe('string')
      expect(['vi', 'en', 'ja', 'zh', 'ko', 'fr']).toContain(lang)
    })
  })

  describe('actions', () => {
    it('setOverride calls the store setOverride with the given language', () => {
      const { result } = renderHook(() => useExplanationLanguage())
      act(() => result.current.setOverride('ko'))
      expect(mockSetOverride).toHaveBeenCalledWith('ko')
    })

    it('clearOverride calls the store clearOverride', () => {
      const { result } = renderHook(() => useExplanationLanguage())
      act(() => result.current.clearOverride())
      expect(mockClearOverride).toHaveBeenCalled()
    })
  })
})

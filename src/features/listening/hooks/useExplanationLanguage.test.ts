import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExplanationLanguage } from './useExplanationLanguage'

// Mock the store
const mockExplanationStore = {
  currentLanguage: 'vi' as const,
  localOverride: null,
  setLanguage: vi.fn(),
  setOverride: vi.fn(),
  clearOverride: vi.fn(),
}

const mockAuthStore = {
  user: null,
}

vi.mock('../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => mockExplanationStore),
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}))

describe('useExplanationLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExplanationStore.currentLanguage = 'vi'
    mockExplanationStore.localOverride = null
    mockExplanationStore.setLanguage = vi.fn()
    mockExplanationStore.setOverride = vi.fn()
    mockExplanationStore.clearOverride = vi.fn()
    mockAuthStore.user = null
  })

  it('returns currentLanguage from store when no localOverride is set', () => {
    const { result } = renderHook(() => useExplanationLanguage())
    expect(result.current.language).toBe('vi')
  })

  it('returns localOverride when set', () => {
    mockExplanationStore.localOverride = 'ja'

    const { result } = renderHook(() => useExplanationLanguage())
    expect(result.current.language).toBe('ja')
  })

  it('setOverride calls store.setOverride', () => {
    const setOverride = vi.fn()
    mockExplanationStore.setOverride = setOverride

    const { result } = renderHook(() => useExplanationLanguage())
    act(() => result.current.setOverride('ko'))
    expect(setOverride).toHaveBeenCalledWith('ko')
  })

  it('clearOverride calls store.clearOverride', () => {
    const clearOverride = vi.fn()
    mockExplanationStore.clearOverride = clearOverride
    mockExplanationStore.localOverride = 'ja'

    const { result } = renderHook(() => useExplanationLanguage())
    act(() => result.current.clearOverride())
    expect(clearOverride).toHaveBeenCalled()
  })
})
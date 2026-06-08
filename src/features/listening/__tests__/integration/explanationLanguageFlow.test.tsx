import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResultPanel } from '../../components/ResultPanel'
import { ExplanationProvider } from '../../contexts/ExplanationContext'
import type { CheckData } from '../../types/lesson'

// Mock stores
vi.mock('../../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => ({
    currentLanguage: 'vi',
    localOverride: null,
    currentContent: {
      clipId: '42',
      language: 'vi',
      explanation: 'Bạn thường bỏ sót mạo từ "a", "an", "the".',
      vocabulary: [
        { word: 'frequently', translation: 'thường xuyên', phonetic: '/ˈfriːkwəntli/' },
      ],
      aiGenerated: false,
    },
    isLoading: false,
    error: null,
    setLanguage: vi.fn(),
    setOverride: vi.fn(),
    clearOverride: vi.fn(),
    fetchExplanation: vi.fn(),
    clearError: vi.fn(),
  })),
}))

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({ user: null })),
}))

function renderResultPanel(result: CheckData) {
  return render(
    <ExplanationProvider>
      <ResultPanel result={result} onRetry={() => {}} />
    </ExplanationProvider>,
  )
}

describe('Explanation Language Flow', () => {
  const mockResult: CheckData = {
    clip_id: 42,
    correct_transcript: 'I am learning English every day',
    user_transcript: 'I am learn English every day',
    accuracy: 85,
    words_total: 7,
    words_correct: 6,
    words_wrong: 1,
    words_missing: 0,
    word_results: [
      { word: 'I', status: 'correct' },
      { word: 'am', status: 'correct' },
      { word: 'learn', status: 'wrong', expected: 'learning', actual: 'learn' },
      { word: 'English', status: 'correct' },
      { word: 'every', status: 'correct' },
      { word: 'day', status: 'correct' },
    ],
    xp_earned: 85,
    attempt_number: 1,
    best_accuracy: 85,
    is_new_best: true,
    clip_completed: true,
    clip_status: 'completed',
    lesson_progress: {
      clips_completed: 1,
      clips_total: 5,
      accuracy: 85,
    },
  }

  it('shows explanation panel after clip completion', async () => {
    renderResultPanel(mockResult)
    await waitFor(() => {
      expect(screen.getByText(/Bạn thường bỏ sót/)).toBeInTheDocument()
    })
  })

  it('shows language selector with 6 options', () => {
    renderResultPanel(mockResult)
    expect(screen.getAllByRole('radio')).toHaveLength(6)
  })
})
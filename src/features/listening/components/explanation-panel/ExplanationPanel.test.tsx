import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExplanationPanel } from './ExplanationPanel'
import { ExplanationProvider } from '../../contexts/ExplanationContext'
import type { ExplanationContent } from '../../types/explanation'

// Mock the store
const mockStore = {
  currentLanguage: 'vi' as const,
  localOverride: null,
  currentContent: null,
  isLoading: false,
  error: null,
  setLanguage: vi.fn(),
  setOverride: vi.fn(),
  clearOverride: vi.fn(),
  fetchExplanation: vi.fn(),
  clearError: vi.fn(),
}

vi.mock('../../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => mockStore),
}))

const mockContent: ExplanationContent = {
  clipId: '42',
  language: 'vi',
  explanation: 'Bạn thường bỏ sót mạo từ "a", "an", "the".',
  vocabulary: [
    { word: 'frequently', translation: 'thường xuyên', phonetic: '/ˈfriːkwəntli/' },
    { word: 'improve', translation: 'cải thiện', phonetic: '/ɪmˈpruːv/' },
  ],
  aiGenerated: false,
}

function renderWithContext(ui: React.ReactElement) {
  return render(<ExplanationProvider>{ui}</ExplanationProvider>)
}

describe('ExplanationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.currentContent = null
    mockStore.isLoading = false
    mockStore.error = null
    mockStore.localOverride = null
  })

  it('renders explanation text when content is available', () => {
    mockStore.currentContent = mockContent

    renderWithContext(<ExplanationPanel clipId="42" />)
    expect(screen.getByText(/Bạn thường bỏ sót mạo từ/)).toBeInTheDocument()
  })

  it('displays vocabulary items with phonetic transcription', () => {
    mockStore.currentContent = mockContent

    renderWithContext(<ExplanationPanel clipId="42" showVocabulary={true} />)
    expect(screen.getByText('frequently')).toBeInTheDocument()
    expect(screen.getByText('/ˈfriːkwəntli/')).toBeInTheDocument()
    expect(screen.getByText('thường xuyên')).toBeInTheDocument()
  })

  it('renders the LanguageSelector with button-group variant', () => {
    mockStore.currentContent = mockContent

    renderWithContext(<ExplanationPanel clipId="42" />)
    expect(screen.getByRole('radiogroup', { name: 'Explanation language' })).toBeInTheDocument()
  })
})
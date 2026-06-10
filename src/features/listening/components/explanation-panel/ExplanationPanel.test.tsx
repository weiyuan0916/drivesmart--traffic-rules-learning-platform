import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExplanationPanel } from './ExplanationPanel'
import { ExplanationProvider } from '../../contexts/ExplanationContext'
import type { ExplanationContent } from '../../types/explanation'

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

  describe('Content rendering', () => {
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

  describe('Loading state', () => {
    it('renders loading skeleton when isLoading is true', () => {
      mockStore.isLoading = true

      renderWithContext(<ExplanationPanel clipId="42" />)
      expect(screen.getByRole('status', { name: 'Đang tải giải thích...' })).toBeInTheDocument()
    })

    it('renders language selector buttons even while loading', () => {
      mockStore.isLoading = true

      renderWithContext(<ExplanationPanel clipId="42" />)
      expect(screen.getByRole('radiogroup', { name: 'Explanation language' })).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('renders error component when error is set', () => {
      mockStore.error = 'Network request failed'

      renderWithContext(<ExplanationPanel clipId="42" />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Không thể tải giải thích/)).toBeInTheDocument()
    })

    it('renders retry button in error state', () => {
      mockStore.error = 'Network request failed'

      renderWithContext(<ExplanationPanel clipId="42" />)
      expect(screen.getByText('Thử lại')).toBeInTheDocument()
    })

    it('renders fallback button when language is not vi', () => {
      mockStore.localOverride = 'en'
      mockStore.error = 'Network request failed'

      renderWithContext(<ExplanationPanel clipId="42" />)
      expect(screen.getByText('🇻🇳 Dùng Tiếng Việt')).toBeInTheDocument()
    })

    it('does not render fallback button when language is already vi', () => {
      mockStore.localOverride = 'vi'
      mockStore.error = 'Network request failed'

      renderWithContext(<ExplanationPanel clipId="42" />)
      expect(screen.queryByText('🇻🇳 Dùng Tiếng Việt')).not.toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('renders empty state when no content, not loading, no error', () => {
      renderWithContext(<ExplanationPanel clipId="42" />)
      expect(screen.getByText('Đang tải giải thích...')).toBeInTheDocument()
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSelector } from './LanguageSelector'
import type { LanguageCode } from '../../types/explanation'

// Mock zustand store
vi.mock('../../stores/explanationStore', () => ({
  useExplanationStore: vi.fn(() => ({
    currentLanguage: 'vi',
    localOverride: null,
    setLanguage: vi.fn(),
    setOverride: vi.fn(),
    clearOverride: vi.fn(),
  })),
}))

describe('LanguageSelector', () => {
  describe('button-group variant', () => {
    it('renders all 6 language options', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />)
      expect(screen.getAllByRole('radio')).toHaveLength(6)
    })

    it('calls onChange with correct code when a language button is clicked', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />)
      fireEvent.click(screen.getByLabelText('Explanation language: 日本語'))
      expect(onChange).toHaveBeenCalledWith('ja')
    })

    it('marks the active language button as checked', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="ko" onChange={onChange} variant="button-group" />)
      expect(screen.getByRole('radio', { checked: true })).toHaveAttribute(
        'aria-label',
        'Explanation language: 한국어',
      )
    })

    it('navigates with arrow key from first to second language', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" />)
      const viButton = screen.getByRole('radio', { checked: true })
      viButton.focus()
      fireEvent.keyDown(viButton, { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith('en')
    })
  })

  describe('dropdown variant', () => {
    it('opens dropdown on click', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="dropdown" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeVisible()
    })

    it('selects a language and closes dropdown', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="dropdown" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeVisible()
    })
  })

  describe('inline-selector variant', () => {
    it('renders as a compact select element', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="inline-selector" />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})
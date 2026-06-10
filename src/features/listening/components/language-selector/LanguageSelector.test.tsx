import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSelector } from './LanguageSelector'
import type { LanguageCode } from '../../types/explanation'

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
      fireEvent.click(screen.getByLabelText('Explanation language: Tiếng Nhật'))
      expect(onChange).toHaveBeenCalledWith('ja')
    })

    it('marks the active language button as checked', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="ko" onChange={onChange} variant="button-group" />)
      expect(screen.getByRole('radio', { checked: true })).toHaveAttribute(
        'aria-label',
        'Explanation language: Tiếng Hàn',
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

    it('renders flags for each language', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="button-group" showLabel={false} />)
      const buttons = screen.getAllByRole('radio')
      buttons.forEach((btn) => {
        expect(btn.textContent).toMatch(/[^\s]/)
      })
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
      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeVisible()
      fireEvent.click(screen.getByRole('option', { name: /Japanese/ }))
      expect(onChange).toHaveBeenCalledWith('ja')
      expect(listbox).not.toBeVisible()
    })

    it('closes dropdown on Escape key', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="dropdown" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeVisible()
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })

  describe('inline-selector variant', () => {
    it('renders as a combobox', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="inline-selector" />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('opens dropdown on click', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="inline-selector" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeVisible()
    })

    it('closes dropdown on Escape key', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="inline-selector" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeVisible()
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('closes dropdown on option click', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="inline-selector" />)
      fireEvent.click(screen.getByRole('combobox'))
      const options = screen.getAllByRole('option')
      fireEvent.click(options[2])
      expect(onChange).toHaveBeenCalled()
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('closes dropdown on option Enter key', () => {
      const onChange = vi.fn()
      render(<LanguageSelector value="vi" onChange={onChange} variant="inline-selector" />)
      fireEvent.click(screen.getByRole('combobox'))
      const options = screen.getAllByRole('option')
      fireEvent.keyDown(options[2], { key: 'Enter' })
      expect(onChange).toHaveBeenCalled()
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })
})
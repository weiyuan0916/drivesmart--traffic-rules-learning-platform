import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExplanationError } from './ExplanationError'

describe('ExplanationError', () => {
  const defaultProps = {
    language: 'en' as const,
    onRetry: vi.fn(),
  }

  it('renders error alert with message', () => {
    render(<ExplanationError {...defaultProps} message="Network failed" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Network failed')).toBeInTheDocument()
  })

  it('renders retry button', () => {
    render(<ExplanationError {...defaultProps} />)
    expect(screen.getByText('Thử lại')).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    render(<ExplanationError {...defaultProps} onRetry={onRetry} />)
    screen.getByText('Thử lại').click()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders fallback button when language is not vi', () => {
    const onFallback = vi.fn()
    render(<ExplanationError {...defaultProps} onFallback={onFallback} language="en" />)
    expect(screen.getByText('🇻🇳 Dùng Tiếng Việt')).toBeInTheDocument()
  })

  it('does not render fallback button when language is vi', () => {
    render(<ExplanationError {...defaultProps} onFallback={vi.fn()} language="vi" />)
    expect(screen.queryByText('🇻🇳 Dùng Tiếng Việt')).not.toBeInTheDocument()
  })

  it('calls onFallback when fallback button is clicked', () => {
    const onFallback = vi.fn()
    render(<ExplanationError {...defaultProps} onFallback={onFallback} language="en" />)
    screen.getByText('🇻🇳 Dùng Tiếng Việt').click()
    expect(onFallback).toHaveBeenCalledTimes(1)
  })

  it('shows language name in error message', () => {
    render(<ExplanationError {...defaultProps} language="ja" />)
    expect(screen.getByText(/Japanese/)).toBeInTheDocument()
  })
})

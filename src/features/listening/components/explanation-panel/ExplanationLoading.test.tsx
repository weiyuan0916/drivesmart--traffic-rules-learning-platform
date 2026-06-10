import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExplanationLoading } from './ExplanationLoading'

describe('ExplanationLoading', () => {
  it('renders skeleton loading UI', () => {
    render(<ExplanationLoading />)
    expect(screen.getByRole('status', { name: 'Đang tải giải thích...' })).toBeInTheDocument()
  })

  it('renders skeleton skeletons for language buttons', () => {
    const { container } = render(<ExplanationLoading />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('has accessible loading label for screen readers', () => {
    render(<ExplanationLoading />)
    expect(screen.getByText('Đang tải giải thích...')).toBeInTheDocument()
  })
})

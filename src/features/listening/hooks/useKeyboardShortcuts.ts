// ============================================================
// useKeyboardShortcuts — VinaListen
// Global keyboard shortcuts for lesson practice
// ============================================================

import { useEffect, type RefObject } from 'react'

interface ShortcutConfig {
  onPlayPause?: () => void
  onReplay?: () => void
  onCheckAnswer?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts(
  config: ShortcutConfig,
  refs: RefObject<(HTMLElement | null)[]> = { current: [] },
) {
  const { onPlayPause, onReplay, onCheckAnswer, onNext, onPrevious, onEscape, enabled = true } = config

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      // Don't fire if user is typing in an input (unless Ctrl+Enter)
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Ctrl+Enter always submits (check answer)
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        onCheckAnswer?.()
        return
      }

      // Skip if in an input and not Space
      if (isInput && !e.ctrlKey) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          onPlayPause?.()
          break
        case 'r':
        case 'R':
          if (!isInput) {
            e.preventDefault()
            onReplay?.()
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          onNext?.()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onPrevious?.()
          break
        case 'Escape':
          onEscape?.()
          break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onPlayPause, onReplay, onCheckAnswer, onNext, onPrevious, onEscape, enabled])
}

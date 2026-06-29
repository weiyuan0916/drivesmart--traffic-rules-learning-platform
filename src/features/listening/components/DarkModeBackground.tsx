// ============================================================
// DarkModeBackground — animated dark-mode cover for BBC pages
//
// Replicates the Suha template pattern: full-screen background
// opacity 1 so the full dark-bg.jpg image shows; the gradient scrim
// on top provides just enough darkening to keep card text legible.
//
// Implementation note: both layers are rendered via a React
// portal into document.body so they escape the BBC page's
// stacking context (which has its own painted background).
// Without the portal a `z-index: -100` sibling gets painted
// *behind* the body's background and is invisible.
// ============================================================

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../../context/ThemeContext'

const DARK_BG_URL = '/assets/img/bg-img/dark-bg.jpg'

export function DarkModeBackground() {
  const { theme } = useTheme()
  const [reducedMotion, setReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    setReducedMotion(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  if (theme !== 'dark' || !mounted || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div
        aria-hidden="true"
        data-testid="dark-mode-background"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundImage: `url(${DARK_BG_URL})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          opacity: 1,
          animation: reducedMotion
            ? undefined
            : 'darkModeBGMove 16s linear 0s infinite',
          WebkitAnimation: reducedMotion
            ? undefined
            : 'darkModeBGMove 16s linear 0s infinite',
          willChange: reducedMotion ? undefined : 'transform',
        }}
      />
    </>,
    document.body,
  )
}
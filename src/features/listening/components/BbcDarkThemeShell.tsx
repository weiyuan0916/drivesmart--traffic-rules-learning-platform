// ============================================================
// BbcDarkThemeShell — wraps BBC pages so that when dark mode is
// on, the animated background renders and the foreground text
// switches to a light palette for readability.
// ============================================================

import { type ReactNode } from 'react'
import { DarkModeBackground } from './DarkModeBackground'
import { useTheme } from '../../../context/ThemeContext'

interface BbcDarkThemeShellProps {
  children: ReactNode
}

export function BbcDarkThemeShell({ children }: BbcDarkThemeShellProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={isDark ? 'bbc-dark-scope' : undefined}
      style={
        isDark
          ? {
              color: 'var(--text-primary)',
              minHeight: '100%',
              position: 'relative',
            }
          : { position: 'relative', minHeight: '100%' }
      }
    >
      {isDark && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            background: 'linear-gradient(rgba(13,15,20,0.45) 0%, rgba(13,15,20,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}
      <DarkModeBackground />
      {children}
    </div>
  )
}

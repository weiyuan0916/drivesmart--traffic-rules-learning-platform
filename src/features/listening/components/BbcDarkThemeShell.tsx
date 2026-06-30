// ============================================================
// BbcDarkThemeShell — wraps BBC pages so that when dark mode is
// on, the animated background renders and the foreground text
// switches to a light palette for readability.
// ============================================================

import { type ReactNode } from 'react'
import { useTheme } from '../../../context/ThemeContext'

const DARK_BG_URL = '/assets/img/bg-img/dark-bg.jpg'

interface BbcDarkThemeShellProps {
  children: ReactNode
}

export function BbcDarkThemeShell({ children }: BbcDarkThemeShellProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={isDark ? 'bbc-dark-scope' : undefined}
      style={{
        position: 'relative',
        minHeight: '100%',
        isolation: 'isolate',
      }}
    >
      {/* Background layer - always render for dark mode */}
      {isDark && (
        <>
          {/* Dark gradient overlay for readability */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              background: 'linear-gradient(135deg, rgba(13,15,20,0.6) 0%, rgba(13,15,20,0.4) 50%, rgba(13,15,20,0.6) 100%)',
              pointerEvents: 'none',
            }}
          />
          {/* Background image */}
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
              backgroundRepeat: 'no-repeat',
              animation: 'darkModeBGMove 20s ease-in-out 0s infinite',
            }}
          />
        </>
      )}
      {/* Content layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100%',
        }}
      >
        {children}
      </div>
    </div>
  )
}

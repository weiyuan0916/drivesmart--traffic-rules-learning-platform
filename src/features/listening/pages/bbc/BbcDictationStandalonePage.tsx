// ============================================================
// BbcDictationStandalonePage — VinaListen
// Standalone shell for /listening/bbc/:slug/dictation
// Provides header, back button, and listening-module CSS context
// ============================================================

import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Headphones, ArrowLeft, Settings2 } from 'lucide-react'
import BbcMicroDictationPage from './BbcMicroDictationPage'

export default function BbcDictationStandalonePage() {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col"
      style={{
        background: 'var(--lm-bg, #F5F6F8)',
        minHeight: '100dvh',
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex-shrink-0 border-b backdrop-blur-md"
        style={{
          background: 'color-mix(in srgb, var(--lm-surface, #fff) 95%, transparent)',
          borderColor: 'var(--lm-border)',
          height: '56px',
        }}
      >
        <div className="h-full flex items-center gap-2 px-4">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            style={{
              background: 'var(--lm-surface-raised)',
              color: 'var(--lm-text-primary)',
            }}
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--lm-primary)' }}
            >
              <Headphones size={14} className="text-white" />
            </div>
            <span
              className="font-bold text-sm truncate hidden sm:block"
              style={{ color: 'var(--lm-text-primary)' }}
            >
              VinaListen
            </span>
          </div>

          <div className="flex-1" />

          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium hidden sm:block"
            style={{
              background: 'var(--lm-surface-raised)',
              color: 'var(--lm-text-secondary)',
            }}
          >
            6 Minute English
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0">
        <BbcMicroDictationPage />
      </main>
    </div>
  )
}

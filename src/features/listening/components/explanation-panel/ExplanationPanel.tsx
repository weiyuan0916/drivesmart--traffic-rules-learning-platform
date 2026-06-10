// ============================================================
// ExplanationPanel — VinaListen
// Displays AI feedback and vocabulary in the selected language
// ============================================================

import { memo, useEffect } from 'react'
import { useExplanationStore } from '../../stores/explanationStore'
import { useExplanationLanguage } from '../../hooks/useExplanationLanguage'
import { LanguageSelector } from '../language-selector/LanguageSelector'
import { ExplanationLoading } from './ExplanationLoading'
import { ExplanationError } from './ExplanationError'
import { cn } from '../../lib/utils'
import { getLanguageByCode } from '../../constants/languages'
import type { LanguageCode } from '../../types/explanation'

interface ExplanationPanelProps {
  clipId: string
  className?: string
  showVocabulary?: boolean
}

export const ExplanationPanel = memo(function ExplanationPanel({
  clipId,
  className,
  showVocabulary = true,
}: ExplanationPanelProps) {
  const store = useExplanationStore()
  const { language, setOverride } = useExplanationLanguage()

  const effectiveLang = store.localOverride ?? language

  useEffect(() => {
    store.fetchExplanation(clipId, effectiveLang)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store.fetchExplanation is stable from Zustand; only re-run when clipId or language changes
  }, [clipId, effectiveLang])

  const handleLanguageChange = (code: LanguageCode) => {
    setOverride(code)
  }

  const handleRetry = () => {
    store.clearError()
    store.fetchExplanation(clipId, effectiveLang)
  }

  const handleFallback = () => {
    setOverride('vi')
  }

  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      role="region"
      aria-label="Giải thích bài học"
      aria-live="polite"
      aria-busy={store.isLoading}
    >
      {/* Language selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary font-medium shrink-0">
          Giải thích bằng:
        </span>
        <LanguageSelector
          value={effectiveLang}
          onChange={handleLanguageChange}
          variant="button-group"
          size="sm"
          showLabel={false}
        />
      </div>

      {/* Content area */}
      {store.isLoading && <ExplanationLoading />}

      {store.error && !store.isLoading && (
        <ExplanationError
          language={effectiveLang}
          message={store.error}
          onRetry={handleRetry}
          onFallback={handleFallback}
        />
      )}

      {!store.isLoading && !store.error && store.currentContent && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* AI Feedback */}
          <div className="p-4 rounded-lg bg-bg-secondary border border-border">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
              <span>💡</span> AI Feedback
            </h4>
            <p className="text-sm text-text-primary leading-relaxed">
              {store.currentContent.explanation}
            </p>
          </div>

          {/* Vocabulary */}
          {showVocabulary && store.currentContent.vocabulary.length > 0 && (
            <div className="p-4 rounded-lg bg-bg-secondary border border-border">
              <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-1.5">
                <span>📖</span> Từ vựng
              </h4>
              <div className="flex flex-col gap-2">
                {store.currentContent.vocabulary.map((item) => (
                  <div key={item.word} className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-text-primary w-32 shrink-0">
                      {item.word}
                    </span>
                    {item.phonetic && (
                      <span className="text-xs text-text-muted font-mono w-28 shrink-0">
                        {item.phonetic}
                      </span>
                    )}
                    <span className="text-sm text-text-secondary">
                      {item.translation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state (no content, no loading, no error) */}
      {!store.isLoading && !store.error && !store.currentContent && (
        <div className="p-4 rounded-lg bg-bg-secondary border border-border text-center">
          <p className="text-sm text-text-muted">
            Đang tải giải thích...
          </p>
        </div>
      )}
    </div>
  )
})
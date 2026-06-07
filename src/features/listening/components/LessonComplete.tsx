// ============================================================
// LessonComplete — VinaListen
// Lesson completion screen with stats and retention CTAs
// ============================================================

import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Star, BookOpen, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '../lib/utils'
import { ProgressRing } from './ui/ProgressRing'
import { Button } from './ui/Button'
import type { LessonCompleteStats } from '../types/lesson'

interface LessonCompleteProps {
  lesson: {
    id: string
    name: string
    topicSlug?: string
    topicName?: string
  }
  stats: LessonCompleteStats
  onReset?: () => void
  onNextLesson?: () => void
  hasNextLesson?: boolean
}

export const LessonComplete = memo(function LessonComplete({
  lesson,
  stats,
  onReset,
  onNextLesson,
  hasNextLesson = false,
}: LessonCompleteProps) {
  const navigate = useNavigate()

  const handlePracticeAnother = () => {
    if (lesson.topicSlug) {
      navigate(`/topics/${lesson.topicSlug}`)
    } else {
      navigate('/topics')
    }
  }

  const handleBackToTopic = () => {
    if (lesson.topicSlug) {
      navigate(`/topics/${lesson.topicSlug}`)
    } else {
      navigate('/topics')
    }
  }

  return (
    <div
      className="flex flex-col items-center gap-6 py-8 px-4 max-w-md mx-auto text-center"
      role="region"
      aria-label="Lesson complete"
    >
      {/* Celebration icon */}
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
        <span className="text-3xl" aria-hidden="true">🎉</span>
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-text-primary">Lesson Complete!</h2>
        <p className="text-text-secondary">{lesson.name}</p>
      </div>

      {/* Stats card */}
      <div className="w-full bg-bg-secondary rounded-2xl border border-border p-6 flex flex-col gap-6">
        {/* Accuracy ring + best */}
        <div className="flex items-center justify-center gap-8">
          <ProgressRing
            value={stats.accuracy}
            size={120}
            strokeWidth={10}
            className="[&_circle:last-child]:text-primary"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-text-primary">
                {Math.round(stats.accuracy)}%
              </span>
              <span className="text-xs text-text-muted">Accuracy</span>
            </div>
          </ProgressRing>

          <div className="flex flex-col gap-3 text-left">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">
                Best
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {Math.round(stats.bestAccuracy)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">
                Attempts
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {stats.totalAttempts}
              </p>
            </div>
          </div>
        </div>

        {/* Word stats */}
        <div className="flex justify-center gap-6 text-sm">
          <span className="text-success font-medium">
            ✓ {stats.totalCorrect} correct
          </span>
          <span className="text-error font-medium">
            ✗ {stats.totalWrong} wrong
          </span>
          {stats.totalMissing > 0 && (
            <span className="text-error font-medium">
              − {stats.totalMissing} missing
            </span>
          )}
        </div>

        {/* XP + Streak */}
        <div className="flex justify-center items-center gap-6 pt-2 border-t border-border">
          {stats.streak > 0 && (
            <div className="flex items-center gap-2 text-accent">
              <Flame size={18} aria-hidden="true" />
              <span className="font-semibold text-sm">
                Day {stats.streak} streak
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Star size={18} aria-hidden="true" />
            <span className="text-sm">+{stats.xpEarned} XP earned</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 w-full">
        {/* Primary retention CTA */}
        <Button
          size="lg"
          className="w-full"
          onClick={handlePracticeAnother}
          rightIcon={<ChevronRight size={18} aria-hidden="true" />}
        >
          <BookOpen size={18} aria-hidden="true" />
          Practice Another Lesson
        </Button>

        {/* Secondary row */}
        <div className="flex gap-2">
          {hasNextLesson && onNextLesson && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={onNextLesson}
            >
              Next Lesson →
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onReset}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try Again
          </Button>
        </div>

        {/* Back to topic */}
        <Button
          variant="ghost"
          className="w-full text-text-muted"
          onClick={handleBackToTopic}
        >
          Back to {lesson.topicName ?? 'Topic'}
        </Button>
      </div>
    </div>
  )
})

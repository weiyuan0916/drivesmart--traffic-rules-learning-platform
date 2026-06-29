// ============================================================
// LessonComplete — VinaListen
// Lesson completion screen with stats and retention CTAs
// ============================================================

import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Star, BookOpen, ChevronRight, RotateCcw, Trophy } from 'lucide-react'
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
      aria-label="Hoàn thành bài học"
    >
      {/* Celebration icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-success/10 dark:from-success/30 dark:to-success/20 flex items-center justify-center">
        <Trophy size={40} className="text-success dark:text-success" aria-hidden="true" />
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-text-primary dark:text-white">Chúc mừng bạn!</h2>
        <p className="text-lg text-text-secondary dark:text-text-secondary">{lesson.name}</p>
      </div>

      {/* Stats card */}
      <div className="w-full bg-white dark:bg-dark-surface rounded-3xl border border-border dark:border-border-strong shadow-lg p-6 flex flex-col gap-6">
        {/* Accuracy ring + best */}
        <div className="flex items-center justify-center gap-8">
          <ProgressRing
            value={stats.accuracy}
            size={120}
            strokeWidth={10}
            className="[&_circle:last-child]:text-primary dark:[&_circle:last-child]:text-primary"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-text-primary dark:text-white">
                {Math.round(stats.accuracy)}%
              </span>
              <span className="text-xs text-text-muted dark:text-text-muted">Độ chính xác</span>
            </div>
          </ProgressRing>

          <div className="flex flex-col gap-4 text-left">
            <div>
              <p className="text-xs text-text-muted dark:text-text-muted uppercase tracking-wide">
                Kỷ lục
              </p>
              <p className="text-xl font-bold text-text-primary dark:text-white">
                {Math.round(stats.bestAccuracy)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted dark:text-text-muted uppercase tracking-wide">
                Lần thử
              </p>
              <p className="text-xl font-bold text-text-primary dark:text-white">
                {stats.totalAttempts}
              </p>
            </div>
          </div>
        </div>

        {/* Word stats */}
        <div className="flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-success dark:text-success font-medium">
            <span>✓</span> {stats.totalCorrect} đúng
          </span>
          <span className="flex items-center gap-1.5 text-error dark:text-error font-medium">
            <span>✗</span> {stats.totalWrong} sai
          </span>
          {stats.totalMissing > 0 && (
            <span className="flex items-center gap-1.5 text-warning dark:text-warning font-medium">
              <span>−</span> {stats.totalMissing} thiếu
            </span>
          )}
        </div>

        {/* XP + Streak */}
        <div className="flex justify-center items-center gap-6 pt-4 border-t border-border dark:border-border-strong">
          {stats.streak > 0 && (
            <div className="flex items-center gap-2 text-accent dark:text-accent">
              <Flame size={20} className="streak-fire" aria-hidden="true" />
              <span className="font-semibold text-sm">
                Day {stats.streak} streak
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-primary dark:text-primary font-semibold">
            <Star size={20} aria-hidden="true" />
            <span className="text-sm">+{stats.xpEarned} XP</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full">
        {/* Primary retention CTA */}
        <Button
          size="lg"
          className="w-full"
          onClick={handlePracticeAnother}
          rightIcon={<ChevronRight size={18} aria-hidden="true" />}
        >
          <BookOpen size={18} aria-hidden="true" />
          Bài học khác
        </Button>

        {/* Secondary row */}
        <div className="flex gap-3">
          {hasNextLesson && onNextLesson && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={onNextLesson}
            >
              Bài tiếp theo →
            </Button>
          )}
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onReset}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Thử lại
          </Button>
        </div>

        {/* Back to topic */}
        <Button
          variant="ghost"
          className="w-full text-text-muted dark:text-text-muted"
          onClick={handleBackToTopic}
        >
          Quay về {lesson.topicName ?? 'Chủ đề'}
        </Button>
      </div>
    </div>
  )
})

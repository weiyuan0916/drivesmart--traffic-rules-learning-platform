// ============================================================
// LessonPage — VinaListen
// Core dictation practice experience at /listen/:lessonId
// T-B-002 implementation
// ============================================================

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Flame } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useLessonStore } from '../../stores/lessonStore'
import { useAuthStore } from '../../stores/authStore'
import { lessonApi } from '../../api/lessonApi'
import { listeningApi } from '../../api/listeningApi'
import type { LessonPracticeState, ClipStatus, LessonCompleteStats, CheckData } from '../../types/lesson'
import { AudioPlayer } from '../../components/AudioPlayer'
import { TranscriptInput } from '../../components/TranscriptInput'
import { ResultPanel } from '../../components/ResultPanel'
import { ProgressDots } from '../../components/ProgressDots'
import { ResetLessonModal } from '../../components/ResetLessonModal'
import { LessonComplete } from '../../components/LessonComplete'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useLessonStateMachine } from '../../hooks/useLessonStateMachine'

// ============================================================
// Inner lesson layout — separated for responsive layout clarity
// ============================================================

interface InnerLessonProps {
  lessonId: string
  lessonName: string
  topicSlug?: string
  topicName?: string
  topicColor?: string
  currentClipIndex: number
  totalClips: number
  practiceState: LessonPracticeState
  transcriptInput: string
  isResetModalOpen: boolean
  clipAttempts: Record<string, { status: ClipStatus; bestAccuracy: number; attemptCount: number }>
  streak: number
  onClipChange: (index: number) => void
  onTranscriptChange: (value: string) => void
  onSubmit: () => void
  onRetry: () => void
  onNext: () => void
  onPrev: () => void
  onOpenReset: () => void
  onCloseReset: () => void
  onConfirmReset: () => void
  onLessonComplete: () => void
  audioPlayer: ReturnType<typeof useAudioPlayer>
  isChecking: boolean
  inputError: string | null
  currentResult: CheckData | null
  wordCount: number
}

function InnerLesson({
  lessonId,
  lessonName,
  topicSlug,
  topicName,
  topicColor = 'var(--primary)',
  currentClipIndex,
  totalClips,
  practiceState,
  transcriptInput,
  isResetModalOpen,
  clipAttempts,
  streak,
  onClipChange,
  onTranscriptChange,
  onSubmit,
  onRetry,
  onNext,
  onPrev,
  onOpenReset,
  onCloseReset,
  onConfirmReset,
  onLessonComplete,
  audioPlayer,
  isChecking,
  inputError,
  currentResult,
  wordCount,
}: InnerLessonProps) {
  const isShowingResult = practiceState === 'showing_result'
  const isCheckingState = practiceState === 'checking'
  const isLessonComplete = practiceState === 'lesson_complete'
  const isPlaying = practiceState === 'playing'
  const canSubmit = practiceState === 'waiting_input' && wordCount > 0

  // Build clip statuses map for ProgressDots
  const clipStatuses = useMemo(() => {
    const statuses: Record<number, ClipStatus> = {}
    Object.entries(clipAttempts).forEach(([clipId, attempt]) => {
      const index = totalClips - 1 // Last clip in the lesson for now
      if (attempt.status !== 'not_started') {
        statuses[currentClipIndex] = attempt.status
      }
    })
    // Also mark current
    if (currentResult) {
      statuses[currentClipIndex] = currentResult.clip_status
    }
    return statuses
  }, [clipAttempts, currentClipIndex, currentResult, totalClips])

  // Complete stats for LessonComplete
  const completeStats = useMemo((): LessonCompleteStats | null => {
    if (!currentResult) return null
    const attempts = Object.values(clipAttempts)
    const allResults = attempts.map((a) => a).filter(Boolean)
    return {
      accuracy: currentResult.lesson_progress.accuracy,
      bestAccuracy: currentResult.best_accuracy,
      totalClips,
      completedClips: currentResult.lesson_progress.clips_completed,
      totalCorrect: currentResult.words_correct,
      totalWrong: currentResult.words_wrong,
      totalMissing: currentResult.words_missing,
      totalAttempts: attempts.reduce((sum, a) => sum + a.attemptCount, 0),
      xpEarned: allResults.reduce((sum, a) => sum + (a.bestAccuracy > 0 ? Math.round(a.bestAccuracy * 0.1) : 0), 0),
      streak,
    }
  }, [currentResult, clipAttempts, totalClips, streak])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: audioPlayer.togglePlayPause,
    onReplay: audioPlayer.replay,
    onCheckAnswer: canSubmit ? onSubmit : undefined,
    onNext: isShowingResult && currentClipIndex < totalClips - 1 ? onNext : undefined,
    onPrevious: isShowingResult && currentClipIndex > 0 ? onPrev : undefined,
    onEscape: isShowingResult ? undefined : undefined,
    enabled: !isCheckingState,
  })

  const handleTranscriptChange = useCallback(
    (value: string) => {
      onTranscriptChange(value)
    },
    [onTranscriptChange],
  )

  // Result status for input styling
  const resultStatus = currentResult
    ? currentResult.accuracy === 100
      ? 'correct'
      : currentResult.accuracy >= 50
        ? 'partial'
        : 'wrong'
    : undefined

  if (isLessonComplete && completeStats) {
    return (
      <LessonComplete
        lesson={{ id: lessonId, name: lessonName, topicSlug, topicName }}
        stats={completeStats}
        onReset={onOpenReset}
        hasNextLesson={false}
        onNextLesson={undefined}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Desktop: 50/50 split ── */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-0 flex-1 min-h-[600px]">
        {/* Left: Audio Player */}
        <div className="flex flex-col gap-6 p-8 border-r border-border">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-text-muted">
              Clip {currentClipIndex + 1} of {totalClips}
            </p>
            <h2 className="text-xl font-semibold text-text-primary">{lessonName}</h2>
          </div>

          <div className="mt-auto">
            <AudioPlayer
              isPlaying={audioPlayer.isPlaying}
              currentTime={audioPlayer.currentTime}
              duration={audioPlayer.duration}
              isLoaded={audioPlayer.isLoaded}
              isError={audioPlayer.isError}
              playbackRate={audioPlayer.playbackRate}
              onTogglePlay={audioPlayer.togglePlayPause}
              onReplay={audioPlayer.replay}
              onSeek={audioPlayer.seek}
              onPlaybackRateChange={audioPlayer.setPlaybackRate}
              disabled={isShowingResult}
            />
          </div>

          {/* Progress dots at bottom of left panel */}
          <ProgressDots
            total={totalClips}
            current={currentClipIndex}
            statuses={clipStatuses}
          />
        </div>

        {/* Right: Transcript Input + Result */}
        <div className="flex flex-col gap-6 p-8">
          {isShowingResult && currentResult ? (
            <ResultPanel
              result={currentResult}
              onRetry={onRetry}
              onNext={currentClipIndex < totalClips - 1 ? onNext : onLessonComplete}
              hasNextClip={currentClipIndex < totalClips - 1}
              onPrev={currentClipIndex > 0 ? onPrev : undefined}
            />
          ) : (
            <div className="flex flex-col gap-4 mt-auto">
              <TranscriptInput
                value={transcriptInput}
                onChange={handleTranscriptChange}
                onSubmit={onSubmit}
                disabled={isCheckingState || isPlaying}
                error={inputError ?? undefined}
                showResult={false}
              />

              <Button
                size="lg"
                className="w-full"
                onClick={onSubmit}
                disabled={!canSubmit || isCheckingState}
                isLoading={isCheckingState}
              >
                {isCheckingState ? 'Checking...' : 'Check Answer'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile / Tablet: Stacked ── */}
      <div className="flex flex-col gap-6 p-4 lg:hidden min-h-full">
        {/* Clip indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {topicSlug && (
              <Link
                to={`/topics/${topicSlug}`}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>Back</span>
              </Link>
            )}
            {streak > 0 && (
              <span className="flex items-center gap-1 text-sm text-accent font-medium">
                <Flame size={14} aria-hidden="true" />
                Day {streak}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted">
            {currentClipIndex + 1} / {totalClips}
          </p>
        </div>

        {/* Lesson name */}
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{lessonName}</h1>
          {topicName && (
            <p className="text-sm text-text-muted">{topicName}</p>
          )}
        </div>

        {/* Audio player */}
        <div className="bg-bg-secondary rounded-xl border border-border p-5">
          <AudioPlayer
            isPlaying={audioPlayer.isPlaying}
            currentTime={audioPlayer.currentTime}
            duration={audioPlayer.duration}
            isLoaded={audioPlayer.isLoaded}
            isError={audioPlayer.isError}
            playbackRate={audioPlayer.playbackRate}
            onTogglePlay={audioPlayer.togglePlayPause}
            onReplay={audioPlayer.replay}
            onSeek={audioPlayer.seek}
            onPlaybackRateChange={audioPlayer.setPlaybackRate}
            disabled={isShowingResult}
          />
        </div>

        {/* Transcript input / Result */}
        <div className="flex-1">
          {isShowingResult && currentResult ? (
            <ResultPanel
              result={currentResult}
              onRetry={onRetry}
              onNext={currentClipIndex < totalClips - 1 ? onNext : onLessonComplete}
              hasNextClip={currentClipIndex < totalClips - 1}
              onPrev={currentClipIndex > 0 ? onPrev : undefined}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <TranscriptInput
                value={transcriptInput}
                onChange={handleTranscriptChange}
                onSubmit={onSubmit}
                disabled={isCheckingState || isPlaying}
                error={inputError ?? undefined}
                showResult={false}
              />

              <Button
                size="lg"
                className="w-full"
                onClick={onSubmit}
                disabled={!canSubmit || isCheckingState}
                isLoading={isCheckingState}
              >
                {isCheckingState ? 'Checking...' : 'Check Answer'}
              </Button>
            </div>
          )}
        </div>

        {/* Progress dots (mobile) */}
        <ProgressDots
          total={totalClips}
          current={currentClipIndex}
          statuses={clipStatuses}
        />
      </div>

      {/* Reset modal */}
      <ResetLessonModal
        isOpen={isResetModalOpen}
        onClose={onCloseReset}
        onConfirm={onConfirmReset}
        lessonName={lessonName}
        isLoading={false}
      />
    </div>
  )
}

// ============================================================
// Main LessonPage component
// ============================================================

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Local state from store
  const store = useLessonStore()

  // Auth
  const streak = useAuthStore((s) => s.user?.currentStreak ?? 0)

  // State machine
  const { state: practiceState, transition, isInState } = useLessonStateMachine()

  // Fetch lesson
  const {
    data: lessonData,
    isLoading: isLessonLoading,
    isError: isLessonError,
  } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonApi.getLesson(lessonId!),
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  })

  const lesson = lessonData?.data
  const clips = lesson?.clips ?? []
  const currentClip = clips[store.currentClipIndex]

  // Check mutation
  const checkMutation = useMutation({
    mutationFn: (transcript: string) =>
      listeningApi.check({ clip_id: Number(currentClip?.id), transcript }),
    onSuccess: (response) => {
      const data = response.data
      store.setCurrentResult(data)
      store.updateClipAttempt(String(data.clip_id), {
        status: data.clip_status,
        bestAccuracy: data.best_accuracy,
        attemptCount: data.attempt_number,
        lastResult: data,
      })
      transition('result_received')

      // If this was the last clip, transition to complete
      if (data.lesson_progress.clips_completed === data.lesson_progress.clips_total) {
        // Will be triggered by the next/complete button
      }
    },
    onError: () => {
      transition('error')
      store.setPracticeState('waiting_input')
    },
  })

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: () => lessonApi.resetProgress(lessonId!),
    onSuccess: () => {
      store.closeResetModal()
      store.resetLessonState()
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })

  // Audio player
  const handleClipEnd = useCallback(() => {
    transition('clip_ended')
    store.setPracticeState('ready_to_type')
    // Auto-advance to waiting_input after a brief moment
    setTimeout(() => {
      if (store.practiceState === 'ready_to_type') {
        transition('start_typing')
        store.setPracticeState('waiting_input')
        inputRef.current?.focus()
      }
    }, 300)
  }, [transition, store])

  const audioPlayer = useAudioPlayer({
    src: currentClip?.audioUrl ?? '',
    onClipEnd: handleClipEnd,
    autoPlay: false,
  })

  // Preload next clip audio when result is shown
  const nextClip = clips[store.currentClipIndex + 1]
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    if (isInState('showing_result') && nextClip?.audioUrl) {
      const preloadAudio = new Audio(nextClip.audioUrl)
      preloadAudio.preload = 'metadata'
      nextAudioRef.current = preloadAudio
    }
  }, [isInState('showing_result'), nextClip?.audioUrl])

  // Word count
  const wordCount = useMemo(
    () => store.transcriptInput.trim().split(/\s+/).filter(Boolean).length,
    [store.transcriptInput],
  )

  // Event handlers
  const handleClipChange = useCallback(
    (index: number) => {
      store.setCurrentClipIndex(index)
      store.setTranscriptInput('')
      store.setCurrentResult(null)
      transition('next_clip')
      store.setPracticeState('idle')
    },
    [transition, store],
  )

  const handleSubmit = useCallback(() => {
    if (!store.transcriptInput.trim() || !currentClip) return
    transition('submit')
    store.setPracticeState('checking')
    checkMutation.mutate(store.transcriptInput)
  }, [store.transcriptInput, currentClip, transition, checkMutation, store])

  const handleRetry = useCallback(() => {
    store.setTranscriptInput('')
    store.setCurrentResult(null)
    transition('retry_clip')
    store.setPracticeState('idle')
    audioPlayer.replay()
  }, [transition, store, audioPlayer])

  const handleNext = useCallback(() => {
    const nextIndex = store.currentClipIndex + 1
    if (nextIndex >= clips.length) {
      store.setPracticeState('lesson_complete')
      transition('lesson_complete')
    } else {
      handleClipChange(nextIndex)
    }
  }, [clips.length, store, transition, handleClipChange])

  const handlePrev = useCallback(() => {
    if (store.currentClipIndex > 0) {
      handleClipChange(store.currentClipIndex - 1)
    }
  }, [store.currentClipIndex, handleClipChange])

  const handleLessonComplete = useCallback(() => {
    store.setPracticeState('lesson_complete')
    transition('lesson_complete')
  }, [transition, store])

  const handleOpenReset = useCallback(() => {
    store.openResetModal()
  }, [store])

  const handleCloseReset = useCallback(() => {
    store.closeResetModal()
  }, [store])

  const handleConfirmReset = useCallback(() => {
    resetMutation.mutate()
  }, [resetMutation])

  const handlePlay = useCallback(() => {
    if (isInState('idle') || isInState('ready_to_type')) {
      transition('play')
      store.setPracticeState('playing')
      audioPlayer.play()
    }
  }, [isInState, transition, store, audioPlayer])

  // Initialize lesson in store
  useEffect(() => {
    if (lesson && lessonId) {
      store.setLesson(lessonId, clips.length)
    }
  }, [lesson, lessonId, clips.length, store])

  // Focus input when ready to type
  useEffect(() => {
    if (isInState('waiting_input')) {
      inputRef.current?.focus()
    }
  }, [isInState])

  // Input error validation
  const inputError = useMemo(() => {
    if (practiceState === 'checking' || !store.transcriptInput) return null
    if (store.transcriptInput.trim().split(/\s+/).filter(Boolean).length === 0) {
      return 'Type what you hear first.'
    }
    return null
  }, [practiceState, store.transcriptInput])

  // Loading state
  if (isLessonLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  // Error state
  if (isLessonError || !lesson || !currentClip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
        <p className="text-text-secondary">
          {isLessonError
            ? 'Failed to load lesson. Please try again.'
            : 'Lesson not found.'}
        </p>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go Back
        </Button>
      </div>
    )
  }

  return (
      <div className="min-h-full flex flex-col">
        {/* Page header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border bg-bg-secondary">
          <div className="flex items-center gap-3">
            {lesson.topic?.slug && (
              <Link
                to={`/topics/${lesson.topic.slug}`}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Back to topic
              </Link>
            )}
            <h1 className="text-base font-semibold text-text-primary">{lesson.name}</h1>
          </div>
          {streak > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-accent font-medium">
              <Flame size={16} aria-hidden="true" />
              Day {streak} streak
            </span>
          )}
        </div>

        {/* Lesson content */}
        <div className="flex-1">
          <InnerLesson
          lessonId={lesson.id}
          lessonName={lesson.name}
          topicSlug={lesson.topic?.slug}
          topicName={lesson.topic?.name}
          topicColor={lesson.topic?.color}
          currentClipIndex={store.currentClipIndex}
          totalClips={clips.length}
          practiceState={practiceState}
          transcriptInput={store.transcriptInput}
          isResetModalOpen={store.isResetModalOpen}
          clipAttempts={store.clipAttempts}
          streak={streak}
          onClipChange={handleClipChange}
          onTranscriptChange={store.setTranscriptInput}
          onSubmit={handleSubmit}
          onRetry={handleRetry}
          onNext={handleNext}
          onPrev={handlePrev}
          onOpenReset={handleOpenReset}
          onCloseReset={handleCloseReset}
          onConfirmReset={handleConfirmReset}
          onLessonComplete={handleLessonComplete}
          audioPlayer={audioPlayer}
          isChecking={checkMutation.isPending}
          inputError={inputError}
          currentResult={store.currentResult}
          wordCount={wordCount}
        />
      </div>
    </div>
  )
}

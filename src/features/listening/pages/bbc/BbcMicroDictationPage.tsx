// ============================================================
// BbcMicroDictationPage — VinaListen
// Main micro dictation practice page
// Supports both embedded (ListeningModule) and standalone routing
// ============================================================

import { useCallback, useEffect, useState, useRef, lazy, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Settings2, Play, SkipForward, ArrowLeft, Loader2, AlertCircle, Headphones, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { MicroSEO } from './MicroSEO'
import { MicroLessonProgress } from './components/MicroLessonProgress'
import { MicroSettings } from './components/MicroSettings'
import { SegmentResults } from './components/SegmentResults'
import { DictationInput } from './components/DictationInput'
import { LessonResultsSummary } from './components/LessonResultsSummary'
import { BbcDictationEmptyState } from './components/BbcDictationEmptyState'
import { bbcApi } from '../../api/bbcApi'
import { bbcDictationApi } from '../../api/bbcDictationApi'
import { useBbcMicroDictationStore } from '../../stores/bbcMicroDictationStore'
import type { BbcDictationSession, BbcSegmentScore, BbcLesson } from '../../types/bbc'
import type { ListeningView } from '../../../../types/listening'

// Lazy load segment player (uses DOM APIs)
const SegmentPlayer = lazy(() =>
  import('./components/SegmentPlayer').then((m) => ({ default: m.SegmentPlayer }))
)

type Phase = 'intro' | 'playing' | 'input' | 'checking' | 'results' | 'summary'

const PHASE_LABELS: Record<Phase, string> = {
  intro: 'Giới thiệu',
  playing: 'Đang nghe...',
  input: 'Nhập transcript',
  checking: 'Đang kiểm tra...',
  results: 'Kết quả',
  summary: 'Hoàn thành',
}

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  )
}

interface BbcMicroDictationPageProps {
  topicSlug?: string
  lesson?: BbcLesson | null
  onNavigate?: (view: ListeningView, extra?: Record<string, string>) => void
}

export default function BbcMicroDictationPage({ topicSlug, lesson: lessonProp, onNavigate }: BbcMicroDictationPageProps) {
  const { slug: slugFromParams } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const store = useBbcMicroDictationStore()

  // Derive slug from pathname — useParams() captures the wildcard route param which may
  // include the 'bbc' prefix. Extract the actual lesson slug from the full pathname.
  const slugFromPathname = (() => {
    const match = location.pathname.match(/^\/listening\/bbc\/([^/]+)(?:\/dictation)?$/);
    return match ? match[1] : null;
  })();
  const effectiveSlug = slugFromPathname ?? slugFromParams ?? topicSlug ?? '';

  const goBack = useCallback(() => {
    if (onNavigate) {
      onNavigate('bbc-list')
    } else {
      navigate('/listening/bbc')
    }
  }, [onNavigate, navigate])

  // Fetch lesson data — use passed lesson prop when available (embedded routing),
  // otherwise fetch by slug from URL (standalone routing)
  const lessonQuery = useQuery({
    queryKey: ['bbc-dictation', effectiveSlug, lessonProp?.id],
    queryFn: async () => {
      if (lessonProp) {
        const session = await bbcDictationApi.getDictation(lessonProp.id)
        return { lesson: lessonProp, session }
      }
      const lesson = await bbcApi.getLesson(effectiveSlug)
      if (!lesson) throw new Error('Lesson not found')
      const session = await bbcDictationApi.getDictation(lesson.id)
      return { lesson, session }
    },
    enabled: !!(effectiveSlug || lessonProp),
    retry: 1,
  })

  // session is available once the query resolves
  const session = lessonQuery.data?.session ?? null

  const [showSettings, setShowSettings] = useState(false)
  const [phase, setPhase] = useState<Phase>('intro')
  const [inputValue, setInputValue] = useState('')
  const [score, setScore] = useState<BbcSegmentScore | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const timerRef = useRef<number | null>(null)
  const segmentStartTimeRef = useRef<number>(0)

  // Check for saved session on mount
  useEffect(() => {
    if (session) {
      const savedLesson = store.lesson
      if (savedLesson && savedLesson.lesson.slug === effectiveSlug) {
        // Resume session
        setPhase('intro')
      } else {
        store.initSession(session)
      }
    }
  }, [session, effectiveSlug])

  // Timer effect - updates elapsedMs every 100ms when in playing or input phase
  useEffect(() => {
    if ((phase === 'playing' || phase === 'input') && segmentStartTimeRef.current) {
      timerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - segmentStartTimeRef.current)
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase])

  const submitMutation = useMutation({
    mutationFn: async (payload: { segment_index: number; user_input: string; time_spent_ms: number }) => {
      if (!session) throw new Error('No session')
      return bbcDictationApi.submitSegment(session.lesson.id, payload)
    },
    onSuccess: (data) => {
      setScore(data)
      setPhase('results')

      const currentSegment = session?.segments[store.currentIndex]
      if (currentSegment) {
        store.submitAttempt({
          segmentIndex: store.currentIndex,
          userInput: inputValue,
          timeSpentMs: Date.now() - (store.startedAt ? Date.now() : Date.now()),
          score: data,
        })
      }
    },
    onError: () => {
      setPhase('input')
    },
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('No session')
      return bbcDictationApi.complete(session.lesson.id)
    },
  })

  const handleStart = useCallback(() => {
    store.initSession(session!)
    setPhase('playing')
    segmentStartTimeRef.current = Date.now()
    store.playSegment()
  }, [session, store])

  const handleAutoPause = useCallback(() => {
    setPhase('input')
    store.pauseSegment()
  }, [store])

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || !session) return
    setPhase('checking')

    const timeSpentMs = segmentStartTimeRef.current ? Date.now() - segmentStartTimeRef.current : 0

    submitMutation.mutate({
      segment_index: store.currentIndex,
      user_input: inputValue,
      time_spent_ms: timeSpentMs,
    })
  }, [inputValue, session, store.currentIndex, submitMutation])

  const handleNextSegment = useCallback(() => {
    if (!session) return
    const nextIndex = store.currentIndex + 1

    if (nextIndex >= session.segments.length) {
      completeMutation.mutate()
      setPhase('summary')
    } else {
      store.setCurrentIndex(nextIndex)
      setInputValue('')
      setScore(null)
      setPhase('playing')
      segmentStartTimeRef.current = Date.now()
      store.playSegment()
    }
  }, [session, store, completeMutation])

  const handleRetry = useCallback(() => {
    store.resetSession()
    if (session) {
      store.initSession(session)
    }
    setInputValue('')
    setScore(null)
    setPhase('intro')
    segmentStartTimeRef.current = 0
    setElapsedMs(0)
  }, [session, store])

  const handleJumpTo = useCallback((index: number) => {
    if (index === store.currentIndex) return
    store.setCurrentIndex(index)
    setInputValue('')
    setScore(null)
    setPhase('intro')
    segmentStartTimeRef.current = 0
    setElapsedMs(0)
  }, [store])

  // Error state
  if (lessonQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[50vh]">
        <AlertCircle size={48} className="text-red-500" />
        <h1 className="text-xl font-bold text-gray-900">Không tìm thấy bài học</h1>
        <p className="text-gray-500">Bài học này không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={goBack}>
          <ArrowLeft size={18} />
          Quay lại danh sách BBC
        </Button>
      </div>
    )
  }

  // Loading state — query must be loading OR query done but session not yet available
  if (lessonQuery.isLoading || (lessonQuery.isSuccess && !session)) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <PageLoader />
      </div>
    )
  }

  // At this point query succeeded and session is available
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[50vh]">
        <AlertCircle size={48} className="text-red-500" />
        <h1 className="text-xl font-bold text-gray-900">Không tìm thấy bài học</h1>
        <p className="text-gray-500">Bài học này không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={goBack}>
          <ArrowLeft size={18} />
          Quay lại danh sách BBC
        </Button>
      </div>
    )
  }

  const currentSegment = session.segments[store.currentIndex]
  const isLastSegment = store.currentIndex >= session.segments.length - 1
  const attempts = Object.values(store.attempts)

  // Compliance: .cursor/rules/bbc-feature.mdc
  // If the lesson has no usable segments (legacy_bbc, or never had
  // segments), render the user-provided dictation workspace instead
  // of the BBC-content-driven flow.
  if (!session.hasSegments || session.requiresUserTranscript) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
        <MicroSEO
          title={session.lesson.title}
          slug={session.lesson.slug}
          level={session.lesson.level}
        />

        {/* Top bar */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
            <ArrowLeft size={16} />
            Quay lại
          </Button>
        </div>

        <BbcDictationEmptyState
          lessonTitle={session.lesson.title}
          lessonSourceUrl={session.lesson.sourceUrl}
          segmentsSource={session.segmentsSource}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
      <MicroSEO
        title={session.lesson.title}
        slug={session.lesson.slug}
        level={session.lesson.level}
      />

      {/* Top bar */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
          <ArrowLeft size={16} />
          Quay lại
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {PHASE_LABELS[phase]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings((v) => !v)}
            className="gap-1.5"
            aria-label="Cài đặt"
          >
            <Settings2 size={16} />
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MicroSettings
              settings={store.settings}
              onChange={store.updateSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <MicroLessonProgress
        current={store.currentIndex}
        total={session.segments.length}
        scores={attempts.map((a) => a.score)}
        onJumpTo={handleJumpTo}
      />

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <PhaseIntro
            key="intro"
            session={session}
            onStart={handleStart}
            settings={store.settings}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {(phase === 'playing' || phase === 'input' || phase === 'checking' || (phase === 'results' && score)) && currentSegment && (
          <PhasePractice
            key="practice"
            session={session}
            phase={phase === 'results' ? 'input' : phase}
            currentSegment={currentSegment}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onAutoPause={handleAutoPause}
            onSubmit={handleSubmit}
            isSubmitting={submitMutation.isPending}
            elapsedMs={elapsedMs}
            score={score}
            onNext={handleNextSegment}
            onReplay={() => {
              setScore(null)
              setPhase('playing')
              store.playSegment()
            }}
            isLastSegment={isLastSegment}
          />
        )}

        {phase === 'results' && score && currentSegment && (
          <PhaseResults
            key="results"
            score={score}
            reference={currentSegment.text}
            isLastSegment={isLastSegment}
            onNext={handleNextSegment}
            onReplay={() => {
              setScore(null)
              setPhase('playing')
              store.playSegment()
            }}
            onSkip={handleNextSegment}
          />
        )}

        {phase === 'summary' && (
          <PhaseSummary
            key="summary"
            session={session}
            attempts={attempts}
            onRetry={handleRetry}
            onClose={goBack}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Phase sub-components ───────────────────────────────────

function PhaseIntro({
  session,
  onStart,
  settings,
  onOpenSettings,
}: {
  session: BbcDictationSession
  onStart: () => void
  settings: { segmentLength: number; playbackSpeed: number }
  onOpenSettings: () => void
}) {
  const totalWords = session.segments.reduce((sum, s) => sum + s.wordCount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.lesson.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          <span>{session.segments.length} đoạn</span>
          <span>•</span>
          <span>{totalWords} từ</span>
          <span>•</span>
          <span className="capitalize">{session.lesson.level || 'Trung cấp'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="font-semibold text-blue-900">Cách luyện tập</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Nghe mỗi đoạn ngắn ({settings.segmentLength} giây)</li>
          <li>Nhập những gì bạn nghe được</li>
          <li>Kiểm tra đáp án và xem kết quả</li>
          <li>Tiếp tục với đoạn tiếp theo</li>
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onStart} size="lg" className="w-full gap-2" size-xl="lg">
          <Play size={20} />
          Bắt đầu luyện tập
        </Button>
        <Button variant="secondary" onClick={onOpenSettings} className="w-full gap-2">
          <Settings2 size={16} />
          Thay đổi cài đặt
        </Button>
      </div>

      <p className="text-xs text-center text-gray-400">
        Nguồn: BBC Learning English — Sử dụng cho mục đích học tập.
      </p>
    </motion.div>
  )
}

function PhasePractice({
  session,
  phase,
  currentSegment,
  inputValue,
  onInputChange,
  onAutoPause,
  onSubmit,
  isSubmitting,
  elapsedMs,
  score,
  onNext,
  onReplay,
  isLastSegment,
}: {
  session: BbcDictationSession
  phase: Phase
  currentSegment: { text: string; wordCount: number; difficulty: string }
  inputValue: string
  onInputChange: (v: string) => void
  onAutoPause: () => void
  onSubmit: () => void
  isSubmitting: boolean
  elapsedMs: number
  score: BbcSegmentScore | null
  onNext?: () => void
  onReplay?: () => void
  isLastSegment?: boolean
}) {
  const hasChecked = score !== null
  const isInputDisabled = phase === 'checking'

  return (
    <motion.div
      key="practice"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Audio player */}
      <div className="bg-gray-50 rounded-xl p-4">
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <SegmentPlayer
            audioUrl={session.audioUrl}
            segmentDuration={session.lesson.durationSeconds || 5}
            playbackSpeed={1}
            isPlaying={phase === 'playing'}
            onAutoPause={onAutoPause}
          />
        </Suspense>
      </div>

      {/* Status message */}
      {phase === 'playing' && (
        <div className="flex items-center gap-2 p-3 bg-[#35375B]/5 rounded-xl text-[#35375B]">
          <Headphones size={18} className="shrink-0" />
          <span className="text-sm font-medium">Đang nghe... Nhập những gì bạn nghe được.</span>
          {elapsedMs > 0 && (
            <span className="ml-auto font-mono text-xs tabular-nums">{formatTime(elapsedMs)}</span>
          )}
        </div>
      )}

      {/* Input - always visible */}
      <DictationInput
        value={inputValue}
        onChange={onInputChange}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
        elapsedMs={elapsedMs}
        hasChecked={hasChecked}
      />

      {/* Loading spinner - shown inline */}
      {
        <div className="flex items-center justify-center gap-2 p-4 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          <span>Đang kiểm tra...</span>
        </div>
      }

      {/* Results - shown inline below input */}
      {score && (
        <>
          <SegmentResults reference={currentSegment.text} score={score} />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={onNext} size="lg" className="flex-1 gap-2">
              {isLastSegment ? 'Xem kết quả' : 'Đoạn tiếp'}
            </Button>
            <Button variant="secondary" onClick={onReplay} size="lg" className="gap-2">
              Nghe lại
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}

function PhaseResults({
  score,
  reference,
  isLastSegment,
  onNext,
  onReplay,
  onSkip,
}: {
  score: BbcSegmentScore
  reference: string
  isLastSegment: boolean
  onNext: () => void
  onReplay: () => void
  onSkip: () => void
}) {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4"
    >
      <SegmentResults reference={reference} score={score} />

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onNext} size="lg" className="flex-1 gap-2">
          {isLastSegment ? 'Xem kết quả' : 'Đoạn tiếp'}
        </Button>
        <Button variant="secondary" onClick={onReplay} size="lg" className="gap-2">
          Nghe lại
        </Button>
        <Button variant="ghost" onClick={onSkip} size="lg" className="gap-2">
          <SkipForward size={18} />
          Bỏ qua
        </Button>
      </div>
    </motion.div>
  )
}

function PhaseSummary({
  session,
  attempts,
  onRetry,
  onClose,
}: {
  session: BbcDictationSession
  attempts: Array<{ score: BbcSegmentScore }>
  onRetry: () => void
  onClose: () => void
}) {
  const totalTimeMs = attempts.reduce((sum, a) => sum + a.score.totalWords * 1000, 0)
  const totalCorrect = attempts.reduce((sum, a) => sum + a.score.correctCount, 0)
  const totalWords = attempts.reduce((sum, a) => sum + a.score.totalWords, 0)

  const summary = {
    segmentsCompleted: attempts.length,
    overallAccuracy: totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100 * 10) / 10 : 0,
    totalTimeMs,
    segmentScores: attempts.map((a) => a.score),
  }

  return (
    <motion.div
      key="summary"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <LessonResultsSummary
        summary={summary}
        lessonTitle={session.lesson.title}
        onRetry={onRetry}
        sourceUrl={session.lesson.sourceUrl}
      />
    </motion.div>
  )
}

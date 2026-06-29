// ============================================================
// BbcPracticePage — VinaListen Premium
// Redesigned for commercial product with focus on completion rate
// ============================================================

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Play, Pause, RotateCcw, SkipForward, CheckCircle2, XCircle,
  Loader2, Trophy, Sparkles, ChevronLeft, ChevronRight, Headphones, Star, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { bbcApi } from '../../api/bbcApi'
import LessonTopBar from '../../components/LessonTopBar'
import { useListeningNavigation, type ListeningView } from '../../../../components/listening/ListeningModule'

// ── Helpers ─────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hrs}h ${remainingMins}m`
  }
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

// Theme colors
const THEME = {
  primary: '#4F46E5',      // Indigo - main action
  primaryDark: '#4338CA',   // Darker indigo
  success: '#22C55E',      // Green - correct
  warning: '#F59E0B',      // Amber - wrong
  error: '#EF4444',        // Red - error
  background: '#FAFAFA',   // Light bg
  backgroundDark: '#0F172A', // Dark bg
  surface: '#FFFFFF',      // Card surface
  textPrimary: '#1F2937',   // Primary text
  textSecondary: '#6B7280', // Secondary text
  textMuted: '#9CA3AF',    // Muted text
  border: '#E5E7EB',       // Border
}

// Types
interface Vocabulary {
  word: string
  meaning: string
  position: number
}

interface DictationSegment {
  id: number
  start: number
  end: number
  text: string
}

interface QuestionOption {
  letter: string
  text: string
}

interface Question {
  prompt: string
  options: QuestionOption[]
  answer_listen_for?: string
}

interface LessonMetadata {
  description?: string
  dictation_segments?: DictationSegment[]
  audio_url?: string
  vocabulary?: Vocabulary[]
  question?: Question
  transcript?: string
}

interface DictationResult {
  segmentIndex: number
  accuracy: number
  correct: boolean
  userText: string
  correctText: string
}

const PASS_THRESHOLD = 70

/**
 * Compare user input against the correct text at the character level.
 * Characters that match exactly are shown; others are masked with *.
 * This preserves word boundaries and spacing from the original text.
 */
function getMaskedAnswer(originalText: string, userText: string): string {
  // Normalize both texts: lowercase, collapse multiple spaces
  const normalizedOriginal = originalText.toLowerCase().replace(/\s+/g, ' ').trim()
  const normalizedUser = userText.toLowerCase().replace(/\s+/g, ' ').trim()

  // Build a word-level alignment map using a simple LCS approach
  // For each position in the original text, determine if it matches the user input
  const result: Array<{ char: string; visible: boolean }> = []
  let userIdx = 0

  for (let i = 0; i < originalText.length; i++) {
    const char = originalText[i]

    // Preserve spacing/newlines exactly as they appear in the original
    if (/\s/.test(char)) {
      // Skip whitespace in user input to align with original whitespace
      // Find the next non-space position in user input
      while (userIdx < normalizedUser.length && /\s/.test(normalizedUser[userIdx])) {
        userIdx++
      }
      result.push({ char, visible: true })
      continue
    }

    // Character-level comparison: check if current original char exists in user input at current position
    const currentOriginalChar = originalText[i].toLowerCase()
    const currentUserChar = normalizedUser[userIdx] ?? ''

    if (currentOriginalChar === currentUserChar) {
      result.push({ char, visible: true })
    } else {
      result.push({ char, visible: false })
    }
    userIdx++
  }

  // Convert back to string, masking invisible characters
  return result.map(({ char, visible }) => visible ? char : '*').join('')
}

export default function BbcPracticePage({ lessonSlug }: { lessonSlug?: string }) {
  const { slug: urlSlug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()

  const slug = lessonSlug ?? urlSlug

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ['bbc-lesson', slug],
    queryFn: () => bbcApi.getLesson(slug ?? ''),
    enabled: !!slug,
  })

  const metadata: LessonMetadata | null = useMemo(() => {
    if (!lesson?.metadata) return null
    if (typeof lesson.metadata === 'string') {
      try {
        return JSON.parse(lesson.metadata as string) as LessonMetadata
      } catch {
        return null
      }
    }
    return lesson.metadata as LessonMetadata
  }, [lesson?.metadata])

  const segments: DictationSegment[] = metadata?.dictation_segments ?? []
  const audioUrl: string | null = metadata?.audio_url ?? null

  // State
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0)
  const [dictationResults, setDictationResults] = useState<DictationResult[]>([])
  const [userText, setUserText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<{ accuracy: number; correct: boolean } | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const segmentEndRef = useRef<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Use refs to avoid dependency issues in audio event handlers
  const segmentsRef = useRef(segments)
  const currentSegmentIdxRef = useRef(currentSegmentIdx)
  
  useEffect(() => {
    segmentsRef.current = segments
    currentSegmentIdxRef.current = currentSegmentIdx
  }, [segments, currentSegmentIdx])

  // Computed values
  const currentSegment = segments[currentSegmentIdx]
  const completedSegments = dictationResults.length
  const correctSegments = dictationResults.filter(r => r.correct).length
  const currentQuestionResult = dictationResults.find(r => r.segmentIndex === currentSegmentIdx)
  const overallAccuracy = useMemo(() => {
    if (completedSegments === 0) return 0
    return Math.round((correctSegments / completedSegments) * 100)
  }, [completedSegments, correctSegments])
  const progressPercent = segments.length > 0 ? (completedSegments / segments.length) * 100 : 0
  const xpEarned = correctSegments * 10

  // Initialize audio
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener('loadeddata', () => setIsAudioLoaded(true))
      audioRef.current.addEventListener('ended', handleAudioEnded)
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [audioUrl])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return
    if (segmentEndRef.current === null) return

    const currentTime = audioRef.current.currentTime
    const segmentsData = segmentsRef.current
    const segIdx = currentSegmentIdxRef.current
    const seg = segmentsData[segIdx]
    if (!seg) return
    
    const segmentDuration = segmentEndRef.current - seg.start
    const elapsed = currentTime - seg.start
    setAudioProgress(segmentDuration > 0 ? Math.min((elapsed / segmentDuration) * 100, 100) : 0)

    if (currentTime >= segmentEndRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = segmentEndRef.current
      setIsPlaying(false)
      setAudioProgress(100)
    }
  }, [])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
    setAudioProgress(100)
  }, [])

  const playSegment = useCallback((index: number) => {
    if (!audioRef.current || !isAudioLoaded) return

    const segment = segmentsRef.current[index]
    if (!segment) return

    segmentEndRef.current = segment.end
    setAudioProgress(0)
    audioRef.current.currentTime = segment.start
    audioRef.current.playbackRate = playbackSpeed
    audioRef.current.play()
    setIsPlaying(true)
  }, [isAudioLoaded, playbackSpeed])

  const handlePlayPause = useCallback(() => {
    if (!isAudioLoaded) return

    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      playSegment(currentSegmentIdxRef.current)
    }
  }, [isAudioLoaded, isPlaying, playSegment])

  const handleReplay = useCallback(() => {
    if (!isAudioLoaded) return
    playSegment(currentSegmentIdxRef.current)
  }, [isAudioLoaded, playSegment])

  const handleSkipSegment = useCallback(() => {
    const nextIdx = currentSegmentIdxRef.current + 1
    if (nextIdx < segmentsRef.current.length) {
      setCurrentSegmentIdx(nextIdx)
      setUserText('')
      setShowResult(false)
      setLastResult(null)
    }
  }, [])

  const calculateAccuracy = (user: string, correct: string): number => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const userWords = normalize(user).split(/\s+/)
    const correctWords = normalize(correct).split(/\s+/)

    if (correctWords.length === 0) return 0

    let matches = 0
    correctWords.forEach(word => {
      if (userWords.includes(word)) matches++
    })

    return Math.round((matches / correctWords.length) * 100)
  }

  const handleNextAfterPass = useCallback(() => {
    const nextIdx = currentSegmentIdx + 1
    if (nextIdx < segments.length) {
      setCurrentSegmentIdx(nextIdx)
      setUserText('')
      setShowResult(false)
      setLastResult(null)
      playSegment(nextIdx)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [currentSegmentIdx, segments.length, playSegment])

  const handleRetry = useCallback(() => {
    setUserText('')
    setShowResult(false)
    setLastResult(null)
    playSegment(currentSegmentIdx)
    textareaRef.current?.focus()
  }, [currentSegmentIdx, playSegment])

  const handleCheckDictation = useCallback(() => {
    if (!userText.trim()) return
    
    const segment = segments[currentSegmentIdx]
    if (!segment) return

    const accuracy = calculateAccuracy(userText, segment.text)
    const passed = accuracy >= PASS_THRESHOLD

    setLastResult({ accuracy, correct: passed })
    setShowResult(true)

    setDictationResults(prev => {
      const existing = prev.findIndex(r => r.segmentIndex === currentSegmentIdx)
      const newResult: DictationResult = {
        segmentIndex: currentSegmentIdx,
        accuracy,
        correct: passed,
        userText,
        correctText: segment.text,
      }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newResult
        return updated
      }
      return [...prev, newResult]
    })

    // Auto advance if passed and not last
    if (passed && currentSegmentIdx < segments.length - 1) {
      setTimeout(() => {
        handleNextAfterPass()
      }, 1500)
    }

    // Show completion
    if (completedSegments + 1 >= segments.length) {
      setIsComplete(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [userText, segments, currentSegmentIdx, completedSegments, handleNextAfterPass])

  const handleSegmentClick = useCallback((idx: number) => {
    const existingResult = dictationResults.find(r => r.segmentIndex === idx)
    
    // If clicking on a completed segment, clear its result to allow retry
    if (existingResult) {
      setDictationResults(prev => prev.filter(r => r.segmentIndex !== idx))
    }
    
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    
    setCurrentSegmentIdx(idx)
    setUserText('')
    setShowResult(false)
    setLastResult(null)
  }, [dictationResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const { navigate: navCtx } = useListeningNavigation()

  const goBack = () => {
    navCtx('bbc-list' as ListeningView)
  }

  // Word count
  const wordCount = userText.split(/\s+/).filter(w => w.length > 0).length

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full border-4 border-[#4F46E5]/20 border-t-[#4F46E5] animate-spin" />
          <p className="text-[#6B7280]">Đang tải bài học...</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (isError || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <p className="text-[#6B7280] mb-4">Không thể tải bài học</p>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-medium"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{
                    y: window.innerHeight + 20,
                    rotate: Math.random() * 720 - 360
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    delay: Math.random() * 0.5
                  }}
                  className={cn(
                    "absolute w-3 h-3 rounded-full",
                    ["bg-[#4F46E5]", "bg-[#22C55E]", "bg-[#F59E0B]", "bg-[#EC4899]"][Math.floor(Math.random() * 4)]
                  )}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #7C3AED 100%)' }}
          >
            <Trophy size={48} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Chúc mừng bạn!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Bạn đã hoàn thành bài nghe
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="rounded-2xl p-4 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{overallAccuracy}%</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Độ chính xác</p>
            </div>
            <div className="rounded-2xl p-4 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-3xl font-bold text-[#22C55E]">+{xpEarned}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>XP nhận được</p>
            </div>
            <div className="rounded-2xl p-4 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-3xl font-bold text-[#F59E0B]">{correctSegments}/{segments.length}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Câu đúng</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={() => {
                setIsComplete(false)
                setCurrentSegmentIdx(0)
                setDictationResults([])
                setUserText('')
                setShowResult(false)
                setLastResult(null)
              }}
              className="w-full py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition-colors"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #7C3AED 100%)',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
              }}
            >
              Luyện tập lại
            </button>
            <button
              onClick={goBack}
              className="w-full py-4 rounded-xl font-semibold border-2 hover:opacity-80 transition-colors"
              style={{
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
                backgroundColor: 'transparent',
              }}
            >
              Chọn bài khác
            </button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ===== LESSON TOP BAR (Auto-hide on scroll) ===== */}
      <LessonTopBar
        title={lesson.title}
        level={lesson.level}
        sourceUrl={lesson.sourceUrl}
        description={metadata?.description ?? undefined}
        duration={lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : undefined}
        currentProgress={completedSegments}
        totalProgress={segments.length}
        xp={xpEarned}
        onBack={goBack}
      />

      {/* ===== MAIN CONTENT ===== */}
      <main className="px-4 py-6 pt-[72px]">
        {/* ===== HERO LEARNING CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl shadow-lg shadow-[#4F46E5]/5 border border-[#E5E7EB] mb-6 max-w-3xl mx-auto"
          style={{
            backgroundImage: lesson.thumbnailUrl ? `url(${lesson.thumbnailUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '280px',
          }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/50 via-[#4F46E5]/50 to-[#7C3AED]/50" />

          {/* Content */}
          <div className="relative p-6">
            {/* Status row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Headphones size={20} className="text-white" />
                <span className="text-sm font-medium text-white">
                  Câu {currentSegmentIdx + 1} / {segments.length}
                </span>
              </div>
              {currentQuestionResult && (
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-semibold",
                    currentQuestionResult.correct
                      ? "bg-white/20 text-white"
                      : "bg-white/20 text-white"
                  )}
                >
                  {currentQuestionResult.accuracy}%
                </span>
              )}
            </div>

            {/* Time range */}
            {currentSegment && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-white">
                  {formatTime(currentSegment.start)}
                </span>
                <div className="flex-1 h-1 bg-white/30 rounded-full mx-2">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    animate={{ width: `${audioProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-2xl font-bold text-white/80">
                  {formatTime(currentSegment.end)}
                </span>
              </div>
            )}

          {/* ===== AUDIO PLAYER ===== */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Replay */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              disabled={!isAudioLoaded}
              className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={18} />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlayPause}
              disabled={!isAudioLoaded}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all",
                isPlaying
                  ? "bg-white text-[#4F46E5] shadow-white/20"
                  : "bg-white text-[#4F46E5] shadow-lg shadow-white/30"
              )}
            >
              {isPlaying ? (
                <Pause size={32} />
              ) : (
                <motion.div
                  animate={isAudioLoaded && !isPlaying ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Play size={32} className="ml-1" />
                </motion.div>
              )}
            </motion.button>

            {/* Skip */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkipSegment}
              disabled={currentSegmentIdx >= segments.length - 1}
              className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward size={18} />
            </motion.button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center justify-center gap-1">
            {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  playbackSpeed === speed
                    ? "bg-white text-[#4F46E5] shadow-md"
                    : "bg-white/20 text-white hover:bg-white/30"
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
          </div>
        </motion.div>

        {/* ===== INPUT SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl shadow-lg p-6 mb-6 max-w-3xl mx-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.05)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nhập những gì bạn nghe được</h2>
          </div>

          <textarea
            ref={textareaRef}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                if (userText.trim()) handleCheckDictation()
              }
            }}
            placeholder="Nghe cẩn thận và nhập vào đây..."
            disabled={showResult}
            className={cn(
              "w-full min-h-[180px] p-4 rounded-2xl border-2 text-base resize-none transition-all outline-none",
              showResult
                ? "text-[var(--text-secondary)]"
                : "focus:ring-4",
              showResult
                ? ""
                : "bg-[var(--bg-secondary)] border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            )}
            style={showResult ? {
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            } : undefined}
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {wordCount} từ
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Ctrl + Enter để kiểm tra
            </span>
          </div>

          {/* Check button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleCheckDictation}
            disabled={!userText.trim() || showResult}
            className={cn(
              "w-full mt-4 py-4 rounded-2xl font-semibold text-lg transition-all shadow-md",
              userText.trim() && !showResult
                ? "text-white hover:shadow-lg"
                : ""
            )}
            style={userText.trim() && !showResult
              ? {
                  background: 'linear-gradient(to right, var(--accent), #7C3AED)',
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                }
              : {
                  backgroundColor: 'var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed',
                }
            }
          >
            Kiểm tra đáp án
          </motion.button>
        </motion.div>

        {/* ===== RESULT PANEL ===== */}
        <AnimatePresence>
          {showResult && lastResult && currentSegment && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="rounded-3xl shadow-lg overflow-hidden mb-6 max-w-3xl mx-auto"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '2px solid',
                borderColor: lastResult.correct ? '#22C55E' : '#F59E0B'
              }}
            >
              {/* Result header */}
              <div
                className="p-6"
                style={{
                  background: lastResult.correct
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
                }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center",
                      lastResult.correct ? "bg-[#22C55E]" : "bg-[#F59E0B]"
                    )}
                  >
                    {lastResult.correct ? (
                      <CheckCircle2 size={28} className="text-white" />
                    ) : (
                      <XCircle size={28} className="text-white" />
                    )}
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold" style={{ color: lastResult.correct ? '#22C55E' : '#F59E0B' }}>
                        {lastResult.accuracy}%
                      </span>
                      {lastResult.correct && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2 py-1 text-xs font-semibold rounded-full"
                          style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }}
                        >
                          Đạt!
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {lastResult.correct
                        ? 'Bạn đã hiểu câu này!'
                        : `Cần đạt ${PASS_THRESHOLD}% để qua câu tiếp theo`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Correct answer */}
              <div className="p-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Đáp án của bạn:</p>
                <p className="text-lg leading-relaxed font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {getMaskedAnswer(currentSegment.text, userText)}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3 mt-4">
                  {!lastResult.correct && (
                    <button
                      onClick={handleRetry}
                      className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <RotateCcw size={16} />
                      Nghe lại
                    </button>
                  )}
                  {lastResult.correct && currentSegmentIdx < segments.length - 1 && (
                    <button
                      onClick={handleNextAfterPass}
                      className="flex-1 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#22C55E' }}
                    >
                      Câu tiếp theo
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {lastResult.correct && currentSegmentIdx === segments.length - 1 && (
                    <div className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
                      <Star size={16} />
                      Hoàn thành!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== SEGMENT NAVIGATION (Compact Grid) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl shadow-lg border p-4 mb-6 max-w-3xl mx-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Bài tập</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                {correctSegments} ✓
              </span>
              <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                {completedSegments - correctSegments} ✗
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {completedSegments}/{segments.length}
              </span>
            </div>
          </div>

          {/* Compact grid with wrap */}
          <div className="flex flex-wrap gap-1.5">
            {segments.map((seg, idx) => {
              const result = dictationResults.find(r => r.segmentIndex === idx)
              const isActive = idx === currentSegmentIdx
              const isCompleted = !!result

              return (
                <motion.button
                  key={seg.id ?? idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSegmentClick(idx)}
                  className={cn(
                    "w-7 h-7 rounded-lg text-xs font-semibold transition-all flex items-center justify-center",
                    isActive && "ring-2 ring-offset-1",
                    isCompleted
                      ? result!.correct
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                      : isActive
                      ? "text-white"
                      : ""
                  )}
                  style={!isActive && !isCompleted ? {
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                  } : isActive ? {
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                  } : undefined}
                >
                  {idx + 1}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ===== EMPTY STATE ===== */}
        {!isAudioLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-full bg-[#4F46E5]/10 flex items-center justify-center mb-4"
            >
              <Headphones size={40} className="text-[#4F46E5]" />
            </motion.div>
            <p className="text-[#6B7280] text-lg">Nhấn Play để bắt đầu</p>
            <p className="text-[#9CA3AF] text-sm mt-2">Nghe và nhập những gì bạn nghe được</p>
          </motion.div>
        )}
      </main>
    </div>
  )
}

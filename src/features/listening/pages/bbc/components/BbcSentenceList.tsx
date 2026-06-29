// ============================================================
// BbcSentenceList — VinaListen
// BBC lesson sentence list component (similar to PracticePage layout)
// Shows sentence navigator on left, practice on right
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, CheckCircle2, XCircle, SkipForward, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../lib/utils'
import type { BbcLesson } from '@/features/listening/types/bbc'

interface Segment {
  id: number
  start: number
  end: number
  text: string
  file?: string
}

interface SegmentResult {
  segmentIndex: number
  accuracy: number
  correct: boolean
}

type SentenceState = 'idle' | 'playing' | 'checking' | 'correct' | 'wrong'

interface BbcSentenceListProps {
  lesson: BbcLesson
  compact?: boolean
}

export function BbcSentenceList({ lesson, compact = false }: BbcSentenceListProps) {
  const segments: Segment[] = (lesson.metadata as Record<string, unknown>)?.dictation_segments as Segment[] ?? []
  const audioUrl: string | null = (lesson.metadata as Record<string, unknown>)?.audio_url as string | null ?? null

  const [currentIdx, setCurrentIdx] = useState(0)
  const [sentenceState, setSentenceState] = useState<SentenceState>('idle')
  const [segmentResults, setSegmentResults] = useState<SegmentResult[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener('loadeddata', () => setIsLoaded(true))
      audioRef.current.addEventListener('ended', handleAudioEnded)
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [audioUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
    if (sentenceState === 'playing') {
      setSentenceState('idle')
    }
  }, [sentenceState])

  const playSegment = useCallback((index: number) => {
    if (!audioRef.current || !isLoaded) return

    const segment = segments[index]
    if (!segment) return

    audioRef.current.currentTime = segment.start
    audioRef.current.playbackRate = playbackSpeed
    audioRef.current.play()
    setIsPlaying(true)
    setSentenceState('playing')
  }, [segments, isLoaded, playbackSpeed])

  const handleSegmentClick = useCallback((index: number) => {
    if (!isLoaded) return

    setCurrentIdx(index)
    setSentenceState('idle')
    playSegment(index)
  }, [isLoaded, playSegment])

  const handlePlayPause = useCallback(() => {
    if (!isLoaded) return

    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      if (sentenceState === 'playing') {
        setSentenceState('idle')
      }
    } else {
      playSegment(currentIdx)
    }
  }, [isPlaying, isLoaded, currentIdx, sentenceState, playSegment])

  const handleReplay = useCallback(() => {
    if (!isLoaded) return
    playSegment(currentIdx)
  }, [isLoaded, currentIdx, playSegment])

  const handleSkip = useCallback(() => {
    const nextIdx = currentIdx + 1
    if (nextIdx < segments.length) {
      setCurrentIdx(nextIdx)
      setSentenceState('idle')
      playSegment(nextIdx)
    }
  }, [currentIdx, segments.length, playSegment])

  const handleMarkCorrect = useCallback(() => {
    setSegmentResults(prev => {
      const existing = prev.findIndex(r => r.segmentIndex === currentIdx)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { segmentIndex: currentIdx, accuracy: 100, correct: true }
        return updated
      }
      return [...prev, { segmentIndex: currentIdx, accuracy: 100, correct: true }]
    })
    setSentenceState('correct')
  }, [currentIdx])

  const handleMarkWrong = useCallback(() => {
    setSegmentResults(prev => {
      const existing = prev.findIndex(r => r.segmentIndex === currentIdx)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { segmentIndex: currentIdx, accuracy: 0, correct: false }
        return updated
      }
      return [...prev, { segmentIndex: currentIdx, accuracy: 0, correct: false }]
    })
    setSentenceState('wrong')
  }, [currentIdx])

  const handleNextSentence = useCallback(() => {
    const nextIdx = currentIdx + 1
    if (nextIdx < segments.length) {
      setCurrentIdx(nextIdx)
      setSentenceState('idle')
      playSegment(nextIdx)
    }
  }, [currentIdx, segments.length, playSegment])

  const handleReset = useCallback(() => {
    audioRef.current?.pause()
    setCurrentIdx(0)
    setSentenceState('idle')
    setIsPlaying(false)
    setSegmentResults([])
  }, [])

  const completedCount = segmentResults.length
  const totalCorrect = segmentResults.filter(r => r.correct).length
  const currentSegment = segments[currentIdx]
  const progress = segments.length > 0 ? Math.round((completedCount / segments.length) * 100) : 0

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const speeds = [0.5, 0.75, 1, 1.25, 1.5]

  // Empty state
  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-gray-300">
        <p className="text-text-muted mb-2">No audio segments available</p>
        <p className="text-xs text-text-muted">This lesson doesn't have audio segments yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#35375B] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
        <span className="text-xs font-medium shrink-0 text-text-muted">
          {completedCount}/{segments.length}
        </span>
      </div>

      {/* Main layout: Sentence navigator + Practice area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sentence Navigator - left panel */}
        <div
          className="lg:w-72 xl:w-80 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--lm-border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--lm-text-primary)' }}>
              Sentences
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--lm-text-muted)' }}>
              {completedCount} of {segments.length} completed
            </p>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: compact ? '200px' : 'clamp(200px, 40vh, 400px)', overscrollBehavior: 'contain' }}
          >
            {segments.map((segment, idx) => {
              const result = segmentResults.find(r => r.segmentIndex === idx)
              const isActive = idx === currentIdx
              const isDone = !!result

              return (
                <button
                  key={segment.id ?? idx}
                  onClick={() => {
                    setCurrentIdx(idx)
                    setSentenceState('idle')
                  }}
                  className="w-full text-left px-4 py-3 border-b transition-all"
                  style={{
                    borderColor: 'var(--lm-border)',
                    background: isActive ? 'var(--lm-surface-raised)' : 'transparent',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isDone
                          ? result!.correct
                            ? '#00BE7C'
                            : '#FF5632'
                          : isActive
                          ? '#35375B'
                          : 'var(--lm-border)',
                      }}
                    >
                      {isDone ? (
                        result!.correct ? (
                          <CheckCircle2 size={12} className="text-white" />
                        ) : (
                          <SkipForward size={10} className="text-white" />
                        )
                      ) : (
                        <span className="text-[10px] font-bold" style={{ color: isActive ? '#fff' : 'var(--lm-text-muted)' }}>
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isDone ? (
                        <>
                          <p className="text-xs leading-snug truncate" style={{ color: 'var(--lm-text-primary)' }}>
                            {segment.text}
                          </p>
                          <span className="text-[10px] font-medium mt-0.5 block" style={{ color: result!.correct ? '#00BE7C' : '#FF5632' }}>
                            {result!.accuracy}%
                          </span>
                        </>
                      ) : isActive ? (
                        <p className="text-xs leading-snug" style={{ color: 'var(--lm-text-secondary)' }}>
                          — listening —
                        </p>
                      ) : (
                        <p className="text-xs leading-snug" style={{ color: 'var(--lm-text-muted)' }}>
                          Sentence {idx + 1}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5 animate-pulse" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Practice Area - right panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Current sentence info */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: '#35375B' }}
                >
                  {currentIdx + 1}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--lm-text-muted)' }}>
                  Sentence {currentIdx + 1} of {segments.length}
                </span>
              </div>
            </div>

            {/* Sentence text - revealed after check */}
            {(sentenceState === 'correct' || sentenceState === 'wrong') && currentSegment && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 px-3 py-2 rounded-xl text-sm"
                style={{
                  background: sentenceState === 'correct'
                    ? 'rgba(0, 190, 124, 0.1)'
                    : 'rgba(255, 86, 50, 0.08)',
                  color: sentenceState === 'correct' ? '#00BE7C' : '#FF5632',
                  borderLeft: `3px solid ${sentenceState === 'correct' ? '#00BE7C' : '#FF5632'}`,
                }}
              >
                {currentSegment.text}
              </motion.div>
            )}
          </div>

          {/* Audio Player */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
          >
            {!isLoaded ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-text-muted" />
              </div>
            ) : (
              <>
                {/* Time display */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-muted">
                    {currentSegment && formatTime(currentSegment.start)} - {currentSegment && formatTime(currentSegment.end)}
                  </span>
                  <span className="text-xs text-text-muted">
                    Duration: {currentSegment && formatTime(currentSegment.end - currentSegment.start)}
                  </span>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1 mb-4">
                  {speeds.map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={cn(
                        "px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                        playbackSpeed === speed
                          ? "bg-[#35375B] text-white"
                          : "bg-gray-100 text-text-muted hover:bg-gray-200"
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button variant="secondary" size="sm" onClick={handleReplay} className="gap-1.5">
                    <RotateCcw size={14} />
                    Replay
                  </Button>

                  <Button size="lg" onClick={handlePlayPause} className="gap-2 w-32">
                    {isPlaying ? (
                      <>
                        <Pause size={18} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        Play
                      </>
                    )}
                  </Button>

                  <Button variant="secondary" size="sm" onClick={handleSkip} className="gap-1.5">
                    <SkipForward size={14} />
                    Skip
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mark buttons */}
          {sentenceState !== 'correct' && sentenceState !== 'wrong' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-center text-text-muted">
                Did you understand this sentence?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleMarkCorrect}
                  className="flex-1 gap-2"
                  style={{ background: '#00BE7C' }}
                >
                  <CheckCircle2 size={16} />
                  I understand
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleMarkWrong}
                  className="flex-1 gap-2"
                  style={{ color: '#FF5632' }}
                >
                  <XCircle size={16} />
                  Need practice
                </Button>
              </div>
            </div>
          )}

          {/* Result + Next */}
          {(sentenceState === 'correct' || sentenceState === 'wrong') && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl" style={{
                background: sentenceState === 'correct' ? 'rgba(0, 190, 124, 0.1)' : 'rgba(255, 86, 50, 0.1)'
              }}>
                {sentenceState === 'correct' ? (
                  <CheckCircle2 size={20} style={{ color: '#00BE7C' }} />
                ) : (
                  <XCircle size={20} style={{ color: '#FF5632' }} />
                )}
                <span style={{ color: sentenceState === 'correct' ? '#00BE7C' : '#FF5632' }}>
                  {sentenceState === 'correct' ? 'Great! You understood this sentence.' : 'Keep practicing!'}
                </span>
              </div>

              <Button
                size="lg"
                onClick={handleNextSentence}
                className="w-full gap-2"
              >
                {currentIdx < segments.length - 1 ? (
                  <>
                    Next Sentence
                    <SkipForward size={16} />
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Finish ({totalCorrect}/{segments.length} correct)
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Summary when all done */}
          {completedCount === segments.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl text-center"
              style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
            >
              <TrophyIcon />
              <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--lm-text-primary)' }}>
                Lesson Complete!
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--lm-text-muted)' }}>
                You got {totalCorrect} out of {segments.length} sentences correct.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="secondary" onClick={handleReset} className="gap-1.5">
                  <RotateCcw size={14} />
                  Practice Again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// Trophy icon component
function TrophyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 17V15M12 15C14.2091 15 16 13.2091 16 11V4H8V11C8 13.2091 9.79086 15 12 15Z" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 5H18C18.5523 5 19 5.44772 19 6V8C19 9.65685 17.6569 11 16 11" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 5H6C5.44772 5 5 5.44772 5 6V8C5 9.65685 6.34315 11 8 11" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 15H15" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 20H14" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// ============================================================
// BbcDictationEmptyState — VinaListen
// Shown when a BBC lesson does not have BBC-provided segments
// (either legacy rows whose text was retired, or newly-crawled rows
// that never had segments). Guides the user to supply their own
// audio + transcript so the dictation experience can still run
// client-side without rehosting BBC content.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, FileAudio, Mic, Play, RotateCcw, Type } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { DictationInput } from './DictationInput'
import { SegmentResults } from './SegmentResults'
import { cn } from '../../../lib/utils'
import type { BbcSegmentScore } from '../../../types/bbc'
import { DictationScoring } from '../../../lib/dictationScoring'

type Phase = 'setup' | 'playing' | 'input' | 'results'

interface BbcDictationEmptyStateProps {
  lessonTitle: string
  lessonSourceUrl: string
  segmentsSource: 'legacy_bbc' | 'user_provided' | 'curated' | 'manual' | null
  onCompleted?: (summary: { segmentsCompleted: number; overallAccuracy: number }) => void
}

interface LocalSegment {
  index: number
  text: string
  startTime: number
  endTime: number
  wordCount: number
}

const SEGMENT_TARGET_WORDS = 8

/**
 * Splits a transcript string into ~8-word segments. The split points
 * prefer sentence boundaries (period, question mark, exclamation) so the
 * resulting segments feel natural to listen to.
 */
function splitTranscript(text: string, targetWords = SEGMENT_TARGET_WORDS): LocalSegment[] {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) {
    return []
  }

  // First split into sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean)
  const segments: LocalSegment[] = []
  let buffer: string[] = []
  let bufferWords = 0
  let cursor = 0

  const flush = () => {
    if (buffer.length === 0) {
      return
    }
    const text = buffer.join(' ').trim()
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const startTime = cursor
    const endTime = startTime + Math.max(1, Math.ceil(wordCount / 2.5))
    segments.push({
      index: segments.length,
      text,
      startTime,
      endTime,
      wordCount,
    })
    cursor = endTime
    buffer = []
    bufferWords = 0
  }

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean)
    if (bufferWords + words.length > targetWords && bufferWords > 0) {
      flush()
    }
    buffer.push(sentence)
    bufferWords += words.length
  }
  flush()

  return segments
}

export function BbcDictationEmptyState({
  lessonTitle,
  lessonSourceUrl,
  segmentsSource,
  onCompleted,
}: BbcDictationEmptyStateProps) {
  const [transcript, setTranscript] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('setup')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [score, setScore] = useState<BbcSegmentScore | null>(null)
  const [attempts, setAttempts] = useState<BbcSegmentScore[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const segments = useMemo(() => splitTranscript(transcript), [transcript])
  const currentSegment = segments[currentIndex]
  const isLastSegment = currentIndex >= segments.length - 1

  const isLegacy = segmentsSource === 'legacy_bbc'

  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl)
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [audioUrl])

  const handleAudioFile = useCallback((file: File) => {
    setError(null)
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl)
    }
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    setAudioFileName(file.name)
  }, [audioUrl])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleAudioFile(file)
      }
    },
    [handleAudioFile]
  )

  const playCurrentSegment = useCallback(() => {
    if (!audioRef.current || !currentSegment) {
      return
    }
    const audio = audioRef.current
    audio.currentTime = currentSegment.startTime
    audio.playbackRate = 1
    audio.play().catch(() => {
      setError('Không thể phát audio. Vui lòng thử lại.')
    })
    setIsPlaying(true)
    setPhase('playing')

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    const durationMs = (currentSegment.endTime - currentSegment.startTime) * 1000
    timerRef.current = setTimeout(() => {
      audio.pause()
      setIsPlaying(false)
      setPhase('input')
    }, durationMs)
  }, [currentSegment])

  const handleSubmit = useCallback(() => {
    if (!currentSegment || !userInput.trim()) {
      return
    }
    const result = DictationScoring.scoreSegment(currentSegment.text, userInput)
    setScore(result)
    setAttempts((prev) => {
      const next = [...prev]
      next[currentIndex] = result
      return next
    })
    setPhase('results')
  }, [currentSegment, currentIndex, userInput])

  const handleNext = useCallback(() => {
    if (!isLastSegment) {
      setCurrentIndex((i) => i + 1)
      setUserInput('')
      setScore(null)
      setPhase('setup')
    } else {
      const totalWords = attempts.reduce((s, a) => s + a.totalWords, 0) || 1
      const correct = attempts.reduce((s, a) => s + a.correctCount, 0)
      onCompleted?.({
        segmentsCompleted: attempts.length,
        overallAccuracy: Math.round((correct / totalWords) * 100 * 10) / 10,
      })
      setPhase('setup')
      setCurrentIndex(0)
      setUserInput('')
      setScore(null)
      setAttempts([])
    }
  }, [attempts, isLastSegment, onCompleted])

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setCurrentIndex(0)
    setUserInput('')
    setScore(null)
    setAttempts([])
    setPhase('setup')
  }, [])

  const canStart = transcript.trim().length > 0 && audioUrl !== null && segments.length > 0

  return (
    <div className="flex flex-col gap-4">
      {isLegacy && (
        <div
          className="flex items-start gap-2 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900"
          role="status"
        >
          <ExternalLink size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="font-semibold">BBC content đã được thu hồi.</strong>{' '}
            Theo chính sách nội dung của chúng tôi, các transcript BBC đã crawl trước đây
            không còn được lưu trên máy chủ. Để luyện tập dictation cho bài này, bạn vui
            lòng tải audio từ BBC và dán transcript của bạn vào ô bên dưới.
          </div>
        </div>
      )}

      {phase === 'setup' && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{lessonTitle}</h2>
            <p className="text-sm text-gray-500">
              Cung cấp audio và transcript để bắt đầu luyện tập. DriveSmart không lưu
              trữ nội dung bạn cung cấp — mọi thứ xử lý trên trình duyệt của bạn.
            </p>
          </div>

          {/* Step 1: Open BBC */}
          <Step
            number={1}
            icon={<ExternalLink size={16} />}
            title="Mở bài học BBC"
          >
            <p className="text-sm text-gray-600">
              Tải audio từ BBC cho mục đích sử dụng cá nhân.
            </p>
            <a
              href={lessonSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#35375B] underline hover:no-underline"
            >
              Mở BBC gốc
              <ExternalLink size={12} />
            </a>
          </Step>

          {/* Step 2: Upload audio */}
          <Step number={2} icon={<FileAudio size={16} />} title="Tải audio của bạn">
            <p className="text-sm text-gray-600">
              File audio chỉ dùng trong trình duyệt, không upload lên server.
            </p>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-[#35375B] transition-colors text-sm">
              <FileAudio size={14} />
              {audioFileName ?? 'Chọn file audio (.mp3, .m4a)'}
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Tải file audio"
              />
            </label>
          </Step>

          {/* Step 3: Paste transcript */}
          <Step number={3} icon={<Type size={16} />} title="Dán transcript">
            <p className="text-sm text-gray-600">
              Dán nội dung transcript bạn muốn luyện tập. DriveSmart sẽ tự động
              chia thành các đoạn ~8 từ.
            </p>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Dán transcript vào đây..."
              className="w-full min-h-32 p-3 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#35375B]/30"
              aria-label="Transcript"
            />
            {transcript.trim().length > 0 && (
              <p className="text-xs text-gray-500">
                Đã tách thành <strong>{segments.length}</strong> đoạn.
              </p>
            )}
          </Step>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              onClick={() => {
                if (!canStart) {
                  return
                }
                setCurrentIndex(0)
                setPhase('setup')
                setUserInput('')
                setScore(null)
                setAttempts([])
                playCurrentSegment()
              }}
              disabled={!canStart}
              className="w-full gap-2"
            >
              <Play size={18} />
              {canStart
                ? `Bắt đầu (đoạn 1 / ${segments.length})`
                : 'Vui lòng cung cấp audio + transcript'}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Nguồn audio: bạn tự cung cấp. DriveSmart không rehost nội dung BBC.
          </p>
        </div>
      )}

      {(phase === 'playing' || phase === 'input') && currentSegment && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              Đoạn {currentIndex + 1} / {segments.length}
            </span>
            <span>•</span>
            <span>{currentSegment.wordCount} từ</span>
          </div>

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              className="hidden"
              aria-hidden="true"
            />
          )}

          <div className="flex items-center gap-2 p-3 bg-[#35375B]/5 rounded-xl text-[#35375B]">
            <Mic size={18} className="shrink-0" />
            <span className="text-sm font-medium">
              {phase === 'playing' ? 'Đang nghe...' : 'Nhập những gì bạn nghe được.'}
            </span>
            {phase === 'playing' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause()
                  }
                  setIsPlaying(false)
                  setPhase('input')
                }}
                className="ml-auto"
              >
                Dừng
              </Button>
            )}
          </div>

          {phase === 'input' && (
            <DictationInput
              value={userInput}
              onChange={setUserInput}
              onSubmit={handleSubmit}
              disabled={false}
              isLoading={false}
            />
          )}

          <Button variant="ghost" onClick={handleRestart} className="self-start gap-2">
            <RotateCcw size={14} />
            Cài lại
          </Button>
        </div>
      )}

      {phase === 'results' && score && currentSegment && (
        <div className="flex flex-col gap-4">
          <SegmentResults reference={currentSegment.text} score={score} />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleNext} size="lg" className="flex-1 gap-2">
              {isLastSegment ? 'Hoàn thành' : 'Đoạn tiếp'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setScore(null)
                playCurrentSegment()
              }}
              size="lg"
              className="gap-2"
            >
              Nghe lại
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Step({
  number,
  icon,
  title,
  children,
}: {
  number: number
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
            'bg-[#35375B] text-white'
          )}
        >
          {number}
        </span>
        <span className="text-[#35375B]">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="ml-8 flex flex-col gap-2">{children}</div>
    </div>
  )
}

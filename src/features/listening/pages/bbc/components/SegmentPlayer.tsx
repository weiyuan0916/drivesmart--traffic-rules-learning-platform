// ============================================================
// SegmentPlayer — VinaListen
// Audio player with auto-pause timer and speed controls
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, VolumeX, Loader2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { MicroPlaybackSpeed } from '../../../types/bbc'

interface SegmentPlayerProps {
  audioUrl: string | null
  segmentDuration: number
  playbackSpeed: MicroPlaybackSpeed
  isPlaying: boolean
  onAutoPause: () => void
  onPlay?: () => void
  className?: string
}

const SPEED_OPTIONS: MicroPlaybackSpeed[] = [0.75, 1, 1.25]

export function SegmentPlayer({
  audioUrl,
  segmentDuration,
  playbackSpeed,
  isPlaying,
  onAutoPause,
  onPlay,
  className,
}: SegmentPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(playbackSpeed)

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = currentSpeed
    }
    setCurrentSpeed(playbackSpeed)
  }, [playbackSpeed])

  // Auto-pause timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (isPlaying && segmentDuration > 0) {
      const delay = (segmentDuration * 1000) / currentSpeed
      timerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        onAutoPause()
      }, delay)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isPlaying, segmentDuration, currentSpeed, onAutoPause])

  // Play/pause audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    if (isPlaying) {
      audio.playbackRate = currentSpeed
      audio.play().catch(() => {
        setHasError(true)
      })
      onPlay?.()
    } else {
      audio.pause()
    }
  }, [isPlaying, audioUrl, currentSpeed, onPlay])

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  if (!audioUrl) {
    return (
      <div className={cn('flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700', className)}>
        <VolumeX size={20} />
        <span className="text-sm">Không có tệp âm thanh cho bài học này.</span>
        <a
          href="https://www.bbc.co.uk/learningenglish"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-sm underline hover:no-underline"
        >
          Mở BBC audio
        </a>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => { setHasError(true); setIsLoading(false); }}
        aria-label="Audio player"
      />

      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          type="button"
          onClick={() => {
            if (isPlaying) {
              // pause triggered by auto-pause or manual
            }
          }}
          disabled={isLoading || hasError}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full bg-[#35375B] text-white',
            'hover:bg-[#2a2d4a] disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-150',
          )}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={20} />
          ) : (
            <Play size={20} />
          )}
        </button>

        {/* Replay */}
        <button
          type="button"
          onClick={handleReplay}
          disabled={isLoading}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          aria-label="Nghe lại"
        >
          <RotateCcw size={16} />
        </button>

        {/* Speed selector */}
        <div className="ml-auto flex items-center gap-1" role="group" aria-label="Tốc độ phát">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              type="button"
              role="radio"
              aria-checked={currentSpeed === speed}
              onClick={() => {
                setCurrentSpeed(speed)
                if (audioRef.current) audioRef.current.playbackRate = speed
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-150',
                currentSpeed === speed
                  ? 'bg-[#35375B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {speed === 1 ? '1x' : `${speed}x`}
            </button>
          ))}
        </div>
      </div>

      {hasError && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <VolumeX size={12} />
          Không tải được audio. {' '}
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Mở BBC audio
          </a>
        </p>
      )}
    </div>
  )
}

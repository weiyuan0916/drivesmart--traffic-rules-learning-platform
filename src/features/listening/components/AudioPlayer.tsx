// ============================================================
// AudioPlayer — VinaListen
// HTMLAudioElement-based player (MVP — no waveform)
// Phase 2: Canvas waveform visualization
// ============================================================

import { useCallback, useId, memo } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '../lib/utils'
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from '../lib/constants'
import { formatTime } from '../lib/utils'

interface AudioPlayerProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoaded: boolean
  isError: boolean
  playbackRate: PlaybackSpeed
  onTogglePlay: () => void
  onReplay: () => void
  onSeek: (time: number) => void
  onPlaybackRateChange: (rate: PlaybackSpeed) => void
  disabled?: boolean
}

export const AudioPlayer = memo(function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  isLoaded,
  isError,
  playbackRate,
  onTogglePlay,
  onReplay,
  onSeek,
  onPlaybackRateChange,
  disabled = false,
}: AudioPlayerProps) {
  const progressId = useId()
  const speedGroupId = useId()

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = (Number(e.target.value) / 100) * duration
      onSeek(newTime)
    },
    [duration, onSeek],
  )

  return (
    <div
      className="flex flex-col gap-4"
      role="region"
      aria-label="Audio player"
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={disabled || !isLoaded || isError}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={cn(
            'shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            'bg-primary text-white transition-colors duration-150',
            'hover:bg-primary-dark active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          {isPlaying ? (
            <Pause size={20} aria-hidden="true" />
          ) : (
            <Play size={20} className="ml-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Progress track */}
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            id={progressId}
            type="range"
            min={0}
            max={100}
            value={progressPercent}
            onChange={handleSeekChange}
            disabled={disabled || !isLoaded}
            aria-label="Seek audio position"
            className={cn(
              'w-full h-1.5 rounded-full appearance-none cursor-pointer',
              'bg-light accent-primary',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              // Track
              '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full',
              '[&::-webkit-slider-runnable-track]:bg-light',
              // Thumb
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
              '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100',
              '[&::-webkit-slider-thumb]:hover:scale-125',
              '[&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5',
              '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary',
              '[&::-moz-range-thumb]:border-0',
            )}
          />
          {/* Time display */}
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span aria-label="Current time">{formatTime(Math.floor(currentTime))}</span>
            <span aria-label="Duration">
              {isLoaded ? formatTime(Math.floor(duration)) : '--:--'}
            </span>
          </div>
        </div>

        {/* Replay */}
        <button
          type="button"
          onClick={onReplay}
          disabled={disabled || !isLoaded || isError}
          aria-label="Replay clip"
          className={cn(
            'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            'border border-border text-primary transition-colors duration-150',
            'hover:bg-light active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Speed selector */}
      <div
        role="group"
        aria-labelledby={speedGroupId}
        className="flex items-center gap-1.5"
      >
        <span id={speedGroupId} className="text-xs text-muted-foreground mr-1">
          Speed:
        </span>
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => onPlaybackRateChange(speed)}
            aria-label={`Playback speed ${speed}x`}
            aria-pressed={playbackRate === speed}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150',
              'min-w-[44px] min-h-[36px] flex items-center justify-center',
              playbackRate === speed
                ? 'bg-primary text-white'
                : 'bg-light text-text-secondary hover:bg-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
          >
            {speed === 1 ? '1×' : `${speed}×`}
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <p className="text-sm text-error" role="alert">
          Failed to load audio. Please check your connection.
        </p>
      )}

      {/* Loading state */}
      {!isLoaded && !isError && (
        <p className="text-sm text-muted-foreground">Loading audio...</p>
      )}
    </div>
  )
})

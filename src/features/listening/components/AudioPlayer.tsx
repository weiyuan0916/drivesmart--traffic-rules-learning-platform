// ============================================================
// AudioPlayer — VinaListen
// Premium audio player with glass morphism design
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
      className="flex flex-col gap-5"
      role="region"
      aria-label="Audio player"
    >
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={disabled || !isLoaded || isError}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={cn(
            'shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-primary to-primary-dark text-white',
            'shadow-lg shadow-primary/25',
            'hover:shadow-xl hover:shadow-primary/30 hover:scale-105',
            'active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          {isPlaying ? (
            <Pause size={22} className="md:w-6 md:h-6" aria-hidden="true" />
          ) : (
            <Play size={22} className="ml-0.5 md:w-6 md:h-6" aria-hidden="true" />
          )}
        </button>

        {/* Progress track */}
        <div className="flex-1 flex flex-col gap-2">
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
              'w-full h-2 md:h-2.5 rounded-full appearance-none cursor-pointer',
              'bg-light/50 dark:bg-dark',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              // Track
              '[&::-webkit-slider-runnable-track]:h-2 md:[&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-full',
              '[&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-primary/20 [&::-webkit-slider-runnable-track]:to-primary/20',
              '[&::-moz-range-track]:h-2 md:[&::-moz-range-track]:h-2.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-dark/30',
              // Thumb
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-5 md:[&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
              '[&::-webkit-slider-thumb]:-mt-[6px] md:[&::-webkit-slider-thumb]:-mt-[8px]',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100',
              '[&::-webkit-slider-thumb]:hover:scale-125',
              '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-5 md:[&::-moz-range-thumb]:h-5',
              '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white',
            )}
          />
          {/* Time display */}
          <div className="flex justify-between text-sm text-text-muted tabular-nums px-1">
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
            'shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center',
            'bg-bg-tertiary dark:bg-dark-surface',
            'border border-border dark:border-border-strong',
            'text-text-secondary dark:text-text-secondary',
            'hover:bg-bg-hover dark:hover:bg-dark',
            'hover:border-primary dark:hover:border-primary',
            'active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          <RotateCcw size={20} className="md:w-5 md:h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Speed selector */}
      <div
        role="group"
        aria-labelledby={speedGroupId}
        className="flex items-center justify-center gap-1.5"
      >
        <span id={speedGroupId} className="text-sm text-text-muted mr-2">
          Tốc độ:
        </span>
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => onPlaybackRateChange(speed)}
            aria-label={`Playback speed ${speed}x`}
            aria-pressed={playbackRate === speed}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              'min-w-[48px] min-h-[44px] flex items-center justify-center',
              playbackRate === speed
                ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/20'
                : 'bg-bg-tertiary dark:bg-dark-surface text-text-secondary hover:bg-bg-hover dark:hover:bg-dark border border-border dark:border-border-strong',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
          >
            {speed === 1 ? '1×' : `${speed}×`}
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <p className="text-sm text-error text-center" role="alert">
          Không thể tải audio. Vui lòng kiểm tra kết nối.
        </p>
      )}

      {/* Loading state */}
      {!isLoaded && !isError && (
        <p className="text-sm text-text-muted text-center">Đang tải audio...</p>
      )}
    </div>
  )
})

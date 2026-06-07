// ============================================================
// useAudioPlayer — VinaListen
// HTMLAudioElement-based audio player hook for MVP (no waveform)
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react'
import { useLessonStore } from '../stores/lessonStore'
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from '../lib/constants'

interface UseAudioPlayerOptions {
  src: string
  onClipEnd?: () => void
  autoPlay?: boolean
}

export function useAudioPlayer({ src, onClipEnd, autoPlay = false }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState<PlaybackSpeed>(1)

  // Sync playbackRate from persisted store value on mount
  useEffect(() => {
    const stored = localStorage.getItem('vinalisten-playback-rate')
    if (stored) {
      const rate = Number(stored) as PlaybackSpeed
      if (PLAYBACK_SPEEDS.includes(rate)) {
        setPlaybackRateState(rate)
        if (audioRef.current) {
          audioRef.current.playbackRate = rate
        }
      }
    }
  }, [])

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoaded(true)
      setIsError(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onClipEnd?.()
    }

    const handleError = () => {
      setIsError(true)
      setIsLoaded(false)
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
    }
  }, [onClipEnd])

  // Update src when clip changes
  useEffect(() => {
    if (!audioRef.current) return
    setIsLoaded(false)
    setIsError(false)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    audioRef.current.src = src
    audioRef.current.load()
    if (autoPlay) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked — user must interact first
      })
      setIsPlaying(true)
    }
  }, [src, autoPlay])

  const play = useCallback(async () => {
    if (!audioRef.current || isError) return
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      // Playback blocked
    }
  }, [isError])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const replay = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {
      // Blocked
    })
    setIsPlaying(true)
  }, [])

  const seek = useCallback((time: number) => {
    if (!audioRef.current || !isLoaded) return
    audioRef.current.currentTime = Math.max(0, Math.min(time, duration))
    setCurrentTime(audioRef.current.currentTime)
  }, [duration, isLoaded])

  const setPlaybackRate = useCallback((rate: PlaybackSpeed) => {
    if (!audioRef.current) return
    audioRef.current.playbackRate = rate
    setPlaybackRateState(rate)
    localStorage.setItem('vinalisten-playback-rate', String(rate))
  }, [])

  return {
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    isError,
    playbackRate,
    play,
    pause,
    togglePlayPause,
    replay,
    seek,
    setPlaybackRate,
  }
}

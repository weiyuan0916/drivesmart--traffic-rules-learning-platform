// ============================================================
// BbcSentencePractice — VinaListen
// BBC lesson sentence practice component
// Displays all sentences with auto-play functionality
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, CheckCircle2, Circle, Loader2 } from 'lucide-react'
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

interface BbcSentencePracticeProps {
  lesson: BbcLesson
  onBack?: () => void
}

export function BbcSentencePractice({ lesson, onBack }: BbcSentencePracticeProps) {
  const segments: Segment[] = (lesson.metadata as Record<string, unknown>)?.dictation_segments as Segment[] ?? []
  const audioUrl: string | null = (lesson.metadata as Record<string, unknown>)?.audio_url as string | null ?? null
  
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(new Set())
  const [autoPlay, setAutoPlay] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  
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
      audioContextRef.current?.close()
    }
  }, [audioUrl])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioContextRef.current?.close()
    }
  }, [])
  
  const handleAudioEnded = useCallback(() => {
    if (currentIndex !== null && autoPlay) {
      // Mark current as completed
      setCompletedSegments(prev => new Set([...prev, currentIndex]))
      
      // Play next segment
      const nextIndex = currentIndex + 1
      if (nextIndex < segments.length) {
        setCurrentIndex(nextIndex)
        playSegment(nextIndex)
      } else {
        setIsPlaying(false)
        setCurrentIndex(null)
      }
    } else {
      setIsPlaying(false)
    }
  }, [currentIndex, autoPlay, segments.length])
  
  const playSegment = useCallback((index: number) => {
    if (!audioRef.current || !isLoaded) return
    
    const segment = segments[index]
    if (!segment) return
    
    audioRef.current.currentTime = segment.start
    audioRef.current.play()
    setIsPlaying(true)
  }, [segments, isLoaded])
  
  const handleSegmentClick = useCallback((index: number) => {
    if (!isLoaded) return
    
    if (currentIndex === index && isPlaying) {
      // Pause
      audioRef.current?.pause()
      setIsPlaying(false)
    } else if (currentIndex === index) {
      // Resume
      audioRef.current?.play()
      setIsPlaying(true)
    } else {
      // Play new segment
      setCurrentIndex(index)
      playSegment(index)
    }
  }, [currentIndex, isPlaying, isLoaded, playSegment])
  
  const handlePlayAll = useCallback(() => {
    if (!isLoaded || segments.length === 0) return
    
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      // Start from beginning or resume
      if (currentIndex === null) {
        setCurrentIndex(0)
        playSegment(0)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    }
  }, [isPlaying, currentIndex, isLoaded, segments.length, playSegment])
  
  const handleReplay = useCallback(() => {
    if (currentIndex !== null) {
      playSegment(currentIndex)
    }
  }, [currentIndex, playSegment])
  
  const handleReset = useCallback(() => {
    audioRef.current?.pause()
    setCurrentIndex(null)
    setIsPlaying(false)
    setCompletedSegments(new Set())
  }, [])
  
  const completedCount = completedSegments.size
  const progress = segments.length > 0 ? Math.round((completedCount / segments.length) * 100) : 0
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-bg-secondary">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <h2 className="font-semibold text-text-primary">{lesson.title}</h2>
            <p className="text-xs text-text-muted">{segments.length} sentences</p>
          </div>
        </div>
        
        {/* Auto-play toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-text-muted">Auto play</span>
          <div 
            className={cn(
              "w-10 h-6 rounded-full transition-colors relative",
              autoPlay ? "bg-[#35375B]" : "bg-gray-300"
            )}
            onClick={() => setAutoPlay(!autoPlay)}
          >
            <div 
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                autoPlay ? "translate-x-5" : "translate-x-1"
              )}
            />
          </div>
        </label>
      </div>
      
      {/* Progress bar */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>Progress</span>
          <span>{completedCount} / {segments.length} ({progress}%)</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#35375B] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Sentence list */}
      <div className="flex-1 overflow-y-auto">
        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-text-muted mb-2">No audio segments available</p>
            <p className="text-xs text-text-muted">This lesson doesn't have audio segments yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {segments.map((segment, index) => {
              const isActive = currentIndex === index
              const isCompleted = completedSegments.has(index)
              const isPastCompleted = index < currentIndex && !completedSegments.has(index)
              
              return (
                <motion.div
                  key={segment.id ?? index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                    isActive ? "bg-[#35375B]/5" : "hover:bg-gray-50",
                    isPastCompleted && !isCompleted && "opacity-60"
                  )}
                  onClick={() => handleSegmentClick(index)}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : isActive && isPlaying ? (
                      <Pause size={18} className="text-[#35375B]" />
                    ) : (
                      <Circle size={18} className="text-gray-300" />
                    )}
                  </div>
                  
                  {/* Index */}
                  <span className={cn(
                    "flex-shrink-0 w-6 text-xs font-medium",
                    isActive ? "text-[#35375B]" : "text-text-muted"
                  )}>
                    {index + 1}
                  </span>
                  
                  {/* Play button */}
                  <button 
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      isActive 
                        ? "bg-[#35375B] text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSegmentClick(index)
                    }}
                  >
                    {isActive && isPlaying ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} className="ml-0.5" />
                    )}
                  </button>
                  
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-relaxed truncate",
                      isActive ? "text-[#35375B] font-medium" : "text-text-primary"
                    )}>
                      {segment.text}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatTime(segment.start)} - {formatTime(segment.end)}
                    </p>
                  </div>
                  
                  {/* Duration */}
                  <span className="flex-shrink-0 text-xs text-text-muted">
                    {formatTime(segment.end - segment.start)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 border-t border-border bg-bg-secondary">
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleReset}
            className="gap-1.5"
          >
            <RotateCcw size={14} />
            Reset
          </Button>
          
          <Button 
            size="lg" 
            onClick={handlePlayAll}
            disabled={!isLoaded || segments.length === 0}
            className="gap-2 flex-1 max-w-xs"
          >
            {!isLoaded ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} />
            )}
            {isPlaying ? 'Pause All' : currentIndex !== null ? 'Resume' : 'Play All'}
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleReplay}
            disabled={currentIndex === null}
            className="gap-1.5"
          >
            <RotateCcw size={14} />
            Replay
          </Button>
        </div>
        
        {/* Current playing info */}
        <AnimatePresence>
          {currentIndex !== null && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-border"
            >
              <p className="text-xs text-text-muted text-center">
                Now playing: <span className="text-[#35375B] font-medium">Sentence {currentIndex + 1}</span>
                {isPlaying && ' • '}
                {isPlaying && (
                  <span className="text-[#FF5632]">Playing...</span>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, RotateCcw, CheckCircle, XCircle, SkipForward, Bookmark,
  ChevronRight, Volume2, Star, Trophy, ChevronDown, Check,
} from 'lucide-react';
import type { ListeningLessonDetail, Challenge, DictationResult } from '@/types/listening';
import { checkDictation, getWordStatusColor } from '@/services/dictationService';
import { recordCompletedLesson, addBookmark, isLessonBookmarked } from '@/services/listeningProgressService';
import { getClipsUrl } from '@/services/listeningApi';
import { useGlobalAudio } from '@/features/listening/hooks/useGlobalAudio.tsx';

interface PracticePageProps {
  lesson: ListeningLessonDetail;
  onBack: () => void;
}

type SentenceState = 'idle' | 'playing' | 'checking' | 'correct' | 'wrong' | 'completed';

interface SentenceResult {
  challengeId: number;
  accuracy: number;
  correct: boolean;
  skipped: boolean;
  wordResults: DictationResult['wordResults'];
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;

export default function PracticePage({ lesson, onBack }: PracticePageProps) {
  const challenges = lesson.challenges;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [sentenceState, setSentenceState] = useState<SentenceState>('idle');
  const [result, setResult] = useState<DictationResult | null>(null);
  const [sentenceResults, setSentenceResults] = useState<SentenceResult[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [speed, setSpeed] = useState<typeof SPEEDS[number]>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [replayCount, setReplayCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTime = useRef(Date.now());
  const pendingPlayRef = useRef(false);
  const sentenceStateRef = useRef<SentenceState>('idle');
  const clipInfoRef = useRef<{ timeStart: number; timeEnd: number } | null>(null);
  const replayCountRef = useRef(0);

  const { registerAudio, pauseAllOthers } = useGlobalAudio();
  const controllerRef = useRef<{ pause: () => void; play: () => Promise<void>; setSrc: (src: string) => void } | null>(null);

  const currentChallenge = challenges[currentIdx];
  const totalSentences = challenges.length;
  const completedCount = sentenceResults.length;
  const lessonCompleted = completedCount === totalSentences;

  const completedIds = useMemo(() => new Set(sentenceResults.map((r) => r.challengeId)), [sentenceResults]);

  useEffect(() => {
    setIsBookmarked(isLessonBookmarked(lesson.id));
  }, [lesson.id]);

  // Keep sentenceStateRef in sync with sentenceState
  useEffect(() => {
    sentenceStateRef.current = sentenceState;
  }, [sentenceState]);

  // Reload audio when challenge changes
  useEffect(() => {
    if (!currentChallenge) return;
    setAudioReady(false);
    setAudioError(false);
    setIsPlaying(false);
    setAudioProgress(0);
    replayCountRef.current = 0;
    setReplayCount(0);
    clipInfoRef.current = null;

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = '';
    audio.load();

    // Create controller for global audio manager
    const controller = {
      pause: () => audio.pause(),
      play: () => audio.play(),
      setSrc: (newSrc: string) => { audio.src = newSrc; audio.load(); },
    };

    controllerRef.current = controller;

    // Register with global audio manager
    const unregister = registerAudio(controller);

    // Priority 1: Local sliced clip (already on disk)
    if (currentChallenge.localClipPath) {
      audio.src = getClipsUrl(currentChallenge.id);
      audio.load();
      // No time clipping needed - it's already the exact clip
      clipInfoRef.current = null;
      return;
    }

    // Priority 2: CDN clip URL
    if (currentChallenge.audioSrc) {
      audio.src = currentChallenge.audioSrc;
      audio.load();
      if (currentChallenge.timeStart && currentChallenge.timeEnd) {
        clipInfoRef.current = {
          timeStart: parseFloat(currentChallenge.timeStart),
          timeEnd: parseFloat(currentChallenge.timeEnd),
        };
      }
      return;
    }

    // Priority 3: Local full audio (no clip, frontend slices by time)
    const fullSrc = `/api/listening/audio/${lesson.id}`;
    audio.src = fullSrc;
    audio.load();
    if (currentChallenge.timeStart && currentChallenge.timeEnd) {
      clipInfoRef.current = {
        timeStart: parseFloat(currentChallenge.timeStart),
        timeEnd: parseFloat(currentChallenge.timeEnd),
      };
    }

    return () => {
      unregister();
    };
  }, [currentChallenge?.id, lesson.id, registerAudio]);

  // Sync speed on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const getWordClass = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'wrong': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'missing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 line-through opacity-60';
      case 'extra': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return '';
    }
  };

  const handleAudioCanPlay = useCallback(() => {
    setAudioReady(true);

    if (pendingPlayRef.current) {
      pendingPlayRef.current = false;
      const audio = audioRef.current;
      if (!audio) return;
      audio.playbackRate = speed;
      // Pause all other audio before auto-playing
      pauseAllOthers(controllerRef.current ?? undefined);
      audio.play().catch((err) => {
        console.warn('Play failed on canplay:', err);
        setIsPlaying(false);
        setSentenceState((prev) => (prev === 'playing' ? 'idle' : prev));
      });
      setIsPlaying(true);
      setSentenceState('playing');
    }
  }, [speed, pauseAllOthers]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setSentenceState((prev) => (prev === 'playing' ? 'idle' : prev));

    // Loop replay: if user requested repeated playback, replay again
    if (replayCountRef.current > 1) {
      replayCountRef.current -= 1;
      setReplayCount(replayCountRef.current);
      const audio = audioRef.current;
      if (!audio) return;
      const clipInfo = clipInfoRef.current;
      if (clipInfo && clipInfo.timeStart > 0) {
        audio.currentTime = clipInfo.timeStart;
      } else {
        audio.currentTime = 0;
      }
      audio.playbackRate = speed;
      audio.play().catch((err) => {
        console.warn('Replay loop failed:', err);
        replayCountRef.current = 0;
        setReplayCount(0);
        setIsPlaying(false);
        setSentenceState((prev) => (prev === 'playing' ? 'idle' : prev));
      });
      setIsPlaying(true);
      setSentenceState('playing');
    } else {
      replayCountRef.current = 0;
      setReplayCount(0);
    }
  }, [speed]);

  const handleAudioError = useCallback(() => {
    setAudioError(true);
    setAudioReady(true);
    setIsPlaying(false);
    setSentenceState('idle');
  }, []);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    // Reset replay loop when user manually starts playback
    replayCountRef.current = 0;
    setReplayCount(0);

    const clipInfo = clipInfoRef.current;
    if (clipInfo && clipInfo.timeStart > 0) {
      audio.currentTime = clipInfo.timeStart;
    }
    audio.playbackRate = speed;

    if (audioReady) {
      // Pause all other audio before playing
      pauseAllOthers(controllerRef.current ?? undefined);
      audio.play().catch((err) => {
        console.warn('Play failed:', err);
        setIsPlaying(false);
        setSentenceState((prev) => (prev === 'playing' ? 'idle' : prev));
      });
      setIsPlaying(true);
      setSentenceState('playing');
    } else {
      pendingPlayRef.current = true;
    }
  }, [speed, audioError, audioReady, pauseAllOthers]);

  const handlePause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setSentenceState((prev) => (prev === 'playing' ? 'idle' : prev));
  }, []);

  const handleReplay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audioError) return;
    const clipInfo = clipInfoRef.current;
    if (clipInfo && clipInfo.timeStart > 0) {
      audio.currentTime = clipInfo.timeStart;
    }
    audio.playbackRate = speed;
    // Pause all other audio before replaying
    pauseAllOthers(controllerRef.current ?? undefined);
    // Set replay count: play the clip 3 times total, then stop
    replayCountRef.current = 3;
    setReplayCount(3);
    audio.play().catch((err) => {
      console.warn('Replay failed:', err);
      setIsPlaying(false);
      setSentenceState((prev) => (prev === 'playing' ? 'idle' : prev));
    });
    setIsPlaying(true);
    setSentenceState('playing');
  }, [speed, audioError, pauseAllOthers]);

  const handleSpeedChange = useCallback((s: typeof SPEEDS[number]) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }, []);

  const handleCheck = useCallback(() => {
    if (!userInput.trim() || !currentChallenge) return;

    const res = checkDictation(currentChallenge.content, userInput);
    setResult(res);
    setSentenceState('checking');

    const isCorrect = res.accuracy >= 80;

    if (isCorrect) {
      setSentenceState('correct');
      setSentenceResults((prev) => [
        ...prev,
        {
          challengeId: currentChallenge.id,
          accuracy: res.accuracy,
          correct: true,
          skipped: false,
          wordResults: res.wordResults,
        },
      ]);
    } else {
      setSentenceState('wrong');
    }

    audioRef.current?.pause();
    setIsPlaying(false);
  }, [userInput, currentChallenge]);

  const handleNextSentence = useCallback(() => {
    if (currentIdx < totalSentences - 1) {
      setCurrentIdx((i) => i + 1);
      setUserInput('');
      setResult(null);
      setSentenceState('idle');
      setShowHint(false);
      setIsPlaying(false);
      setAudioError(false);
      setAudioReady(false);
      pendingPlayRef.current = true;
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // All sentences done
      const totalDuration = Math.floor((Date.now() - startTime.current) / 1000);
      const avgAccuracy =
        sentenceResults.reduce((sum, r) => sum + r.accuracy, 0) /
        (sentenceResults.length + 1);

      recordCompletedLesson(
        {
          lessonId: lesson.id,
          lessonName: lesson.name,
          topicName: lesson.topic?.name || '',
          topicSlug: lesson.topic?.slug || '',
          score: Math.round(avgAccuracy),
          accuracy: Math.round(avgAccuracy),
          completedAt: new Date().toISOString(),
          durationSeconds: totalDuration,
        },
        totalDuration,
      );

      setSentenceState('completed');
    }
  }, [currentIdx, totalSentences, sentenceResults, lesson]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setUserInput('');
    setSentenceState('idle');
    setShowHint(false);
    setAudioProgress(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSkip = useCallback(() => {
    if (!currentChallenge) return;
    setSentenceResults((prev) => [
      ...prev,
      {
        challengeId: currentChallenge.id,
        accuracy: 0,
        correct: false,
        skipped: true,
        wordResults: [],
      },
    ]);
    if (currentIdx < totalSentences - 1) {
      setCurrentIdx((i) => i + 1);
      setUserInput('');
      setResult(null);
      setSentenceState('idle');
      setShowHint(false);
      setIsPlaying(false);
      setAudioError(false);
      setAudioReady(false);
      setAudioProgress(0);
      pendingPlayRef.current = true;
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSentenceState('completed');
    }
  }, [currentChallenge, currentIdx, totalSentences]);

  const handleBookmark = useCallback(() => {
    addBookmark({
      id: `${lesson.id}-${Date.now()}`,
      type: 'lesson',
      lessonId: lesson.id,
      lessonName: lesson.name,
      topicSlug: lesson.topic?.slug,
      createdAt: new Date().toISOString(),
    });
    setIsBookmarked(true);
  }, [lesson]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        if ((e.ctrlKey || e.metaKey) && e.code === 'Enter') {
          e.preventDefault();
          if (sentenceState === 'idle' || sentenceState === 'playing') {
            handleCheck();
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyR') {
          e.preventDefault();
          handleReplay();
        }
      } else {
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyR') {
          e.preventDefault();
          handleReplay();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sentenceState, handleReplay, handleCheck]);

  // Completed screen
  if (sentenceState === 'completed') {
    const totalCorrect = sentenceResults.filter((r) => r.correct).length;
    const avgAccuracy = sentenceResults.length > 0
      ? Math.round(sentenceResults.reduce((s, r) => s + r.accuracy, 0) / sentenceResults.length)
      : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10 space-y-4"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00BE7C, #00A06A)' }}
          >
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black" style={{ color: 'var(--lm-text-primary)' }}>
            Lesson Complete!
          </h2>
          <p className="text-sm" style={{ color: 'var(--lm-text-secondary)' }}>
            {lesson.name}
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-4">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}>
              <div className="text-2xl font-black" style={{ color: '#35375B' }}>{avgAccuracy}%</div>
              <div className="text-xs mt-1" style={{ color: 'var(--lm-text-muted)' }}>Accuracy</div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}>
              <div className="text-2xl font-black" style={{ color: '#00BE7C' }}>{totalCorrect}/{totalSentences}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--lm-text-muted)' }}>Correct</div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}>
              <div className="text-2xl font-black" style={{ color: '#FF5632' }}>
                {sentenceResults.filter((r) => r.skipped).length}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--lm-text-muted)' }}>Skipped</div>
            </div>
          </div>
        </motion.div>

        {/* Sentence list with results */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--lm-text-secondary)' }}>
            Review Your Answers
          </h3>
          {sentenceResults.map((sr, i) => {
            const ch = challenges.find((c) => c.id === sr.challengeId);
            if (!ch) return null;
            return (
              <div
                key={sr.challengeId}
                className="p-3 rounded-xl"
                style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
              >
                <div className="flex items-start gap-2">
                  {sr.correct ? (
                    <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                  ) : sr.skipped ? (
                    <SkipForward size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {sr.skipped ? (
                      <p className="text-sm font-medium" style={{ color: 'var(--lm-text-muted)', fontStyle: 'italic' }}>
                        — skipped —
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium" style={{ color: 'var(--lm-text-primary)' }}>
                          {ch.content}
                        </p>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {sr.wordResults.map((wr, wi) => (
                            <span
                              key={wi}
                              className={`text-xs px-1.5 py-0.5 rounded font-medium ${getWordClass(wr.status)}`}
                            >
                              {wr.word}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: sr.correct ? '#00BE7C' : '#FF5632' }}>
                    {sr.accuracy}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--lm-surface-raised)', color: 'var(--lm-text-secondary)' }}
          >
            <RotateCcw size={16} />
            Retry Lesson
          </button>
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: '#35375B' }}
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.round((completedCount / totalSentences) * 100);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <audio
        ref={audioRef}
        onCanPlay={handleAudioCanPlay}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio) return;
          const clipInfo = clipInfoRef.current;
          if (clipInfo && clipInfo.timeEnd > 0) {
            const start = clipInfo.timeStart;
            const end = clipInfo.timeEnd;
            const progress = Math.min(100, Math.max(0, ((audio.currentTime - start) / (end - start)) * 100));
            setAudioProgress(progress);
            if (audio.currentTime >= end) {
              audio.pause();
              setIsPlaying(false);
              setAudioProgress(100);
              if (sentenceStateRef.current === 'playing') {
                setSentenceState('idle');
              }
            }
          } else {
            const duration = audio.duration;
            if (duration > 0) {
              const progress = Math.min(100, Math.max(0, (audio.currentTime / duration) * 100));
              setAudioProgress(progress);
            }
          }
        }}
      />

      {/* Header bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm truncate" style={{ color: 'var(--lm-text-primary)' }}>
              {lesson.name}
            </h2>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: '#EEEDFB', color: '#35375B' }}
            >
              {lesson.vocabLevel}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--lm-border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#35375B' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs font-medium shrink-0" style={{ color: 'var(--lm-text-muted)' }}>
              {completedCount}/{totalSentences}
            </span>
          </div>
        </div>
        <button
          onClick={handleBookmark}
          className="p-2 rounded-lg transition-colors shrink-0"
          style={{
            background: isBookmarked ? '#EEEDFB' : 'transparent',
            color: isBookmarked ? '#35375B' : 'var(--lm-text-muted)',
          }}
          aria-label="Bookmark"
        >
          <Bookmark size={18} fill={isBookmarked ? '#35375B' : 'none'} />
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 max-w-5xl mx-auto">
        {/* ── Mobile: Sentences first, then practice area below ── */}
        {/* ── Desktop: Sentences left panel + practice area right ── */}

        {/* Sentence Navigator — top on mobile, left panel on desktop */}
        <div
          className="order-2 lg:order-1 lg:w-72 xl:w-80 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--lm-border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--lm-text-primary)' }}>
              Sentences
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--lm-text-muted)' }}>
              {completedCount} of {totalSentences} completed
            </p>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'clamp(200px, 40vh, 400px)', overscrollBehavior: 'contain' }}
          >
            {challenges.map((ch, idx) => {
              const sr = sentenceResults.find((r) => r.challengeId === ch.id);
              const isActive = idx === currentIdx;
              const isDone = !!sr;
              const isCorrect = sr?.correct;

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    if (idx <= currentIdx || completedIds.has(ch.id)) {
                      setCurrentIdx(idx);
                      setUserInput('');
                      setResult(null);
                      setSentenceState('idle');
                      setShowHint(false);
                      setIsPlaying(false);
                      setAudioError(false);
                    }
                  }}
                  className="w-full text-left px-4 py-3 border-b transition-all"
                  style={{
                    borderColor: 'var(--lm-border)',
                    background: isActive
                      ? 'var(--lm-surface-raised)'
                      : 'transparent',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isDone
                          ? isCorrect
                            ? '#00BE7C'
                            : '#FF5632'
                          : isActive
                          ? '#35375B'
                          : 'var(--lm-border)',
                      }}
                    >
                      {isDone ? (
                        isCorrect ? (
                          <CheckCircle size={12} className="text-white" />
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
                      {isDone && !sr.skipped ? (
                        <>
                          <p
                            className="text-xs leading-snug truncate"
                            style={{ color: 'var(--lm-text-primary)', fontWeight: 400 }}
                          >
                            {ch.content}
                          </p>
                          <span className="text-[10px] font-medium mt-0.5 block" style={{ color: sr.correct ? '#00BE7C' : '#FF5632' }}>
                            {sr.accuracy}%
                          </span>
                        </>
                      ) : isDone && sr.skipped ? (
                        <p className="text-xs leading-snug" style={{ color: 'var(--lm-text-muted)' }}>
                          — skipped —
                        </p>
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
              );
            })}
          </div>
        </div>

        {/* Practice Area — bottom on mobile, right on desktop */}
        <div className="order-1 lg:order-2 flex-1 min-w-0 space-y-4">
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
                  Sentence {currentIdx + 1} of {totalSentences}
                </span>
              </div>
              {currentChallenge.hints.length > 0 && (
                <button
                  onClick={() => setShowHint((h) => !h)}
                  className="text-xs px-3 py-1 rounded-lg font-medium transition-colors"
                  style={{
                    background: showHint ? '#EEEDFB' : 'var(--lm-surface-raised)',
                    color: '#35375B',
                  }}
                >
                  {showHint ? 'Hide hint' : 'Show hint'}
                </button>
              )}
            </div>
            {showHint && currentChallenge.hints.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: '#EEEDFB', color: '#35375B' }}
              >
                {currentChallenge.hints.join(' · ')}
              </motion.div>
            )}

            {/* Sentence text — only revealed after Check */}
            {(sentenceState === 'correct' || sentenceState === 'wrong') && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 px-3 py-2 rounded-xl text-xs font-medium"
                style={{
                  background: sentenceState === 'correct'
                    ? 'rgba(0, 190, 124, 0.1)'
                    : 'rgba(255, 86, 50, 0.08)',
                  color: sentenceState === 'correct' ? '#00BE7C' : '#FF5632',
                  borderLeft: `3px solid ${sentenceState === 'correct' ? '#00BE7C' : '#FF5632'}`,
                }}
              >
                {currentChallenge.content}
              </motion.div>
            )}
          </div>

          {/* Audio Player */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'var(--lm-surface)',
              border: '1px solid var(--lm-border)',
              boxShadow: 'var(--lm-shadow-md)',
            }}
          >
            {!audioReady && !audioError && (
              <div className="text-center py-2 mb-3">
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#35375B', borderTopColor: 'transparent' }} />
                <p className="text-xs mt-2" style={{ color: 'var(--lm-text-muted)' }}>Loading audio...</p>
              </div>
            )}

            {audioError && (
              <div className="text-center py-3 mb-3 rounded-xl" style={{ background: 'var(--lm-surface-raised)' }}>
                <Volume2 size={20} style={{ color: 'var(--lm-text-muted)', margin: '0 auto 6px' }} />
                <p className="text-xs" style={{ color: 'var(--lm-text-secondary)' }}>
                  Audio unavailable for this sentence
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                disabled={audioError}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#35375B', color: '#fff' }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>

              <div className="flex-1">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--lm-border)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      background: '#35375B',
                      width: `${audioProgress}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                    {clipInfoRef.current && clipInfoRef.current.timeStart > 0
                      ? `${Math.floor(clipInfoRef.current.timeStart / 60)}:${String(Math.floor(clipInfoRef.current.timeStart % 60)).padStart(2, '0')}`
                      : '0:00'}
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#35375B' }}>
                    {lesson.vocabLevel} · {clipInfoRef.current && clipInfoRef.current.timeEnd > 0 && clipInfoRef.current.timeStart >= 0
                      ? `${Math.max(1, Math.round(clipInfoRef.current.timeEnd - clipInfoRef.current.timeStart))}s clip`
                      : ''}
                  </span>
                </div>
              </div>

              {/* Speed */}
              <div className="relative" data-speed-dropdown>
                <button
                  onClick={() => setShowSpeedMenu((v) => !v)}
                  className="h-7 px-2.5 rounded-lg text-xs font-semibold outline-none cursor-pointer transition-all duration-150 flex items-center gap-1.5 min-w-[58px] justify-between"
                  style={{
                    background: speed === 1 ? '#35375B' : 'var(--lm-surface-raised)',
                    color: speed === 1 ? '#fff' : 'var(--lm-text-secondary)',
                    border: '1px solid var(--lm-border)',
                  }}
                  aria-label="Playback speed"
                  aria-expanded={showSpeedMenu}
                >
                  <span>{speed}x</span>
                  <ChevronDown
                    size={12}
                    className="transition-transform duration-200"
                    style={{ transform: showSpeedMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {showSpeedMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSpeedMenu(false)}
                    />
                    <div
                      className="absolute right-0 top-full mt-1.5 z-20 rounded-lg overflow-hidden shadow-lg min-w-[80px]"
                      style={{
                        background: 'var(--lm-surface)',
                        border: '1px solid var(--lm-border)',
                      }}
                    >
                      {SPEEDS.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleSpeedChange(s);
                            setShowSpeedMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs font-medium text-left transition-colors flex items-center justify-between"
                          style={{
                            background: speed === s ? 'var(--lm-surface-raised)' : 'transparent',
                            color: speed === s ? '#35375B' : 'var(--lm-text-secondary)',
                          }}
                        >
                          <span>{s}x</span>
                          {speed === s && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Replay */}
              <button
                onClick={handleReplay}
                disabled={audioError}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
                style={{
                  background: replayCount > 0 ? '#35375B' : 'var(--lm-surface-raised)',
                  color: replayCount > 0 ? '#fff' : 'var(--lm-text-secondary)',
                }}
                aria-label="Replay"
              >
                <RotateCcw size={14} />
                {replayCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: '#FF5632', color: '#fff' }}
                  >
                    {replayCount}
                  </span>
                )}
              </button>
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: '1px solid var(--lm-border)' }}>
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--lm-text-muted)' }}>
                <kbd className="px-1 py-0.5 rounded bg-[var(--lm-surface-raised)] font-mono">Ctrl+↵</kbd>
              </span>
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--lm-text-muted)' }}>
                <kbd className="px-1 py-0.5 rounded bg-[var(--lm-surface-raised)] font-mono">Ctrl+R</kbd>
              </span>
            </div>
          </div>

          {/* Dictation Input */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'var(--lm-surface)',
              border: '1px solid var(--lm-border)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm" style={{ color: 'var(--lm-text-primary)' }}>
                {sentenceState === 'correct'
                  ? 'Correct! Well done.'
                  : sentenceState === 'wrong'
                  ? 'Not quite right. Try again?'
                  : 'Your Transcript'}
              </h3>
              <span className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                {userInput.length} chars
              </span>
            </div>

            {sentenceState === 'wrong' && result && (
              <div
                className="mb-3 p-3 rounded-xl text-sm"
                style={{ background: 'var(--lm-surface-raised)' }}
              >
                <div className="flex gap-1 flex-wrap">
                  {result.wordResults.map((wr, wi) => (
                    <span
                      key={wi}
                      className={`inline-block mr-1 mb-1 px-1.5 py-0.5 rounded text-xs font-medium ${getWordClass(wr.status)}`}
                    >
                      {wr.word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={sentenceState === 'correct'}
              placeholder="Type what you hear..."
              className="w-full h-32 p-4 rounded-xl text-sm resize-none outline-none transition-all disabled:opacity-60"
              style={{
                background: 'var(--lm-surface-raised)',
                color: 'var(--lm-text-primary)',
                border: '1px solid var(--lm-border)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  if (sentenceState === 'idle' || sentenceState === 'playing' || sentenceState === 'wrong') {
                    handleCheck();
                  }
                }
              }}
            />

            <div className="flex gap-2 mt-3">
              {(sentenceState === 'idle' || sentenceState === 'playing' || sentenceState === 'wrong') && (
                <button
                  onClick={handleCheck}
                  disabled={!userInput.trim() || !audioReady}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#FF5632' }}
                >
                  <CheckCircle size={16} />
                  Check (Ctrl+Enter)
                </button>
              )}
              {sentenceState === 'wrong' && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: 'var(--lm-surface-raised)', color: 'var(--lm-text-secondary)' }}
                >
                  <RotateCcw size={16} />
                </button>
              )}
              {sentenceState === 'correct' && (
                <button
                  onClick={handleNextSentence}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: '#00BE7C' }}
                >
                  {currentIdx < totalSentences - 1 ? (
                    <>
                      Next Sentence
                      <ChevronRight size={16} />
                    </>
                  ) : (
                    <>
                      <Star size={16} />
                      Finish Lesson
                    </>
                  )}
                </button>
              )}
            </div>

            {sentenceState !== 'correct' && (
              <button
                onClick={handleSkip}
                className="w-full mt-2 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ color: 'var(--lm-text-muted)', background: 'transparent' }}
              >
                Skip this sentence
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

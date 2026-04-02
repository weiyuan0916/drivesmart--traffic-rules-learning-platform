import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronUp, Clock, Bookmark, LayoutGrid, PanelsLeftRight, X as XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import type { ChapterStat, Question } from '../types';
import { EXAM_CHAPTERS_ORDERED } from '../services/examGenerator';
import LanguageSwitcher from './LanguageSwitcher';

interface MainContentProps {
  onBack?: () => void;
  questions: Question[];
  confirmedAnswers: (string | null)[];
  onConfirmedAnswersChange: (answers: (string | null)[]) => void;
  onCurrentQuestionNumberChange?: (n: number) => void;
  onRestartExam?: () => void;
  onExamStatsComputed?: (stats: ChapterStat[]) => void;
  collapsedSidebar: boolean;
  onToggleCollapse: () => void;
}

type ExamScore = {
  correct: number;
  incorrect: number;
  criticalWrong: number;
  pass: boolean;
};

const EXAM_DURATION_SECONDS = 20 * 60;
const LAST_MINUTES_WARNING_SECONDS = 3 * 60;
const STUCK_THRESHOLD_MS = 120 * 1000; // 2 minutes
const AUTO_ADVANCE_DELAY_MS = 600;

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

const MainContent: React.FC<MainContentProps> = ({
  onBack,
  questions,
  confirmedAnswers,
  onConfirmedAnswersChange,
  onCurrentQuestionNumberChange,
  onRestartExam,
  onExamStatsComputed,
  collapsedSidebar,
  onToggleCollapse,
}) => {
  const { t } = useLanguage();
  const totalQuestions = questions.length;

  const examStartedAtRef = useRef<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [questionNavExpanded, setQuestionNavExpanded] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [examScore, setExamScore] = useState<ExamScore | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(EXAM_DURATION_SECONDS);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isStuck, setIsStuck] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const currentIndex = currentQuestionNumber - 1;
  const question = questions[currentIndex];

  // ── Reset on new exam ──
  useEffect(() => {
    examStartedAtRef.current = Date.now();
    setTimeLeftSeconds(EXAM_DURATION_SECONDS);
    setCurrentQuestionNumber(1);
    setQuestionNavExpanded(false);
    setSelectedOption(null);
    setExamFinished(false);
    setExamScore(null);
    setQuestionStartTime(Date.now());
    setIsStuck(false);
  }, [questions]);

  // ── Timer ──
  useEffect(() => {
    if (examFinished) return;
    const tick = () => {
      const elapsedSeconds = (Date.now() - examStartedAtRef.current) / 1000;
      const remaining = EXAM_DURATION_SECONDS - elapsedSeconds;
      if (remaining <= 0) {
        setTimeLeftSeconds(0);
        return;
      }
      setTimeLeftSeconds(Math.ceil(remaining));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [examFinished]);

  // ── Stuck detection ──
  useEffect(() => {
    if (examFinished || selectedOption) {
      setIsStuck(false);
      return;
    }
    const elapsed = Date.now() - questionStartTime;
    setIsStuck(elapsed > STUCK_THRESHOLD_MS);
  }, [examFinished, selectedOption, questionStartTime, currentQuestionNumber]);

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (examFinished) return;
      const key = e.key.toLowerCase();

      // Option selection: 1-4 or a-d
      if (['1', '2', '3', '4'].includes(key) && confirmedAnswers[currentIndex] == null && timeLeftSeconds > 0) {
        e.preventDefault();
        const idx = parseInt(key, 10) - 1;
        if (question.options[idx]) {
          setSelectedOption(question.options[idx].id);
          setQuestionStartTime(Date.now());
          setIsStuck(false);
        }
      } else if (['a', 'b', 'c', 'd'].includes(key) && confirmedAnswers[currentIndex] == null && timeLeftSeconds > 0) {
        e.preventDefault();
        const id = key.toUpperCase();
        if (question.options.find((o) => o.id === id)) {
          setSelectedOption(id);
          setQuestionStartTime(Date.now());
          setIsStuck(false);
        }
      } else if (key === 'arrowleft' || key === 'arrowup') {
        e.preventDefault();
        setCurrentQuestionNumber((n) => Math.max(1, n - 1));
        setQuestionStartTime(Date.now());
        setIsStuck(false);
      } else if (key === 'arrowright' || key === 'arrowdown') {
        e.preventDefault();
        setCurrentQuestionNumber((n) => Math.min(totalQuestions, n + 1));
        setQuestionStartTime(Date.now());
        setIsStuck(false);
      } else if (key === 'enter' || key === ' ') {
        e.preventDefault();
        if (!confirmedAnswers[currentIndex] && selectedOption && timeLeftSeconds > 0) {
          // Confirm
          const next = [...confirmedAnswers];
          next[currentIndex] = selectedOption;
          onConfirmedAnswersChange(next);
          setConfirming(true);
          setTimeout(() => setConfirming(false), AUTO_ADVANCE_DELAY_MS);
        } else if (currentQuestionNumber < totalQuestions) {
          setCurrentQuestionNumber((n) => Math.min(totalQuestions, n + 1));
          setQuestionStartTime(Date.now());
          setIsStuck(false);
        } else {
          submitExam();
        }
      }
    },
    [
      examFinished,
      question,
      selectedOption,
      timeLeftSeconds,
      currentIndex,
      confirmedAnswers,
      onConfirmedAnswersChange,
      currentQuestionNumber,
      totalQuestions,
    ],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Sync selected with confirmed ──
  useEffect(() => {
    const confirmed = confirmedAnswers[currentIndex];
    if (confirmed) setSelectedOption(confirmed);
    else setSelectedOption(null);
  }, [currentIndex, confirmedAnswers]);

  useEffect(() => {
    onCurrentQuestionNumberChange?.(currentQuestionNumber);
  }, [currentQuestionNumber, onCurrentQuestionNumberChange]);

  const currentConfirmedAnswer = confirmedAnswers[currentIndex];
  const showResult = currentConfirmedAnswer !== null && currentConfirmedAnswer !== undefined;
  const correctOptionId = question?.correctAnswer;

  // ── Timer visuals ──
  const timeLabel = useMemo(() => formatMmSs(timeLeftSeconds), [timeLeftSeconds]);
  const isLastMinutes = timeLeftSeconds > 0 && timeLeftSeconds <= LAST_MINUTES_WARNING_SECONDS;
  const isUnderFiveMin = timeLeftSeconds > 0 && timeLeftSeconds <= 5 * 60;
  const isUnderOneMin = timeLeftSeconds > 0 && timeLeftSeconds <= 60;

  const timeBadgeClass = isUnderOneMin
    ? 'bg-rose-500/15 border border-rose-500/40 text-rose-500'
    : isLastMinutes
      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500'
      : 'bg-blue-500/10 border border-blue-500/20 text-blue-500';

  // ── Progress bar ──
  const progressSegments = useMemo(() => {
    const segments: { color: string; width: string }[] = [];
    const pctPerQ = 100 / totalQuestions;
    for (let i = 0; i < totalQuestions; i += 1) {
      const a = confirmedAnswers[i];
      const q = questions[i];
      const isAnswered = a !== null && a !== undefined;
      const isCorrect = isAnswered && q ? a === q.correctAnswer : false;
      const isCurrent = i === currentIndex;

      let color = '#64748B'; // gray = unanswered
      if (isAnswered) {
        color = isCorrect ? '#22C55E' : '#EF4444';
      } else if (isCurrent) {
        color = '#3B82F6'; // blue = current
      } else if (selectedOption && i === currentIndex) {
        color = '#3B82F6';
      }

      segments.push({
        color,
        width: `${pctPerQ}%`,
      });
    }
    return segments;
  }, [confirmedAnswers, questions, currentIndex, selectedOption, totalQuestions]);

  const answeredCount = confirmedAnswers.filter((a) => a !== null).length;

  // ── Option classes ──
  const getOptionStyle = (optionId: string) => {
    const isSelected = selectedOption === optionId;
    const isConfirmedSelected = currentConfirmedAnswer === optionId;
    const isCorrectOption = optionId === correctOptionId;

    let bg = 'bg-[var(--bg-tertiary)]';
    let border = 'border-[var(--border)]';
    let iconBg = 'bg-[var(--bg-hover)]';
    let iconText = 'text-[var(--text-secondary)]';
    let textCls = 'text-[var(--text-secondary)]';
    let shadow = '';
    let scale = 1;
    const showIcon: 'check' | 'x' | null = null;

    if (showResult) {
      if (isCorrectOption) {
        bg = 'bg-emerald-500';
        border = 'border-emerald-400';
        iconBg = 'bg-white/30';
        iconText = 'text-white';
        textCls = 'text-white';
        shadow = 'shadow-lg shadow-emerald-500/25';
      } else if (isConfirmedSelected && !isCorrectOption) {
        bg = 'bg-rose-500';
        border = 'border-rose-400';
        iconBg = 'bg-white/30';
        iconText = 'text-white';
        textCls = 'text-white';
        shadow = 'shadow-lg shadow-rose-500/25';
      }
    } else if (isSelected) {
      bg = 'bg-blue-500/10';
      border = 'border-blue-500/50';
      iconBg = 'bg-blue-500';
      iconText = 'text-white';
      textCls = 'text-[var(--text-primary)]';
      shadow = 'shadow-md shadow-blue-500/15';
      scale = 1.01;
    }

    return {
      className: `w-full rounded-2xl flex items-start gap-3 text-left transition-all duration-200 border ${bg} ${border} ${shadow} min-h-0 overflow-hidden cursor-pointer select-none`,
      iconBg,
      iconText,
      textCls,
      scale,
      showResultIcon: showResult ? (isCorrectOption ? 'check' : isConfirmedSelected && !isCorrectOption ? 'x' : null) : null,
    };
  };

  const handleOptionClick = (optionId: string) => {
    if (examFinished) return;
    if (timeLeftSeconds <= 0) return;
    if (showResult) return;
    setSelectedOption(optionId);
    setQuestionStartTime(Date.now());
    setIsStuck(false);
  };

  const confirmCurrentAnswer = () => {
    if (examFinished) return;
    if (timeLeftSeconds <= 0) return;
    if (!question) return;
    if (!selectedOption) return;
    const next = [...confirmedAnswers];
    next[currentIndex] = selectedOption;
    onConfirmedAnswersChange(next);
    setConfirming(true);
    setTimeout(() => setConfirming(false), AUTO_ADVANCE_DELAY_MS);
  };

  const gotoNextQuestion = () => {
    setQuestionNavExpanded(false);
    setCurrentQuestionNumber((n) => Math.min(totalQuestions, n + 1));
    setQuestionStartTime(Date.now());
    setIsStuck(false);
  };

  const submitExam = () => {
    if (!questions.length) return;
    const answersForScore = [...confirmedAnswers];
    if (answersForScore[currentIndex] == null && selectedOption) {
      answersForScore[currentIndex] = selectedOption;
    }

    let correct = 0;
    let incorrect = 0;
    let criticalWrong = 0;
    const chapterMap = new Map<number, { correct: number; total: number }>();

    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      const selected = answersForScore[i];
      const ok = selected === q.correctAnswer;

      const entry = chapterMap.get(q.chapterNumber) ?? { correct: 0, total: 0 };
      entry.total += 1;
      if (ok) {
        entry.correct += 1;
        correct += 1;
      } else {
        incorrect += 1;
      }
      chapterMap.set(q.chapterNumber, entry);

      if (q.isCritical && !ok) criticalWrong += 1;
    }

    const pass = criticalWrong === 0;
    setExamScore({ correct, incorrect, criticalWrong, pass });
    setExamFinished(true);

    if (onExamStatsComputed) {
      const chapterStats: ChapterStat[] = EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }) => {
        const value = chapterMap.get(chapterNumber) ?? { correct: 0, total: 0 };
        return {
          chapterNumber,
          chapter: title,
          correct: value.correct,
          total: value.total,
        };
      });
      onExamStatsComputed(chapterStats);
    }
  };

  useEffect(() => {
    if (examFinished) return;
    if (timeLeftSeconds > 0) return;
    submitExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftSeconds, examFinished]);

  useEffect(() => {
    if (examFinished) return;
    if (!confirmedAnswers.length) return;
    const allConfirmed = confirmedAnswers.every((a) => a !== null);
    if (allConfirmed) submitExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedAnswers, examFinished]);

  const numberBadgeClass = (num: number): string => {
    const idx = num - 1;
    const q = questions[idx];
    const a = confirmedAnswers[idx];
    const isAnswered = a !== null && a !== undefined;
    const isCorrect = isAnswered && q ? a === q.correctAnswer : false;
    if (!isAnswered) {
      return num === currentQuestionNumber
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]';
    }
    if (isCorrect) {
      return num === currentQuestionNumber
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
        : 'bg-emerald-500 text-white';
    }
    return num === currentQuestionNumber
      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
      : 'bg-rose-500 text-white';
  };

  // ── Loading ──
  if (!questions.length) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  // ── Exam finished ──
  if (examFinished && examScore) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-xl"
        >
          <div className="text-center space-y-4">
            <div
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 font-black tracking-wide ${
                examScore.pass ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
              }`}
            >
              {examScore.pass ? 'ĐẠT' : 'KHÔNG ĐẠT'}
            </div>
            <div className="space-y-1 text-[var(--text-primary)]">
              <div className="text-sm sm:text-base">
                Đúng: <span className="font-bold">{examScore.correct}</span> / {totalQuestions}
              </div>
              <div className="text-sm sm:text-base">
                Sai: <span className="font-bold">{examScore.incorrect}</span> / {totalQuestions}
              </div>
              <div className="text-sm sm:text-base">
                Câu nghiêm trọng sai: <span className="font-bold">{examScore.criticalWrong}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onRestartExam}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 px-4 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-900/35 transition-colors hover:from-emerald-500 hover:to-green-600"
            >
              Làm lại
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden" tabIndex={0}>
      {/* ══════════ DESKTOP TOP BAR ══════════ */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2 shrink-0 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-baseline gap-1">
            <h1 className="text-[var(--text-primary)] font-bold text-sm">
              {t('question')} {currentQuestionNumber}
            </h1>
            <span className="text-[var(--text-secondary)] text-xs">/{totalQuestions}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer with pulse animation */}
          <motion.div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeBadgeClass}`}
            animate={
              isUnderOneMin
                ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.8 } }
                : isLastMinutes
                  ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                  : isUnderFiveMin
                    ? { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 2 } }
                    : {}
            }
          >
            <Clock className={`w-3.5 h-3.5 ${isUnderOneMin ? 'text-rose-500' : isLastMinutes ? 'text-amber-500' : 'text-blue-500'}`} />
            <span className="font-mono font-bold text-xs tabular-nums">{timeLabel}</span>
          </motion.div>
          <button className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            title={collapsedSidebar ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          >
            <PanelsLeftRight className="w-4 h-4" />
          </button>
          <LanguageSwitcher variant="menu" className="relative flex items-center" />
        </div>
      </div>

      {/* ══════════ PROGRESS BAR ══════════ */}
      <div className="hidden lg:block shrink-0">
        <div className="flex h-0.5 w-full bg-[var(--bg-hover)]">
          {progressSegments.map((seg, i) => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{ width: seg.width, backgroundColor: seg.color }}
            />
          ))}
        </div>
        <div className="px-4 py-0.5 flex items-center justify-between">
          <span className="text-[10px] text-[var(--text-secondary)] font-medium">
            {answeredCount}/{totalQuestions} đã trả lời
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {Math.round((answeredCount / totalQuestions) * 100)}%
          </span>
        </div>
      </div>

      {/* ══════════ MOBILE HEADER ══════════ */}
      <div className="lg:hidden sticky top-0 z-30 w-full bg-[var(--bg-secondary)] border-b border-[var(--border)] shadow-sm shrink-0">
        <div className="grid grid-cols-[minmax(0,auto)_1fr_minmax(0,auto)] items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 min-h-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-1 text-[var(--text-primary)] shrink-0 min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl active:bg-[var(--bg-hover)]"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h1 className="text-[var(--text-primary)] font-bold text-sm sm:text-xl text-center truncate min-w-0 leading-tight">
            Exam
          </h1>
          <div className="flex items-center justify-end shrink-0">
            <LanguageSwitcher variant="menu" className="relative flex items-center justify-end" />
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="flex h-1 w-full bg-[var(--bg-hover)]">
          {progressSegments.map((seg, i) => (
            <div key={i} className="transition-all duration-300" style={{ width: seg.width, backgroundColor: seg.color }} />
          ))}
        </div>

        <div className="px-4 sm:px-6 pb-2 pt-1">
          <div className="flex gap-2 items-start sm:hidden">
            <button
              type="button"
              onClick={() => setQuestionNavExpanded((e) => !e)}
              aria-expanded={questionNavExpanded}
              className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm transition-colors active:bg-[var(--bg-hover)]"
            >
              {questionNavExpanded ? <ChevronUp className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
            </button>
            <div className="min-w-0 flex-1 grid grid-cols-5 gap-2 max-h-[min(14rem,48vh)] overflow-y-auto overscroll-contain pr-1">
              {(questionNavExpanded
                ? Array.from({ length: totalQuestions }, (_, i) => i + 1)
                : currentQuestionNumber <= 10
                  ? Array.from({ length: Math.min(10, totalQuestions) }, (_, i) => i + 1)
                  : Array.from({ length: Math.min(10, totalQuestions) }, (_, i) => Math.min(totalQuestions, i + 11))
              ).map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => { setCurrentQuestionNumber(num); setQuestionNavExpanded(false); }}
                  className={`size-[26px] justify-self-center rounded-md flex items-center justify-center text-sm font-bold leading-none transition-all active:bg-[var(--bg-hover)] ${numberBadgeClass(num)}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 w-full scrollbar-visible">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setCurrentQuestionNumber(num)}
                className={`size-[26px] rounded-full flex items-center justify-center text-sm font-bold leading-none shrink-0 transition-all ${numberBadgeClass(num)}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ DESKTOP: Image + Question ══════════ */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-[42%_1fr] min-h-0 w-full gap-3 p-3 xl:p-4">
          {/* Image — hero */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${currentQuestionNumber}`}
              className="relative rounded-2xl overflow-hidden bg-[var(--bg-tertiary)] shadow-md border border-[var(--border)] flex items-center justify-center min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Chapter badge */}
              <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {question.chapter}
              </div>

              {question.image ? (
                <motion.img
                  src={question.image}
                  alt="Traffic Situation"
                  className="max-h-full max-w-full w-auto h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full min-h-32 bg-[var(--bg-hover)] flex items-center justify-center">
                  <span className="text-[var(--text-muted)] text-sm">Không có ảnh</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Question text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`q-${currentQuestionNumber}`}
              className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border)] px-4 py-3 overflow-y-auto min-h-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="bg-blue-500/15 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  Q{currentQuestionNumber}
                </span>
                {question.isCritical && (
                  <span className="bg-rose-500/15 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Nghiêm trọng
                  </span>
                )}
              </div>
              <p className="text-[var(--text-primary)] text-sm xl:text-base font-bold leading-relaxed">
                {question.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════ DESKTOP: Options + Actions ══════════ */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden px-3 xl:px-4 pb-3 xl:pb-4 gap-3 flex-col relative">
        {/* ── Options grid (full remaining height) ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`options-${currentQuestionNumber}`}
            className="flex-1 min-h-0 grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {question.options.map((option, idx) => {
              const style = getOptionStyle(option.id);

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={showResult}
                  className={style.className}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 mt-3 ml-3 transition-all duration-200 ${style.iconBg} ${style.iconText}`}>
                    {style.showResultIcon === 'check' ? (
                      <Check className="w-5 h-5" />
                    ) : style.showResultIcon === 'x' ? (
                      <XIcon className="w-5 h-5" />
                    ) : (
                      option.id
                    )}
                  </div>
                  <div className="min-h-0 py-3 pr-3 overflow-y-auto flex-1">
                    <p className={`text-sm font-bold leading-snug ${style.textCls}`}>{option.text}</p>
                  </div>
                  {!showResult && (
                    <kbd className="hidden xl:flex shrink-0 self-start mt-3 mr-3 bg-[var(--bg-hover)] text-[var(--text-muted)] text-[10px] font-mono font-bold rounded-md w-5 h-5 items-center justify-center border border-[var(--border)]">
                      {idx + 1}
                    </kbd>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ── Stuck hint (absolute, above buttons) ── */}
        {!showResult && isStuck && (
          <div className="absolute bottom-16 left-0 right-0 px-2 z-20">
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-between gap-3">
              <span className="text-amber-600 text-xs font-medium">Bạn cần hỗ trợ? Hãy chọn một đáp án hoặc bỏ qua câu này.</span>
              <button
                type="button"
                onClick={() => { setIsStuck(false); setQuestionStartTime(Date.now()); }}
                className="text-amber-600 text-xs font-bold hover:text-amber-700"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}

        {/* ── Explanation drawer (slides up over options) ── */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              className="absolute bottom-16 left-0 right-0 px-2 z-20"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md p-3 rounded-xl border border-[var(--border)] shadow-lg max-h-[calc(26vh-5rem)] overflow-y-auto">
                <div className="flex items-start gap-2">
                  <div className="text-[var(--text-primary)] font-bold text-xs shrink-0">{t('explanation')}</div>
                  <div className="min-w-0">
                    <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
                      {question.explanation}
                    </div>
                    {question.isCritical ? (
                      <div className="text-rose-500 font-bold text-xs mt-1.5">Câu hỏi nghiêm trọng</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action buttons (always at bottom) ── */}
        <div className="flex items-center gap-2 shrink-0 relative z-30">
          <motion.button
            type="button"
            onClick={confirmCurrentAnswer}
            disabled={showResult || !selectedOption || timeLeftSeconds <= 0}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 relative overflow-hidden"
            whileTap={!showResult && selectedOption ? { scale: 0.97 } : {}}
          >
            {confirming && (
              <motion.div
                className="absolute inset-0 bg-emerald-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: AUTO_ADVANCE_DELAY_MS / 1000, ease: 'easeInOut' }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {confirming ? <Check className="w-4 h-4" /> : null}
              {t('confirmAnswer')}
              <kbd className="hidden xl:inline bg-white/20 text-white text-[10px] font-mono font-bold rounded px-1.5 py-0.5">⏎</kbd>
            </span>
          </motion.button>
          {currentQuestionNumber < totalQuestions ? (
            <motion.button
              type="button"
              onClick={gotoNextQuestion}
              className="flex-1 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm border border-[var(--border)] flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              {t('nextQuestion')}
              <kbd className="hidden xl:inline bg-[var(--bg-hover)] text-[var(--text-muted)] text-[10px] font-mono font-bold rounded px-1.5 py-0.5">→</kbd>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={submitExam}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-emerald-600/20"
              whileTap={{ scale: 0.97 }}
            >
              {t('finishTest')}
            </motion.button>
          )}
        </div>
      </div>

      {/* ══════════ MOBILE LAYOUT ══════════ */}
      <div className="flex-1 flex flex-col lg:hidden overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-y-auto relative">
          <div className="flex items-center justify-between px-4 py-2 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-[var(--text-primary)] font-bold text-sm">
                {t('question')} {currentQuestionNumber}
              </span>
              <span className="text-[var(--text-secondary)] text-[10px] font-medium">/ {totalQuestions}</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeBadgeClass}`}
                animate={
                  isUnderOneMin
                    ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.8 } }
                    : isLastMinutes
                      ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                      : isUnderFiveMin
                        ? { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 2 } }
                        : {}
                }
              >
                <Clock className={`w-3.5 h-3.5 ${isUnderOneMin ? 'text-rose-500' : isLastMinutes ? 'text-amber-500' : 'text-blue-500'}`} />
                <span className="font-mono font-bold text-xs">{timeLabel}</span>
              </motion.div>
              <button className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden bg-[var(--bg-tertiary)] shadow-md border border-[var(--border)] flex items-center justify-center shrink-0 h-[28vw] max-h-48">
            {question.image ? (
              <img
                src={question.image}
                alt="Traffic Situation"
                className="max-h-full max-w-full w-auto h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full min-h-20 bg-[var(--bg-hover)]" />
            )}
          </div>

          <div className="px-4 py-3 shrink-0">
            <p className="text-[var(--text-primary)] text-sm font-bold leading-relaxed">
              {question.text}
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-2 px-4 overflow-y-auto pb-4">
            {question.options.map((option) => {
              const style = getOptionStyle(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={showResult}
                  className={`w-full p-3 rounded-xl flex items-start gap-3 text-left transition-all duration-200 border ${style.className}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shrink-0 transition-colors ${style.iconBg} ${style.iconText}`}>
                    {style.showResultIcon === 'check' ? (
                      <Check className="w-4 h-4" />
                    ) : style.showResultIcon === 'x' ? (
                      <XIcon className="w-4 h-4" />
                    ) : (
                      option.id
                    )}
                  </div>
                  <p className={`text-sm font-bold leading-snug pt-0.5 ${style.textCls}`}>{option.text}</p>
                </button>
              );
            })}
          </div>

          {/* ── Explanation drawer (slides up over options) ── */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className="absolute bottom-16 left-0 right-0 px-4 z-20"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2 }}
                key={`explanation-${currentQuestionNumber}`}
              >
                <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md p-3 rounded-xl border border-[var(--border)] shadow-lg max-h-32 overflow-y-auto">
                  <div className="flex items-start gap-2">
                    <div className="text-[var(--text-primary)] font-bold text-xs shrink-0">{t('explanation')}</div>
                    <div className="min-w-0">
                      <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
                        {question.explanation}
                      </div>
                      {question.isCritical ? (
                        <div className="text-rose-500 font-bold text-xs mt-1.5">Câu hỏi nghiêm trọng</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action buttons (always pinned to bottom) ── */}
          <div className="px-4 pb-4 pt-2 shrink-0 flex items-center gap-2 relative z-30 bg-[var(--bg-primary)]/90 backdrop-blur-sm">
            <button
              type="button"
              onClick={confirmCurrentAnswer}
              disabled={showResult || !selectedOption || timeLeftSeconds <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:pointer-events-none"
            >
              {t('confirmAnswer')}
            </button>
            {currentQuestionNumber < totalQuestions ? (
              <button
                type="button"
                onClick={gotoNextQuestion}
                className="flex-1 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold px-4 py-2.5 rounded-xl transition-colors text-sm border border-[var(--border)]"
              >
                {t('nextQuestion')}
              </button>
            ) : (
              <button
                type="button"
                onClick={submitExam}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-emerald-600/20"
              >
                {t('finishTest')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;

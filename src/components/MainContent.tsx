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
  examLayout?: 'split' | 'sideBySide';
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
const MOBILE_NAV_COLLAPSED_WINDOW = 20;

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
  examLayout: examLayoutProp,
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
  const questionLayout = examLayoutProp || 'split';

  // Force sideBySide when sidebars are fully collapsed
  const forcedLayout = collapsedSidebar ? 'sideBySide' : questionLayout;

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

    let bg = 'bg-[var(--bg-secondary)]';
    let border = 'border-[var(--border)]';
    let iconBg = 'bg-[var(--bg-tertiary)]';
    let iconText = 'text-[var(--text-secondary)]';
    let textCls = 'text-[var(--text-primary)]';
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
      bg = 'bg-gradient-to-br from-blue-500/10 to-blue-500/5';
      border = 'border-blue-500/50';
      iconBg = 'bg-blue-500';
      iconText = 'text-white';
      textCls = 'text-[var(--text-primary)]';
      shadow = 'shadow-md shadow-blue-500/15';
      scale = 1.01;
    }

    return {
      className: `w-full rounded-2xl flex items-center gap-3 px-3 py-3 text-left transition-all duration-200 border ${bg} ${border} ${shadow} min-h-[3.25rem] cursor-pointer select-none`,
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

  const mobileCollapsedNavNumbers = useMemo(() => {
    const start =
      Math.floor((currentQuestionNumber - 1) / MOBILE_NAV_COLLAPSED_WINDOW) * MOBILE_NAV_COLLAPSED_WINDOW + 1;
    const len = Math.min(MOBILE_NAV_COLLAPSED_WINDOW, Math.max(0, totalQuestions - start + 1));
    return Array.from({ length: len }, (_, i) => start + i);
  }, [currentQuestionNumber, totalQuestions]);

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
          <div className="text-center space-y-5">
            <div
              className={`inline-flex items-center gap-2 justify-center rounded-full px-5 py-2.5 text-lg font-bold ${
                examScore.pass ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
              }`}
            >
              {examScore.pass ? <Check className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
              {examScore.pass ? 'ĐẠT' : 'KHÔNG ĐẠT'}
            </div>
            <div className="space-y-2 text-[var(--text-primary)]">
              <div className="text-base flex items-center justify-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Đúng</span>
                <span className="font-bold text-emerald-600">{examScore.correct}</span>
                <span className="text-sm text-[var(--text-secondary)]">/ {totalQuestions}</span>
              </div>
              <div className="text-base flex items-center justify-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Sai</span>
                <span className="font-bold text-rose-500">{examScore.incorrect}</span>
              </div>
              {examScore.criticalWrong > 0 && (
                <div className="text-sm text-rose-500 font-medium">
                  Câu nghiêm trọng sai: <span className="font-bold">{examScore.criticalWrong}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onRestartExam}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 px-4 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-600/30 transition-all hover:from-emerald-500 hover:to-green-600 active:scale-[0.99]"
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
      <div className="hidden lg:flex items-center justify-between px-5 py-3 shrink-0 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-[var(--text-primary)] font-semibold text-base">
              {t('question')} {currentQuestionNumber}
            </h1>
            <span className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full text-xs font-medium">{totalQuestions}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer with pulse animation */}
          <motion.div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full ${timeBadgeClass}`}
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
            <Clock className={`w-4 h-4 ${isUnderOneMin ? 'text-rose-500' : isLastMinutes ? 'text-amber-500' : 'text-blue-500'}`} />
            <span className="font-mono font-semibold text-sm tabular-nums">{timeLabel}</span>
          </motion.div>
          <button className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-hover)]">
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
        <div className="flex h-1.5 w-full bg-[var(--bg-hover)] rounded-full gap-px px-4 pt-2">
          {progressSegments.map((seg, i) => (
            <div
              key={i}
              className="transition-all duration-300 rounded-sm"
              style={{ width: seg.width, backgroundColor: seg.color }}
            />
          ))}
        </div>
        <div className="px-4 py-1 flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {answeredCount}/{totalQuestions} đã trả lời
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
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

        <div className="px-3 sm:px-6 pb-1.5 sm:pb-2 pt-0.5 sm:pt-1">
          <div className="flex gap-1.5 items-start sm:hidden">
            <button
              type="button"
              onClick={() => setQuestionNavExpanded((e) => !e)}
              aria-expanded={questionNavExpanded}
              className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm transition-colors active:bg-[var(--bg-hover)]"
            >
              {questionNavExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <LayoutGrid className="h-2.5 w-2.5" />}
            </button>
            <div className="min-w-0 flex-1 grid grid-cols-10 gap-x-px gap-y-1 max-h-[min(14rem,48vh)] overflow-y-auto overscroll-contain pr-0.5">
              {(questionNavExpanded
                ? Array.from({ length: totalQuestions }, (_, i) => i + 1)
                : mobileCollapsedNavNumbers
              ).map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => { setCurrentQuestionNumber(num); setQuestionNavExpanded(false); }}
                  className={`w-full min-w-0 aspect-square min-h-0 rounded-md flex items-center justify-center text-[10px] font-bold leading-none transition-all active:bg-[var(--bg-hover)] ${numberBadgeClass(num)}`}
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

      {/* ══════════ DESKTOP SPLIT LAYOUT ══════════ */}
      {forcedLayout === 'split' ? (
        <>
          {/* Image + Question + Explanation — split: ảnh 50% trên, câu hỏi 50% dưới */}
          <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden px-4 xl:px-5 pt-3 xl:pt-4 pb-2">
            <div className="w-full flex flex-col gap-3 h-full min-h-0">
              <div className="flex flex-col flex-1 min-h-0 gap-3">
                {/* Câu hỏi — một nửa chiều cao trên */}
                <div className="flex-1 min-h-0 basis-0 flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3 xl:p-4 shadow-sm">
                  <div className="flex items-start gap-2 mb-2 shrink-0 flex-wrap">
                    <span className="bg-blue-500/10 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                      Q{currentQuestionNumber}
                    </span>
                    {question.isCritical && (
                      <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                        Nghiêm trọng
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    <p className="text-[var(--text-primary)] text-base xl:text-lg font-semibold leading-relaxed">
                      {question.text}
                    </p>
                  </div>
                </div>
                {/* Ảnh — một nửa chiều cao dưới */}
                <div className="flex-1 min-h-0 basis-0 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-tertiary)] shadow-md flex items-center justify-center relative">
                  <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {question.chapter}
                  </div>
                  <AnimatePresence mode="wait">
                    {question.image ? (
                      <motion.img
                        key={`img-${currentQuestionNumber}`}
                        src={question.image}
                        alt="Traffic Situation"
                        className="max-h-full max-w-full w-auto h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[4rem] flex items-center justify-center" key={`no-img-${currentQuestionNumber}`}>
                        <span className="text-[var(--text-muted)] text-sm">Không có ảnh</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Explanation card — shows after confirming */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 bg-gradient-to-r from-blue-500/8 to-emerald-500/8 border border-blue-500/20 rounded-xl px-4 py-3 overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        currentConfirmedAnswer === correctOptionId
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}>
                        {currentConfirmedAnswer === correctOptionId ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <XIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Giải thích</p>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3">
                          {question.explanation}
                        </p>
                        {question.isCritical && (
                          <p className="text-rose-500 text-xs font-semibold mt-1.5">Câu hỏi nghiêm trọng — Sai = trượt</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Options */}
          <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden px-4 xl:px-5 pb-3 xl:pb-4 gap-3 flex-col relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`options-${currentQuestionNumber}`}
                className="flex-1 min-h-0 grid grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {question.options.map((option, idx) => {
                  const style = getOptionStyle(option.id);
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      disabled={showResult}
                      className={style.className}
                      whileHover={!showResult && option.id !== selectedOption ? { scale: 1.01 } : {}}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: 0.04 * idx }}
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-base shrink-0 transition-all duration-200 ${style.iconBg} ${style.iconText}`}>
                        {style.showResultIcon === 'check' ? (
                          <Check className="w-5 h-5" />
                        ) : style.showResultIcon === 'x' ? (
                          <XIcon className="w-5 h-5" />
                        ) : (
                          option.id
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-y-auto max-h-28 self-center">
                        <p className={`text-[0.9375rem] font-medium leading-relaxed ${style.textCls}`}>{option.text}</p>
                      </div>
                      {!showResult && (
                        <kbd className="hidden xl:flex shrink-0 self-center bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-[9px] font-mono font-semibold rounded-md w-5 h-5 items-center justify-center border border-[var(--border)]">
                          {idx + 1}
                        </kbd>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        <>
          {/* ══════════ DESKTOP SIDE-BY-SIDE LAYOUT ══════════ */}
          <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden px-4 xl:px-5 pt-3 xl:pt-4 pb-2">
            <div className="w-full flex gap-3 h-full">
              {/* Left: ảnh 50% trên + câu hỏi 50% dưới */}
              <div className="w-1/2 flex flex-col gap-3 min-h-0 overflow-hidden">
                <div className="flex flex-col flex-1 min-h-0 gap-3">
                  {/* Image — một nửa chiều cao trên */}
                  <div className="flex-1 min-h-0 basis-0 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-tertiary)] shadow-md flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                      {question.image ? (
                        <motion.img
                          key={`img-${currentQuestionNumber}`}
                          src={question.image}
                          alt="Traffic Situation"
                          className="max-h-full max-w-full w-auto h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[4rem] flex items-center justify-center" key={`no-img-${currentQuestionNumber}`}>
                          <span className="text-[var(--text-muted)] text-sm">Không có ảnh</span>
                        </div>
                      )}
                    </AnimatePresence>
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {question.chapter}
                    </div>
                  </div>
                  {/* Question — một nửa chiều cao dưới */}
                  <div className="flex-1 min-h-0 basis-0 flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3 xl:p-4 shadow-sm">
                    <div className="flex items-start gap-2 mb-2 shrink-0 flex-wrap">
                      <span className="bg-blue-500/10 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                        Q{currentQuestionNumber}
                      </span>
                      {question.isCritical && (
                        <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                          Nghiêm trọng
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <p className="text-[var(--text-primary)] text-sm xl:text-base font-semibold leading-relaxed">
                        {question.text}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Explanation — inline below question */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 bg-gradient-to-r from-blue-500/8 to-emerald-500/8 border border-blue-500/20 rounded-xl px-4 py-3 overflow-hidden"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          currentConfirmedAnswer === correctOptionId
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}>
                          {currentConfirmedAnswer === correctOptionId ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <XIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-0.5">Giải thích</p>
                          <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-2">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Options */}
              <div className="w-1/2 flex flex-col h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`options-${currentQuestionNumber}`}
                    className="flex flex-col flex-1 min-h-0 gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {(() => {
                      const n = question.options.length;
                      const maxPerRow = n <= 2 ? n : 2;
                      const rows = Math.ceil(n / maxPerRow);
                      const basePct = Math.floor(100 / rows);

                      // Build grid: distribute options into rows, each row takes equal height
                      const grid: (typeof question.options)[0][][] = [];
                      const sortedByLen = [...question.options].sort(
                        (a, b) => b.text.length - a.text.length,
                      );
                      // Put longest options first in row distribution
                      const orderedOptions = sortedByLen.length === n
                        ? question.options // preserve original order if same length
                        : sortedByLen;

                      for (let r = 0; r < rows; r++) {
                        grid.push(orderedOptions.slice(r * maxPerRow, r * maxPerRow + maxPerRow));
                      }

                      return (
                        <>
                          {grid.map((rowOptions, rowIdx) => (
                            <div
                              key={rowIdx}
                              className="flex gap-2"
                              style={{ flex: 1, minHeight: 0 }}
                            >
                              {rowOptions.map((option, colIdx) => {
                                const style = getOptionStyle(option.id);
                                const isLongest = option.id === sortedByLen[0]?.id;
                                const globalIdx = question.options.findIndex(
                                  (o) => o.id === option.id,
                                );
                                return (
                                  <motion.button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option.id)}
                                    disabled={showResult}
                                    className={`flex flex-col rounded-2xl text-left transition-all duration-200 border overflow-hidden ${
                                      isLongest && rows === 1 && colIdx === 0
                                        ? 'flex-1 min-h-0'
                                        : maxPerRow === 1
                                          ? 'flex-1 min-h-0'
                                          : 'flex-1 min-h-0'
                                    } ${style.className.replace(
                                      'flex items-center gap-3',
                                      'flex flex-col flex-1 min-h-0',
                                    ).replace('min-h-[3.25rem]', '')}`}
                                    whileHover={
                                      !showResult && option.id !== selectedOption
                                        ? { scale: 1.01 }
                                        : {}
                                    }
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15, delay: 0.04 * globalIdx }}
                                  >
                                    <div className="flex items-center gap-2 px-3 pt-3 pb-1 shrink-0">
                                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-all duration-200 ${style.iconBg} ${style.iconText}`}>
                                        {style.showResultIcon === 'check' ? (
                                          <Check className="w-4 h-4" />
                                        ) : style.showResultIcon === 'x' ? (
                                          <XIcon className="w-4 h-4" />
                                        ) : (
                                          option.id
                                        )}
                                      </div>
                                      {!showResult && (
                                        <kbd className="hidden xl:flex shrink-0 self-center bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-[9px] font-mono font-semibold rounded-md w-5 h-5 items-center justify-center border border-[var(--border)]">
                                          {globalIdx + 1}
                                        </kbd>
                                      )}
                                    </div>
                                    <div className="flex-1 min-h-0 px-3 pb-3 overflow-y-auto">
                                      <p className={`text-[0.8125rem] font-medium leading-relaxed ${style.textCls}`}>
                                        {option.text}
                                      </p>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
                {/* Confirm + Next button */}
                {!showResult && selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 mt-3"
                  >
                    {currentQuestionNumber < totalQuestions ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={confirmCurrentAnswer}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.99]"
                        >
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          onClick={gotoNextQuestion}
                          className="flex-1 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold py-2.5 rounded-xl text-sm border border-[var(--border)] transition-all"
                        >
                          Câu tiếp
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={confirmCurrentAnswer}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500"
                      >
                        Xác nhận & Nộp bài
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════ MOBILE LAYOUT ══════════ */}
      <div className="flex-1 flex flex-col lg:hidden overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-y-auto relative">
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-[var(--text-primary)] font-semibold text-base">
                {t('question')} {currentQuestionNumber}
              </span>
              <span className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full text-[10px] font-medium">/{totalQuestions}</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full ${timeBadgeClass}`}
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
                <Clock className={`w-4 h-4 ${isUnderOneMin ? 'text-rose-500' : isLastMinutes ? 'text-amber-500' : 'text-blue-500'}`} />
                <span className="font-mono font-semibold text-sm">{timeLabel}</span>
              </motion.div>
            </div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden bg-[var(--bg-tertiary)] shadow-md border border-[var(--border)] flex items-center justify-center shrink-0 h-[28vw] max-h-56 mx-4">
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
            <p className="text-[var(--text-primary)] text-base font-semibold leading-relaxed">
              {question.text}
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-3 px-4 overflow-y-auto pb-4">
            {question.options.map((option) => {
              const style = getOptionStyle(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={showResult}
                  className={`w-full rounded-xl flex items-center gap-3 text-left min-h-[56px] ${style.className}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-base shrink-0 transition-colors ${style.iconBg} ${style.iconText}`}>
                    {style.showResultIcon === 'check' ? (
                      <Check className="w-4 h-4" />
                    ) : style.showResultIcon === 'x' ? (
                      <XIcon className="w-4 h-4" />
                    ) : (
                      option.id
                    )}
                  </div>
                  <p className={`text-[0.9375rem] font-medium leading-relaxed min-w-0 flex-1 ${style.textCls}`}>{option.text}</p>
                </button>
              );
            })}
          </div>

          {/* ── Explanation drawer (mobile) ── */}
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
                <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md p-4 rounded-2xl border border-[var(--border)] shadow-lg max-h-[30vh] overflow-y-auto">
                  <div className="flex items-start gap-2.5">
                    <div className="text-[var(--text-primary)] font-semibold text-sm shrink-0">{t('explanation')}</div>
                    <div className="min-w-0">
                      <div className="text-[var(--text-secondary)] text-sm leading-relaxed">
                        {question.explanation}
                      </div>
                      {question.isCritical ? (
                        <div className="text-rose-500 font-semibold text-sm mt-2">Câu hỏi nghiêm trọng</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action buttons (always pinned to bottom) ── */}
          <div className="px-4 pb-4 pt-2 shrink-0 flex items-center gap-3 relative z-30 bg-[var(--bg-primary)]/90 backdrop-blur-sm">
            <motion.button
              type="button"
              onClick={confirmCurrentAnswer}
              disabled={showResult || !selectedOption || timeLeftSeconds <= 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-2xl transition-all text-sm shadow-lg shadow-blue-600/25 disabled:opacity-40 disabled:pointer-events-none"
              whileTap={!showResult && selectedOption ? { scale: 0.97 } : {}}
            >
              {t('confirmAnswer')}
            </motion.button>
            {currentQuestionNumber < totalQuestions ? (
              <motion.button
                type="button"
                onClick={gotoNextQuestion}
                className="flex-1 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold px-6 py-3 rounded-2xl transition-all text-sm border border-[var(--border)]"
                whileTap={{ scale: 0.97 }}
              >
                {t('nextQuestion')}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={submitExam}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold px-6 py-3 rounded-2xl transition-all text-sm shadow-lg shadow-emerald-600/25"
                whileTap={{ scale: 0.97 }}
              >
                {t('finishTest')}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;

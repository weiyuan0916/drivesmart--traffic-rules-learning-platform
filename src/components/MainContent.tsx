import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clock, X as XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import type { ChapterStat, Question } from '../types';
import { EXAM_CHAPTERS_ORDERED } from '../services/examGenerator';
import QuestionNav from './QuestionNav';

interface MainContentProps {
  questions: Question[];
  confirmedAnswers: (string | null)[];
  onConfirmedAnswersChange: (answers: (string | null)[]) => void;
  onCurrentQuestionNumberChange?: (n: number) => void;
  onRestartExam?: () => void;
  onExamStatsComputed?: (stats: ChapterStat[]) => void;
}

type ExamScore = {
  correct: number;
  incorrect: number;
  criticalWrong: number;
  pass: boolean;
};

const EXAM_DURATION_SECONDS = 20 * 60;
const AMBER_WARNING_SECONDS = 5 * 60;
const RED_WARNING_SECONDS = 60;
const STUCK_THRESHOLD_MS = 120 * 1000;

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

const MainContent: React.FC<MainContentProps> = ({
  questions,
  confirmedAnswers,
  onConfirmedAnswersChange,
  onCurrentQuestionNumberChange,
  onRestartExam,
  onExamStatsComputed,
}) => {
  const { t } = useLanguage();
  const totalQuestions = questions.length;

  const examStartedAtRef = useRef<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [examFinished, setExamFinished] = useState(false);
  const [examScore, setExamScore] = useState<ExamScore | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(EXAM_DURATION_SECONDS);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isStuck, setIsStuck] = useState(false);
  const [imageEnlarged, setImageEnlarged] = useState(false);

  const currentIndex = currentQuestionNumber - 1;
  const question = questions[currentIndex];

  // ── Reset on new exam ──
  useEffect(() => {
    examStartedAtRef.current = Date.now();
    setTimeLeftSeconds(EXAM_DURATION_SECONDS);
    setCurrentQuestionNumber(1);
    setSelectedOption(null);
    setExamFinished(false);
    setExamScore(null);
    setQuestionStartTime(Date.now());
    setIsStuck(false);
  }, [questions]);

  // ── Reset image enlarged when question changes ──
  useEffect(() => {
    setImageEnlarged(false);
  }, [currentQuestionNumber]);

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
          const next = [...confirmedAnswers];
          next[currentIndex] = selectedOption;
          onConfirmedAnswersChange(next);
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
  const isLastMinutes = timeLeftSeconds > 0 && timeLeftSeconds <= AMBER_WARNING_SECONDS;
  const isUnderOneMin = timeLeftSeconds > 0 && timeLeftSeconds <= RED_WARNING_SECONDS;

  const timeBadgeClass = isUnderOneMin
    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
    : isLastMinutes
      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)]';

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

      let color = '#64748B';
      if (isAnswered) {
        color = isCorrect ? '#22C55E' : '#EF4444';
      } else if (isCurrent) {
        color = '#3B82F6';
      } else if (selectedOption && i === currentIndex) {
        color = '#3B82F6';
      }

      segments.push({ color, width: `${pctPerQ}%` });
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

    if (showResult) {
      if (isCorrectOption) {
        bg = 'bg-emerald-500';
        border = 'border-emerald-400';
        iconBg = 'bg-white/25';
        iconText = 'text-white';
        textCls = 'text-white';
      } else if (isConfirmedSelected && !isCorrectOption) {
        bg = 'bg-rose-500';
        border = 'border-rose-400';
        iconBg = 'bg-white/25';
        iconText = 'text-white';
        textCls = 'text-white';
      }
    } else if (isSelected) {
      bg = 'bg-blue-500';
      border = 'border-blue-500';
      iconBg = 'bg-white';
      iconText = 'text-blue-500';
      textCls = 'text-white';
    }

    return {
      className: `w-full h-full min-h-[3.75rem] rounded-2xl flex items-start gap-3 px-3 py-3 text-left transition-all duration-150 border ${bg} ${border}`,
      iconBg,
      iconText,
      textCls,
      showResultIcon: showResult ? (isCorrectOption ? 'check' : isConfirmedSelected && !isCorrectOption ? 'x' : null) : null,
    };
  };

  const handleOptionClick = (optionId: string) => {
    if (examFinished || timeLeftSeconds <= 0 || showResult) return;
    setSelectedOption(optionId);
    setQuestionStartTime(Date.now());
    setIsStuck(false);
  };

  const confirmCurrentAnswer = () => {
    if (examFinished || timeLeftSeconds <= 0 || !question || !selectedOption) return;
    const next = [...confirmedAnswers];
    next[currentIndex] = selectedOption;
    onConfirmedAnswersChange(next);
  };

  const gotoNextQuestion = () => {
    setCurrentQuestionNumber((n) => Math.min(totalQuestions, n + 1));
    setQuestionStartTime(Date.now());
    setIsStuck(false);
  };

  const submitExam = useCallback(() => {
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
        return { chapterNumber, chapter: title, correct: value.correct, total: value.total };
      });
      onExamStatsComputed(chapterStats);
    }
  }, [questions, confirmedAnswers, currentIndex, selectedOption, onExamStatsComputed]);

  useEffect(() => {
    if (examFinished) return;
    if (timeLeftSeconds > 0) return;
    submitExam();
  }, [timeLeftSeconds, examFinished, submitExam]);

  useEffect(() => {
    if (examFinished) return;
    if (!confirmedAnswers.length) return;
    const allConfirmed = confirmedAnswers.every((a) => a !== null);
    if (allConfirmed) submitExam();
  }, [confirmedAnswers, examFinished, submitExam]);

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 sm:p-8"
        >
          <div className="text-center space-y-5">
            <div
              className={`inline-flex items-center gap-2 justify-center rounded-full px-5 py-2.5 text-lg font-bold ${
                examScore.pass ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
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
              className="w-full rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-4 text-sm font-bold transition-opacity hover:opacity-80 active:scale-[0.99]"
            >
              Làm lại
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row overflow-hidden bg-[var(--bg-primary)]" tabIndex={0}>
      {/* ══════════ LEFT COLUMN: progress / timer / số câu phía TRÊN ảnh ══════════ */}
      <div className="w-full lg:w-[42%] shrink-0 flex flex-col lg:border-r border-[var(--border)] overflow-hidden min-h-0">
        {/* Progress + timer + question numbers — above image */}
        <div className="shrink-0 bg-[var(--bg-secondary)]/40">
          {/* Answered count + timer */}
          <div className="px-3 py-1.5 flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-secondary)] font-medium truncate">
              {answeredCount}/{totalQuestions} đã trả lời
            </span>
            <motion.div
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full ${timeBadgeClass}`}
              animate={
                isUnderOneMin
                  ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.8 } }
                  : isLastMinutes
                    ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                    : {}
              }
            >
              <Clock className={`w-3.5 h-3.5 ${isUnderOneMin ? 'text-rose-500' : isLastMinutes ? 'text-amber-500' : 'text-blue-500'}`} />
              <span className="font-mono font-semibold text-xs tabular-nums">{timeLabel}</span>
            </motion.div>
          </div>
          {/* Question number nav */}
          <div className="border-t border-[var(--border)]/60 bg-[var(--bg-secondary)]/50">
            <QuestionNav
              questions={questions}
              currentQuestionNumber={currentQuestionNumber}
              confirmedAnswers={confirmedAnswers}
              onNavigate={(num) => {
                setCurrentQuestionNumber(num);
                setQuestionStartTime(Date.now());
                setIsStuck(false);
              }}
            />
          </div>
        </div>

        {/* Image container */}
        <div
          className="flex-1 min-h-0 overflow-hidden relative flex items-center justify-center bg-[var(--bg-tertiary)] cursor-zoom-in"
          onClick={() => question.image && setImageEnlarged(true)}
        >
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
              <div
                key={`no-img-${currentQuestionNumber}`}
                className="w-full h-full flex items-center justify-center min-h-[200px]"
              >
                <span className="text-[var(--text-muted)] text-sm">Không có ảnh</span>
              </div>
            )}
          </AnimatePresence>
        </div>
        {/* Image footer */}
        <div className="shrink-0 px-4 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-secondary)]">{question.chapter}</span>
          {question.isCritical && (
            <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium px-2.5 py-1 rounded-full">
              Nghiêm trọng
            </span>
          )}
        </div>
      </div>

      {/* ══════════ RIGHT COLUMN: QUESTION + ANSWERS ══════════ */}
      <div className="flex-1 flex flex-col border-t lg:border-t-0 overflow-hidden min-h-0">
        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-5 xl:p-6 space-y-4">
            {/* Question header */}
            <div className="flex items-start gap-2 flex-wrap">
              <span className="bg-blue-500/10 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                Câu {currentQuestionNumber} / {totalQuestions}
              </span>
              <span className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-medium px-2.5 py-1 rounded-full shrink-0 border border-[var(--border)]">
                {question.chapter}
              </span>
              {question.isCritical && (
                <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                  Nghiêm trọng
                </span>
              )}
            </div>

            {/* Stuck hint */}
            <AnimatePresence>
              {isStuck && !showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                    Bạn đang gặp khó khăn? Hãy chọn một đáp án bất kỳ để xem giải thích sau khi xác nhận.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question text */}
            <p className="text-[var(--text-primary)] text-base xl:text-lg font-semibold leading-relaxed">
              {question.text}
            </p>

            {/* Answer options — single column */}
            <div className="flex flex-col gap-3">
              {question.options.map((option, idx) => {
                const style = getOptionStyle(option.id);
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    disabled={showResult}
                    className={style.className}
                    whileHover={!showResult && option.id !== selectedOption ? { scale: 1.01 } : {}}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12, delay: 0.03 * idx }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-all duration-200 mt-0.5 ${style.iconBg} ${style.iconText}`}>
                      {style.showResultIcon === 'check' ? (
                        <Check className="w-4 h-4" />
                      ) : style.showResultIcon === 'x' ? (
                        <XIcon className="w-4 h-4" />
                      ) : (
                        option.id
                      )}
                    </div>
                    <div className="min-w-0 flex-1 self-start pt-0.5">
                      <p className={`text-[0.9375rem] font-medium leading-relaxed ${style.textCls}`}>{option.text}</p>
                    </div>
                    {!showResult && (
                      <kbd className="shrink-0 self-start mt-1 bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-[9px] font-mono font-semibold rounded-md w-5 h-5 flex items-center justify-center border border-[var(--border)]">
                        {idx + 1}
                      </kbd>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Explanation — floating above action bar, outside scroll */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="shrink-0 mx-4 border-t border-[var(--border)] overflow-hidden"
            >
              <div className="py-3">
                <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl px-4 py-3">
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
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Giải thích</p>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                        {question.explanation}
                      </p>
                      {question.isCritical && (
                        <p className="text-rose-500 text-xs font-semibold mt-1.5">Câu hỏi nghiêm trọng — Sai = trượt</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action bar — pinned to bottom */}
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          {currentQuestionNumber < totalQuestions ? (
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={confirmCurrentAnswer}
                disabled={!selectedOption || timeLeftSeconds <= 0}
                className="flex-1 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold py-3 rounded-2xl text-sm transition-opacity hover:opacity-80 active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed"
                whileTap={selectedOption ? { scale: 0.98 } : {}}
              >
                Xác nhận
              </motion.button>
              <motion.button
                type="button"
                onClick={gotoNextQuestion}
                className="flex-1 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold py-3 rounded-2xl text-sm border border-[var(--border)] transition-colors active:scale-[0.99]"
                whileTap={{ scale: 0.98 }}
              >
                Câu tiếp
              </motion.button>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={confirmCurrentAnswer}
              disabled={!selectedOption || timeLeftSeconds <= 0}
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-2xl text-sm transition-opacity hover:opacity-80 active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed"
              whileTap={selectedOption ? { scale: 0.98 } : {}}
            >
              Xác nhận & Nộp bài
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Image Lightbox ── */}
      <AnimatePresence>
        {imageEnlarged && question.image && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setImageEnlarged(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Close button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImageEnlarged(false); }}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
            {/* Image */}
            <motion.img
              src={question.image}
              alt="Traffic Situation"
              className="relative z-10 max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainContent;

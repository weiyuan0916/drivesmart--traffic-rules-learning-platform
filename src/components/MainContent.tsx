import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronUp, Clock, Bookmark, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { ChapterStat, Question } from '../types';
import { EXAM_CHAPTERS_ORDERED } from '../services/examGenerator';
import LanguageSwitcher from './LanguageSwitcher';
import { SmoothScroll } from './SmoothScroll';

interface MainContentProps {
  onBack?: () => void;
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
const LAST_MINUTES_WARNING_SECONDS = 3 * 60;

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

  const currentIndex = currentQuestionNumber - 1;
  const question = questions[currentIndex];

  useEffect(() => {
    examStartedAtRef.current = Date.now();
    setTimeLeftSeconds(EXAM_DURATION_SECONDS);
    setCurrentQuestionNumber(1);
    setQuestionNavExpanded(false);
    setSelectedOption(null);
    setExamFinished(false);
    setExamScore(null);
  }, [questions]);

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

  useEffect(() => {
    onCurrentQuestionNumberChange?.(currentQuestionNumber);
  }, [currentQuestionNumber, onCurrentQuestionNumberChange]);

  useEffect(() => {
    const confirmed = confirmedAnswers[currentIndex];
    if (confirmed) setSelectedOption(confirmed);
    else setSelectedOption(null);
  }, [currentIndex, confirmedAnswers]);

  const currentConfirmedAnswer = confirmedAnswers[currentIndex];
  const showResult = currentConfirmedAnswer !== null && currentConfirmedAnswer !== undefined;
  const correctOptionId = question?.correctAnswer;

  const timeLabel = useMemo(() => formatMmSs(timeLeftSeconds), [timeLeftSeconds]);
  const isLastMinutes = timeLeftSeconds > 0 && timeLeftSeconds <= LAST_MINUTES_WARNING_SECONDS;
  const timeBadgeClass = isLastMinutes
    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
    : 'bg-blue-500/10 border border-blue-500/20 text-blue-500';

  const handleOptionClick = (optionId: string) => {
    if (examFinished) return;
    if (timeLeftSeconds <= 0) return;
    if (showResult) return;
    setSelectedOption(optionId);
  };

  const confirmCurrentAnswer = () => {
    if (examFinished) return;
    if (timeLeftSeconds <= 0) return;
    if (!question) return;
    if (!selectedOption) return;
    const next = [...confirmedAnswers];
    next[currentIndex] = selectedOption;
    onConfirmedAnswersChange(next);
  };

  const gotoNextQuestion = () => {
    setQuestionNavExpanded(false);
    setCurrentQuestionNumber((n) => Math.min(totalQuestions, n + 1));
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
        const value = chapterMap.get(chapterNumber);
        return {
          chapterNumber,
          chapter: title,
          correct: value?.correct ?? 0,
          total: value?.total ?? 0,
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

  if (!questions.length) {
    return (
      <SmoothScroll className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </SmoothScroll>
    );
  }

  if (examFinished && examScore) {
    return (
      <SmoothScroll className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-full max-w-xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-lg">
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
        </div>
      </SmoothScroll>
    );
  }

  return (
    <SmoothScroll className="flex-1 bg-[var(--bg-primary)] flex flex-col transition-colors duration-300">
      <div className="lg:hidden sticky top-0 z-30 w-full bg-[var(--bg-secondary)] border-b border-[var(--border)] shadow-sm">
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

        <div className="px-4 sm:px-6 pb-3 pt-2 border-t border-[var(--border)]">
          <div className="flex gap-2 items-start sm:hidden">
            <button
              type="button"
              onClick={() => setQuestionNavExpanded((e) => !e)}
              aria-expanded={questionNavExpanded}
              title={questionNavExpanded ? t('collapseQuestionNav') : t('expandQuestionNav')}
              aria-label={questionNavExpanded ? t('collapseQuestionNav') : t('expandQuestionNav')}
              className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm transition-colors active:bg-[var(--bg-hover)]"
            >
              {questionNavExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <LayoutGrid className="h-3 w-3" />
              )}
            </button>
            <div
              data-lenis-prevent
              className={
                questionNavExpanded
                  ? 'min-w-0 flex-1 grid grid-cols-5 gap-2 max-h-[min(14rem,48vh)] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]'
                  : 'min-w-0 flex-1 grid grid-cols-5 gap-2 grid-rows-2'
              }
            >
              {(questionNavExpanded
                ? Array.from({ length: totalQuestions }, (_, i) => i + 1)
                : currentQuestionNumber <= 10
                  ? Array.from({ length: Math.min(10, totalQuestions) }, (_, i) => i + 1)
                  : Array.from(
                      { length: Math.min(10, totalQuestions) },
                      (_, i) => Math.min(totalQuestions, i + 11),
                    )
              ).map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => {
                    setCurrentQuestionNumber(num);
                    setQuestionNavExpanded(false);
                  }}
                  className={`size-[26px] justify-self-center rounded-md flex items-center justify-center text-sm font-bold leading-none transition-all active:bg-[var(--bg-hover)] ${numberBadgeClass(num)}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div
            data-lenis-prevent
            className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 w-full scrollbar-visible"
          >
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

      <div className="p-2.5 sm:p-4 lg:p-8 flex flex-col gap-3 lg:gap-6 w-full max-w-full overflow-x-hidden">
        <div className="lg:hidden flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[var(--text-primary)] font-bold text-sm sm:text-lg">
              {t('question')} {currentQuestionNumber}
            </span>
            <span className="text-[var(--text-secondary)] text-[10px] sm:text-sm font-medium">/ {totalQuestions}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={`flex items-center gap-1 sm:gap-2 px-2 py-0.5 rounded-full ${timeBadgeClass}`}>
              <Clock className={`w-3 h-3 ${isLastMinutes ? 'text-rose-500' : 'text-blue-500'}`} />
              <span className="font-mono font-bold text-[10px] sm:text-sm">{timeLabel}</span>
            </div>
            <button className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="relative w-full rounded-3xl overflow-hidden bg-[var(--bg-tertiary)] shadow-xl shrink-0 border border-[var(--border)] h-[28vh] sm:h-[32vh] lg:h-[36vh] flex items-center justify-center">
          {question.image ? (
            <img
              src={question.image}
              alt="Traffic Situation"
              className="max-h-full max-w-full w-auto h-auto object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[var(--bg-tertiary)]" />
          )}
        </div>

        <div className="bg-[var(--bg-tertiary)] p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-[var(--border)]">
          <p className="text-[var(--text-primary)] text-xs sm:text-base lg:text-lg font-bold leading-relaxed">
            {question.text}
          </p>
        </div>

        <div className="space-y-4">
          {question.options.map((option) => {
            const isSelected = currentConfirmedAnswer === option.id;
            const isCorrect = option.id === correctOptionId;

            let buttonClass =
              'bg-[var(--bg-tertiary)] border-[var(--border)] hover:bg-[var(--bg-hover)]';
            let iconClass = 'bg-[var(--bg-hover)] text-[var(--text-secondary)]';
            let textClass = 'text-[var(--text-secondary)]';

            if (showResult) {
              if (isCorrect) {
                buttonClass =
                  'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20';
                iconClass = 'bg-white text-emerald-600';
                textClass = 'text-white';
              } else if (isSelected && !isCorrect) {
                buttonClass =
                  'bg-rose-500 border-rose-400 shadow-lg shadow-rose-500/20';
                iconClass = 'bg-white text-rose-600';
                textClass = 'text-white';
              }
            } else if (selectedOption === option.id) {
              buttonClass = 'bg-[var(--bg-hover)] border-blue-500/50';
              iconClass = 'bg-blue-500/20 text-blue-500';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={showResult}
                className={`w-full p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex items-start gap-4 sm:gap-6 text-left transition-all duration-200 group border ${buttonClass}`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shrink-0 transition-colors ${iconClass}`}
                >
                  {option.id}
                </div>
                <p className={`text-sm sm:text-base font-bold pt-1 ${textClass}`}>{option.text}</p>
              </button>
            );
          })}
        </div>

        {showResult ? (
          <div className="bg-[var(--bg-tertiary)] p-3 sm:p-5 rounded-xl border border-[var(--border)]">
            <div className="text-[var(--text-primary)] font-bold text-sm">{t('explanation')}</div>
            <div className="text-[var(--text-secondary)] text-xs sm:text-sm mt-2 leading-relaxed">
              {question.explanation}
            </div>
            {question.isCritical ? (
              <div className="text-rose-500 font-bold text-xs sm:text-sm mt-3">
                Nhóm câu nghiêm trọng
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 pb-52 lg:pb-0">
          <button
            type="button"
            onClick={confirmCurrentAnswer}
            disabled={showResult || !selectedOption || timeLeftSeconds <= 0}
            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors text-xs sm:text-base shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:pointer-events-none"
          >
            {t('confirmAnswer')}
          </button>

          {currentQuestionNumber < totalQuestions ? (
            <button
              type="button"
              onClick={gotoNextQuestion}
              disabled={currentQuestionNumber >= totalQuestions}
              className="flex-1 lg:flex-none bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:pointer-events-none text-[var(--text-primary)] font-bold px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors text-xs sm:text-base border border-[var(--border)]"
            >
              {t('nextQuestion')}
            </button>
          ) : (
            <button
              type="button"
              onClick={submitExam}
              className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors text-xs sm:text-base shadow-lg shadow-emerald-600/20"
            >
              {t('finishTest')}
            </button>
          )}
        </div>
      </div>
    </SmoothScroll>
  );
};

export default MainContent;

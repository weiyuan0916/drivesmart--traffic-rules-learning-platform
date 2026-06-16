import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clock, X as XIcon, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import type { Question } from '../types';
import ResultsAnalyticsModal from './ResultsAnalyticsModal';
import { QuestionImage } from './QuestionImage';

interface ExamTakingScreenProps {
  questions: Question[];
  initialAnswers?: (string | null)[];
  examTimeMinutes?: number;
  candidateName?: string;
  onComplete?: (results: ExamResults) => void;
  onExit?: () => void;
}

export interface ExamResults {
  correct: number;
  incorrect: number;
  skipped: number;
  totalQuestions: number;
  accuracy: number;
  pass: boolean;
  answers: (string | null)[];
  timeSpentSeconds: number;
}

const AMBER_WARNING_SECONDS = 5 * 60;
const RED_WARNING_SECONDS = 60;

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

const ExamTakingScreen: React.FC<ExamTakingScreenProps> = ({
  questions,
  initialAnswers,
  examTimeMinutes = 30,
  candidateName = 'Thí sinh',
  onComplete,
  onExit,
}) => {
  const { t } = useLanguage();
  const totalQuestions = questions.length;
  const examDurationSeconds = examTimeMinutes * 60;

  const examStartedAtRef = useRef<number>(Date.now());
  const [answers, setAnswers] = useState<(string | null)[]>(() =>
    initialAnswers ?? Array(questions.length).fill(null)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(examDurationSeconds);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResults, setExamResults] = useState<ExamResults | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredCount = answers.filter(a => a !== null).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Reset when questions change
  useEffect(() => {
    examStartedAtRef.current = Date.now();
    setTimeLeftSeconds(examDurationSeconds);
    setCurrentIndex(0);
    setSelectedOption(null);
    setExamCompleted(false);
    setShowResults(false);
    setShowSubmitConfirm(false);
  }, [questions, examDurationSeconds]);

  // Timer
  useEffect(() => {
    if (examCompleted) return;
    
    const tick = () => {
      const elapsedSeconds = (Date.now() - examStartedAtRef.current) / 1000;
      const remaining = examDurationSeconds - elapsedSeconds;
      if (remaining <= 0) {
        setTimeLeftSeconds(0);
        return;
      }
      setTimeLeftSeconds(Math.ceil(remaining));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [examCompleted, examDurationSeconds]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (examCompleted || timeLeftSeconds > 0) return;
    handleSubmit();
  }, [timeLeftSeconds, examCompleted]);

  // Sync selected option with current answer
  useEffect(() => {
    setSelectedOption(answers[currentIndex]);
  }, [currentIndex, answers]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (examCompleted) return;
      const key = e.key.toLowerCase();

      if (['arrowleft', 'arrowup'].includes(key)) {
        e.preventDefault();
        goToQuestion(currentIndex - 1);
      } else if (['arrowright', 'arrowdown'].includes(key) || key === ' ') {
        e.preventDefault();
        goToQuestion(currentIndex + 1);
      } else if (['1', '2', '3', '4'].includes(key) && !showSubmitConfirm) {
        e.preventDefault();
        const idx = parseInt(key, 10) - 1;
        if (currentQuestion?.options[idx]) {
          selectOption(currentQuestion.options[idx].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion, examCompleted, showSubmitConfirm]);

  const selectOption = useCallback((optionId: string) => {
    if (examCompleted) return;
    setSelectedOption(optionId);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionId;
    setAnswers(newAnswers);
  }, [currentIndex, answers, examCompleted]);

  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= totalQuestions) return;
    setCurrentIndex(index);
    setSelectedOption(answers[index]);
  }, [answers, totalQuestions]);

  const handleSubmit = useCallback(() => {
    if (examCompleted) return;
    
    const timeSpent = (Date.now() - examStartedAtRef.current) / 1000;
    
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    for (let i = 0; i < questions.length; i++) {
      const answer = answers[i];
      if (answer === null) {
        skipped++;
      } else if (answer === questions[i].correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const accuracy = Math.round((correct / questions.length) * 100);
    const pass = correct >= questions.length * 0.9;

    const results: ExamResults = {
      correct,
      incorrect,
      skipped,
      totalQuestions: questions.length,
      accuracy,
      pass,
      answers: [...answers],
      timeSpentSeconds: timeSpent,
    };

    setExamResults(results);
    setExamCompleted(true);
    setShowResults(true);
    onComplete?.(results);
  }, [answers, questions, examCompleted, onComplete]);

  // Timer styling
  const timeLabel = useMemo(() => formatMmSs(timeLeftSeconds), [timeLeftSeconds]);
  const isLastMinutes = timeLeftSeconds > 0 && timeLeftSeconds <= AMBER_WARNING_SECONDS;
  const isUnderOneMin = timeLeftSeconds > 0 && timeLeftSeconds <= RED_WARNING_SECONDS;

  const timerBgClass = isUnderOneMin
    ? 'bg-rose-500 text-white animate-pulse'
    : isLastMinutes
    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]';

  // Option button class
  const getOptionClass = (optionId: string, index: number) => {
    const isSelected = selectedOption === optionId;
    const letter = ['A', 'B', 'C', 'D'][index];
    
    if (isSelected) {
      return {
        container: 'bg-blue-500 border-blue-500',
        letter: 'bg-white text-blue-500',
        text: 'text-white',
      };
    }
    
    return {
      container: 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-blue-400 hover:bg-blue-500/5',
      letter: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
      text: 'text-[var(--text-primary)]',
    };
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Header - Minimal and Clean */}
      <header className="shrink-0 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Progress - Clean pill style */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="15.5" 
                    fill="none" 
                    stroke="url(#progressGradient)" 
                    strokeWidth="3" 
                    strokeDasharray={`${progress}, 100`} 
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                  {currentIndex + 1}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-[var(--text-muted)]">Câu hỏi</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{answeredCount}/{totalQuestions} đã trả lời</p>
              </div>
            </div>
          </div>

          {/* Right side - Submit CTA */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-5 py-2.5 bg-[var(--text-primary)] hover:opacity-80 text-[var(--bg-primary)] font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
          >
            <span>Nộp bài</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        {/* Progress bar - subtle */}
        <div className="h-1 bg-[var(--bg-tertiary)]">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto modern-scrollbar">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
          {/* Question header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500 text-white font-bold text-sm">
                {currentIndex + 1}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                {currentQuestion.chapter.split('.')[0]}
              </span>
              {currentQuestion.isCritical && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  Câu hỏi nghiêm trọng
                </span>
              )}
            </div>
            
            {/* Question text */}
            <motion.h2
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-relaxed"
            >
              {currentQuestion.text}
            </motion.h2>

            {/* Question image if exists */}
            {currentQuestion.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 rounded-2xl overflow-hidden"
              >
                <QuestionImage
                  questionId={currentQuestion.id}
                  alt="Hình minh họa"
                  className="w-full max-h-64 object-contain bg-[var(--bg-secondary)]"
                />
              </motion.div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const classes = getOptionClass(option.id, idx);
              const letter = ['A', 'B', 'C', 'D'][idx];
              
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => selectOption(option.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 min-h-[60px] ${classes.container}`}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${classes.letter}`}>
                    {letter}
                  </span>
                  <span className={`flex-1 text-base font-medium leading-relaxed pt-1 ${classes.text}`}>
                    {option.text}
                  </span>
                  {selectedOption === option.id && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-blue-500" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Fixed with Floating Timer */}
      <div className="fixed bottom-0 left-0 right-0 safe-area-bottom">
        {/* Timer pill - floating above nav */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm ${timerBgClass}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLabel}</span>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--border)]">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Trước</span>
              </button>

              {/* Question indicator - show question number */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {answers.slice(Math.max(0, currentIndex - 4), currentIndex + 5).map((_, idx) => {
                    const actualIndex = Math.max(0, currentIndex - 4) + idx;
                    if (actualIndex >= totalQuestions) return null;
                    const isAnswered = answers[actualIndex] !== null;
                    const isCurrent = actualIndex === currentIndex;
                    
                    return (
                      <button
                        key={actualIndex}
                        onClick={() => goToQuestion(actualIndex)}
                        className={`w-6 h-6 rounded-md text-[10px] font-semibold transition-all ${
                          isCurrent
                            ? 'bg-blue-500 text-white shadow-md'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                        }`}
                      >
                        {actualIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-80 active:scale-95"
                >
                  <span className="hidden sm:inline">Tiếp</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  disabled={unansweredCount === totalQuestions}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  Nộp bài
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSubmitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--bg-secondary)] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Nộp bài thi?</h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Bạn đã trả lời {answeredCount}/{totalQuestions} câu.
                {unansweredCount > 0 && (
                  <span className="text-amber-500"> Còn {unansweredCount} câu chưa trả lời.</span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Tiếp tục làm bài
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Nộp bài
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && examResults && (
          <ResultsAnalyticsModal
            results={examResults}
            questions={questions}
            answers={answers}
            candidateName={candidateName}
            onClose={() => {
              setShowResults(false);
              onExit?.();
            }}
            onRetry={() => {
              setShowResults(false);
              setExamCompleted(false);
              setAnswers(Array(questions.length).fill(null));
              setCurrentIndex(0);
              setSelectedOption(null);
              examStartedAtRef.current = Date.now();
              setTimeLeftSeconds(examDurationSeconds);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamTakingScreen;

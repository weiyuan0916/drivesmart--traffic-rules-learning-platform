import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clock, X as XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import type { ChapterStat, Question } from '../types';
import { EXAM_CHAPTERS_ORDERED } from '../services/examGenerator';
import QuestionNav from './QuestionNav';
import { QuestionImage } from './QuestionImage';

interface MainContentProps {
  questions: Question[];
  confirmedAnswers: (string | null)[];
  onConfirmedAnswersChange: (answers: (string | null)[]) => void;
  onCurrentQuestionNumberChange?: (n: number) => void;
  onRestartExam?: () => void;
  onExamStatsComputed?: (stats: ChapterStat[]) => void;
  examTimeMinutes?: number;
}

type ChapterAnalysis = {
  chapterNumber: number;
  chapter: string;
  chapterShort: string;
  correct: number;
  total: number;
  accuracy: number;
};

type ExamScore = {
  correct: number;
  incorrect: number;
  skipped: number;
  criticalWrong: number;
  pass: boolean;
  totalQuestions: number;
  accuracy: number;
  chapterAnalysis: ChapterAnalysis[];
  strongestChapters: ChapterAnalysis[];
  weakestChapters: ChapterAnalysis[];
  studyRecommendations: string[];
};

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
  examTimeMinutes = 30,
}) => {
  const { t } = useLanguage();
  const totalQuestions = questions.length;
  const examDurationSeconds = examTimeMinutes * 60;

  const examStartedAtRef = useRef<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [examFinished, setExamFinished] = useState(false);
  const [examScore, setExamScore] = useState<ExamScore | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(examDurationSeconds);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isStuck, setIsStuck] = useState(false);
  const [imageEnlarged, setImageEnlarged] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentIndex = currentQuestionNumber - 1;
  const question = questions[currentIndex];

  // ── Reset on new exam ──
  useEffect(() => {
    examStartedAtRef.current = Date.now();
    setTimeLeftSeconds(examDurationSeconds);
    setCurrentQuestionNumber(1);
    setSelectedOption(null);
    setExamFinished(false);
    setExamScore(null);
    setQuestionStartTime(Date.now());
    setIsStuck(false);
  }, [questions, examDurationSeconds]);

  // ── Reset image enlarged when question changes ──
  useEffect(() => {
    setImageEnlarged(false);
  }, [currentQuestionNumber]);

  // ── Timer ──
  useEffect(() => {
    if (examFinished) return;
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

  // ── Auto-dismiss explanation after 5 seconds ──
  useEffect(() => {
    if (!showResult) {
      setIsDissolving(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsDissolving(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [showResult, currentQuestionNumber]);

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
    
    // Check if wrong answer on critical question - exam ends immediately
    const isWrongAnswer = selectedOption !== question.correctAnswer;
    if (question.isCritical && isWrongAnswer) {
      // Mark this answer and immediately end the exam
      const next = [...confirmedAnswers];
      next[currentIndex] = selectedOption;
      onConfirmedAnswersChange(next);
      
      // Calculate results
      const answersForScore = next;
      let correct = 0;
      let incorrect = 0;
      let skipped = 0;
      const chapterMap = new Map<number, { correct: number; total: number; skipped: number }>();
      
      for (let i = 0; i < questions.length; i += 1) {
        const q = questions[i];
        const selected = answersForScore[i];
        const isSkipped = selected == null;
        const ok = !isSkipped && selected === q.correctAnswer;
        const entry = chapterMap.get(q.chapterNumber) ?? { correct: 0, total: 0, skipped: 0 };
        entry.total += 1;
        if (isSkipped) {
          entry.skipped += 1;
          skipped += 1;
        } else if (ok) {
          entry.correct += 1;
          correct += 1;
        } else {
          incorrect += 1;
        }
        chapterMap.set(q.chapterNumber, entry);
      }
      
      const accuracy = Math.round((correct / questions.length) * 100);
      const chapterAnalysis: ChapterAnalysis[] = EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }) => {
        const value = chapterMap.get(chapterNumber) ?? { correct: 0, total: 0, skipped: 0 };
        const answeredInChapter = value.total - value.skipped;
        const chapterAcc = answeredInChapter > 0 ? Math.round((value.correct / answeredInChapter) * 100) : 0;
        const shortTitle = title.replace(/^Chương \d+\.\s*/, '').substring(0, 30);
        return { chapterNumber, chapter: title, chapterShort: shortTitle, correct: value.correct, total: value.total, accuracy: chapterAcc };
      });
      const sortedChapters = [...chapterAnalysis].filter(c => c.total > 0).sort((a, b) => b.accuracy - a.accuracy);
      const weakestChapters = sortedChapters.filter(c => c.accuracy < 80).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
      const studyRecommendations: string[] = [];
      if (weakestChapters.length > 0) {
        studyRecommendations.push(`Hãy tập trung vào "${weakestChapters[0].chapterShort}" - đây là lĩnh vực cần cải thiện.`);
      }
      studyRecommendations.push(`Chú ý các câu hỏi nghiêm trọng - sai 1 câu sẽ dẫn đến trượt.`);
      
      setExamScore({ 
        correct, incorrect, skipped, criticalWrong: 1, pass: false, 
        totalQuestions: questions.length, accuracy, 
        chapterAnalysis, 
        strongestChapters: sortedChapters.filter(c => c.accuracy >= 80).slice(0, 3),
        weakestChapters,
        studyRecommendations 
      });
      setExamFinished(true);
      
      if (onExamStatsComputed) {
        const chapterStats: ChapterStat[] = EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }) => {
          const value = chapterMap.get(chapterNumber) ?? { correct: 0, total: 0, skipped: 0 };
          return { chapterNumber, chapter: title, correct: value.correct, total: value.total };
        });
        onExamStatsComputed(chapterStats);
      }
      return;
    }
    
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
    let skipped = 0;
    let criticalWrong = 0;
    const chapterMap = new Map<number, { correct: number; total: number; skipped: number }>();

    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      const selected = answersForScore[i];
      const isSkipped = selected == null;
      const ok = !isSkipped && selected === q.correctAnswer;

      const entry = chapterMap.get(q.chapterNumber) ?? { correct: 0, total: 0, skipped: 0 };
      entry.total += 1;
      if (isSkipped) {
        entry.skipped += 1;
        skipped += 1;
      } else if (ok) {
        entry.correct += 1;
        correct += 1;
      } else {
        incorrect += 1;
      }
      chapterMap.set(q.chapterNumber, entry);

      if (q.isCritical && !ok && !isSkipped) criticalWrong += 1;
    }

    const pass = criticalWrong === 0 && correct >= questions.length * 0.9;

    // Build chapter analysis
    const chapterAnalysis: ChapterAnalysis[] = EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }) => {
      const value = chapterMap.get(chapterNumber) ?? { correct: 0, total: 0, skipped: 0 };
      const answeredInChapter = value.total - value.skipped;
      const accuracy = answeredInChapter > 0 ? Math.round((value.correct / answeredInChapter) * 100) : 0;
      const shortTitle = title.replace(/^Chương \d+\.\s*/, '').substring(0, 30);
      return { chapterNumber, chapter: title, chapterShort: shortTitle, correct: value.correct, total: value.total, accuracy };
    });

    // Sort by accuracy for strongest/weakest
    const sortedChapters = [...chapterAnalysis].filter(c => c.total > 0).sort((a, b) => b.accuracy - a.accuracy);
    const strongestChapters = sortedChapters.filter(c => c.accuracy >= 80).slice(0, 3);
    const weakestChapters = sortedChapters.filter(c => c.accuracy < 80).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

    // Generate study recommendations
    const studyRecommendations: string[] = [];
    const accuracy = Math.round((correct / questions.length) * 100);

    if (weakestChapters.length > 0) {
      const lowestAccuracy = weakestChapters[0];
      if (lowestAccuracy.accuracy < 50) {
        studyRecommendations.push(`Tập trung vào "${lowestAccuracy.chapterShort}" - độ chính xác của bạn là ${lowestAccuracy.accuracy}%. Hãy bắt đầu từ những kiến thức cơ bản.`);
      } else if (lowestAccuracy.accuracy < 70) {
        studyRecommendations.push(`Ôn tập "${lowestAccuracy.chapterShort}" - bạn đang đạt ${lowestAccuracy.accuracy}% độ chính xác. Hãy luyện thêm câu hỏi trong lĩnh vực này.`);
      } else {
        studyRecommendations.push(`Hoàn thiện "${lowestAccuracy.chapterShort}" - bạn gần đạt mức thành thạo với ${lowestAccuracy.accuracy}%!`);
      }
    }
    if (criticalWrong > 0) {
      studyRecommendations.push(`Đặc biệt chú ý các câu hỏi nghiêm trọng - sai 1 câu sẽ dẫn đến trượt bài thi.`);
    }
    if (weakestChapters.length >= 2) {
      const secondLowest = weakestChapters[1];
      studyRecommendations.push(`Ưu tiên thứ hai: Cải thiện "${secondLowest.chapterShort}" (độ chính xác ${secondLowest.accuracy}%).`);
    }
    if (accuracy >= 90 && pass) {
      studyRecommendations.push(`Xuất sắc! Hãy tiếp tục luyện tập để duy trì kiến thức của bạn.`);
    }

    const score: ExamScore = { 
      correct, 
      incorrect, 
      skipped, 
      criticalWrong, 
      pass, 
      totalQuestions: questions.length,
      accuracy,
      chapterAnalysis,
      strongestChapters,
      weakestChapters,
      studyRecommendations 
    };

    setExamScore(score);
    setExamFinished(true);

    if (onExamStatsComputed) {
      const chapterStats: ChapterStat[] = EXAM_CHAPTERS_ORDERED.map(({ chapterNumber, title }) => {
        const value = chapterMap.get(chapterNumber) ?? { correct: 0, total: 0, skipped: 0 };
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
      <div className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header with Pass/Fail */}
          <div className={`relative px-6 py-8 text-center ${examScore.pass ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10' : 'bg-gradient-to-br from-amber-500/20 to-amber-600/10'}`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${examScore.pass ? 'bg-emerald-500' : 'bg-amber-500'}`}
            >
              {examScore.pass ? (
                <Check className="w-10 h-10 text-white" />
              ) : (
                <XIcon className="w-10 h-10 text-white" />
              )}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`mt-4 text-2xl font-black ${examScore.pass ? 'text-emerald-600' : 'text-amber-600'}`}
            >
              {examScore.pass ? 'CHÚC MỪNG!' : 'CẦN CỐ GẮNG THÊM'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1 text-sm text-[var(--text-secondary)]"
            >
              {examScore.pass ? 'Bạn đã vượt qua bài thi' : 'Hãy ôn tập thêm để cải thiện'}
            </motion.p>
          </div>

          {/* Score Overview */}
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.5 }}
                  className="text-4xl font-black text-[var(--text-primary)]"
                >
                  {examScore.accuracy}%
                </motion.div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Độ chính xác</div>
              </div>
              <div className="h-12 w-px bg-[var(--border)]" />
              <div className="text-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.6 }}
                  className="text-4xl font-black text-emerald-500"
                >
                  {examScore.correct}
                </motion.div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Đúng</div>
              </div>
              <div className="h-12 w-px bg-[var(--border)]" />
              <div className="text-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.7 }}
                  className="text-4xl font-black text-rose-500"
                >
                  {examScore.incorrect}
                </motion.div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Sai</div>
              </div>
              {examScore.skipped > 0 && (
                <>
                  <div className="h-12 w-px bg-[var(--border)]" />
                  <div className="text-center flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, delay: 0.75 }}
                      className="text-4xl font-black text-amber-500"
                    >
                      {examScore.skipped}
                    </motion.div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">Bỏ qua</div>
                  </div>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${examScore.accuracy}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
              <span>0%</span>
              <span>{examScore.correct}/{examScore.totalQuestions} câu</span>
              <span>100%</span>
            </div>
          </div>

          {/* Chapter Breakdown */}
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs">📊</span>
              Phân tích theo chương
            </h3>
            <div className="space-y-3">
              {examScore.chapterAnalysis.filter(c => c.total > 0).map((chapter, idx) => (
                <motion.div
                  key={chapter.chapterNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[var(--text-secondary)] truncate pr-2 flex-1">
                      {chapter.chapterShort}
                    </span>
                    <span className={`text-xs font-bold ${chapter.accuracy >= 80 ? 'text-emerald-500' : chapter.accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {chapter.accuracy}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${chapter.accuracy}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 1 + idx * 0.1 }}
                      className={`h-full rounded-full ${
                        chapter.accuracy >= 80 ? 'bg-emerald-500' : 
                        chapter.accuracy >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">
                    {chapter.correct}/{chapter.total} câu đúng
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <div className="grid grid-cols-2 gap-4">
              {/* Strengths */}
              {examScore.strongestChapters.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-500 mb-2 flex items-center gap-1.5">
                    <span>💪</span> Điểm mạnh
                  </h4>
                  <div className="space-y-1.5">
                    {examScore.strongestChapters.map(ch => (
                      <div key={ch.chapterNumber} className="bg-emerald-500/10 rounded-lg px-3 py-2">
                        <div className="text-xs font-semibold text-emerald-600">{ch.chapterShort}</div>
                        <div className="text-[10px] text-emerald-500/80">{ch.accuracy}% accuracy</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Weaknesses */}
              {examScore.weakestChapters.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-500 mb-2 flex items-center gap-1.5">
                    <span>📚</span> Cần cải thiện
                  </h4>
                  <div className="space-y-1.5">
                    {examScore.weakestChapters.map(ch => (
                      <div key={ch.chapterNumber} className="bg-amber-500/10 rounded-lg px-3 py-2">
                        <div className="text-xs font-semibold text-amber-600">{ch.chapterShort}</div>
                        <div className="text-[10px] text-amber-500/80">{ch.accuracy}% accuracy</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Study Recommendations */}
          {examScore.studyRecommendations.length > 0 && (
            <div className="px-6 py-5 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs">💡</span>
                Đề xuất học tập
              </h3>
              <div className="space-y-2">
                {examScore.studyRecommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + idx * 0.1 }}
                    className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                  >
                    <span className="text-blue-500 mt-0.5">→</span>
                    <span>{rec}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Warning */}
          {examScore.criticalWrong > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mx-6 mb-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <span className="text-rose-500 text-sm">⚠️</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-rose-500">Câu hỏi nghiêm trọng</div>
                  <div className="text-xs text-rose-500/80 mt-0.5">
                    Bạn đã sai {examScore.criticalWrong} câu nghiêm trọng. Mỗi câu sai sẽ dẫn đến trượt bài thi.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="px-6 py-5 bg-[var(--bg-tertiary)]/50">
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={onRestartExam}
                className="flex-1 bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-4 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80 active:scale-[0.99]"
                whileTap={{ scale: 0.98 }}
              >
                Làm lại bài thi
              </motion.button>
              <motion.button
                type="button"
                onClick={() => window.print()}
                className="px-6 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-4 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80 active:scale-[0.99]"
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">In kết quả</span>
                <span className="sm:hidden">📤</span>
              </motion.button>
            </div>
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
          <div className="px-3 py-1.5 flex items-center justify-between gap-2 mt-2">
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

        {/* Image container - hidden on mobile if no image */}
        <div
          className="h-32 sm:h-40 lg:h-auto flex-1 min-h-0 overflow-hidden relative flex items-center justify-center bg-[var(--bg-tertiary)] cursor-zoom-in lg:flex"
          onClick={() => question.image && setImageEnlarged(true)}
        >
          <AnimatePresence mode="wait">
            {question.image ? (
              <motion.div
                key={`img-${currentQuestionNumber}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="max-h-full max-w-full w-auto h-auto"
              >
                <QuestionImage
                  questionId={question.id}
                  alt="Traffic Situation"
                  className="max-h-full max-w-full w-auto h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
                />
              </motion.div>
            ) : (
              <div className="hidden lg:flex w-full h-full items-center justify-center min-h-[200px]">
                <span className="text-[var(--text-muted)] text-sm">Không có ảnh</span>
              </div>
            )}
          </AnimatePresence>
        </div>
        {/* Image footer - hidden on mobile */}
        {question.image && (
          <div className="hidden lg:flex shrink-0 px-4 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border)] items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)]">{question.chapter}</span>
            {question.isCritical && (
              <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium px-2.5 py-1 rounded-full">
                Nghiêm trọng
              </span>
            )}
          </div>
        )}
      </div>

      {/* ══════════ RIGHT COLUMN: QUESTION + ANSWERS ══════════ */}
      <div className="flex-1 flex flex-col border-t lg:border-t-0 overflow-hidden min-h-0 relative">
        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto lg:pb-24 pb-52">
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
              initial={{ opacity: 0, height: 0, y: 40, scale: 0.85, filter: 'blur(0px)' }}
              animate={{ 
                opacity: isDissolving ? 0 : 1,
                height: isDissolving ? 0 : 'auto',
                y: isDissolving ? 20 : 0,
                scale: isDissolving ? 1.08 : 1,
                filter: isDissolving ? 'blur(12px)' : 'blur(0px)',
              }}
              exit={{ opacity: 0, height: 0, y: 20, scale: 0.95, filter: 'blur(12px)' }}
              transition={{ 
                opacity: { duration: 0.6, ease: 'easeOut' },
                height: { type: 'spring', stiffness: 350, damping: 28 },
                y: { type: 'spring', stiffness: 350, damping: 28 },
                scale: { type: 'spring', stiffness: 350, damping: 28 },
                filter: { duration: 0.6, ease: 'easeOut' },
              }}
              className="shrink-0 lg:relative lg:top-auto lg:left-auto lg:right-auto lg:bottom-auto lg:mx-4 lg:border-t lg:border-[var(--border)] overflow-hidden fixed lg:static bottom-[88px] left-0 right-0 mx-4 border-t border-[var(--border)]"
            >
              <div>
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
        <div className="shrink-0 lg:static fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--bg-secondary)] p-4">
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
            <>
              <motion.button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={!selectedOption || timeLeftSeconds <= 0}
                className="w-full bg-emerald-500 text-white font-bold py-3 rounded-2xl text-sm transition-opacity hover:opacity-80 active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed"
                whileTap={selectedOption ? { scale: 0.98 } : {}}
              >
                Xác nhận & Nộp bài
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* ── Submit Confirmation Dialog ── */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-32 sm:pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitConfirm(false)}
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl mx-4 my-auto"
            >
              <div className="text-center space-y-5 sm:space-y-6">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Nộp bài thi?
                </h3>
                
                {/* Message */}
                <div className="text-sm sm:text-base text-[var(--text-secondary)] space-y-2">
                  <p>
                    Bạn đã trả lời <span className="font-bold text-emerald-500">{answeredCount}</span> / <span className="font-bold">{totalQuestions}</span> câu hỏi.
                  </p>
                  {answeredCount < totalQuestions && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-600">
                      ⚠️ Còn {totalQuestions - answeredCount} câu chưa trả lời
                    </div>
                  )}
                  {answeredCount === totalQuestions && (
                    <p className="text-emerald-500 font-medium">
                      ✓ Bạn đã trả lời tất cả câu hỏi
                    </p>
                  )}
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-2xl text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirm(false);
                      confirmCurrentAnswer();
                    }}
                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-sm transition-colors"
                  >
                    Nộp bài
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Image Lightbox ── */}
      <AnimatePresence>
        {imageEnlarged && question.image && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setImageEnlarged(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Close button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImageEnlarged(false); }}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
            {/* Content */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-4 max-w-[90vw]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Question text above image */}
              <div className="w-full max-w-3xl text-center space-y-2">
                <p className="text-white/50 text-sm font-semibold">
                  Câu {currentQuestionNumber}
                </p>
                <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                  {question.text}
                </p>
              </div>
              {/* Image */}
              <QuestionImage
                questionId={question.id}
                alt="Traffic Situation"
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainContent;

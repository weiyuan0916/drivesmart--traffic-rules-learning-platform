import React, { useMemo } from 'react';
import { Check, X as XIcon, Clock, Target, TrendingUp, AlertTriangle, RotateCcw, Home, Trophy, BookOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Question } from '../types';
import { EXAM_CHAPTERS_ORDERED } from '../services/examGenerator';

interface ResultsAnalyticsModalProps {
  results: {
    correct: number;
    incorrect: number;
    skipped: number;
    totalQuestions: number;
    accuracy: number;
    pass: boolean;
    timeSpentSeconds: number;
  };
  questions: Question[];
  answers: (string | null)[];
  candidateName?: string;
  onClose: () => void;
  onRetry: () => void;
}

interface ChapterAnalysis {
  chapterNumber: number;
  chapter: string;
  chapterShort: string;
  correct: number;
  total: number;
  accuracy: number;
}

const ResultsAnalyticsModal: React.FC<ResultsAnalyticsModalProps> = ({
  results,
  questions,
  answers,
  candidateName = 'Thí sinh',
  onClose,
  onRetry,
}) => {
  const { correct, incorrect, skipped, totalQuestions, accuracy, pass, timeSpentSeconds } = results;

  // Calculate chapter analysis
  const chapterAnalysis = useMemo((): ChapterAnalysis[] => {
    const chapterMap = new Map<number, { correct: number; total: number }>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = answers[i];
      const isCorrect = answer !== null && answer === q.correctAnswer;

      const entry = chapterMap.get(q.chapterNumber) ?? { correct: 0, total: 0 };
      entry.total++;
      if (isCorrect) entry.correct++;
      chapterMap.set(q.chapterNumber, entry);
    }

    return EXAM_CHAPTERS_ORDERED
      .map(({ chapterNumber, title }) => {
        const value = chapterMap.get(chapterNumber) ?? { correct: 0, total: 0 };
        const chapterAccuracy = value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0;
        const shortTitle = title.replace(/^Chương \d+\.\s*/, '');
        return {
          chapterNumber,
          chapter: title,
          chapterShort: shortTitle,
          correct: value.correct,
          total: value.total,
          accuracy: chapterAccuracy,
        };
      })
      .filter(c => c.total > 0)
      .sort((a, b) => b.accuracy - a.accuracy);
  }, [questions, answers]);

  const strongestChapter = chapterAnalysis.find(c => c.accuracy >= 80);
  const weakestChapter = chapterAnalysis.filter(c => c.total > 0).sort((a, b) => a.accuracy - b.accuracy)[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[var(--bg-primary)] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`relative px-6 py-8 text-center ${pass ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '16px 16px'
            }} />
          </div>
          
          <div className="relative">
            {pass ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
              >
                <BookOpen className="w-8 h-8 text-white" />
              </motion.div>
            )}
            
            <h2 className="text-2xl font-black text-white mb-1">
              {pass ? 'Chúc mừng!' : 'Cần cải thiện'}
            </h2>
            <p className="text-white/80 font-medium">
              {pass ? 'Bạn đã vượt qua bài thi' : 'Hãy tiếp tục luyện tập'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto modern-scrollbar">
          <div className="p-6 space-y-6">
            {/* Score overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--bg-secondary)] rounded-2xl p-4 text-center border border-[var(--border)]"
              >
                <div className="text-3xl font-black text-emerald-500 mb-1">{accuracy}%</div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">Độ chính xác</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[var(--bg-secondary)] rounded-2xl p-4 text-center border border-[var(--border)]"
              >
                <div className="text-3xl font-black text-blue-500 mb-1">{correct}</div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">Đúng</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[var(--bg-secondary)] rounded-2xl p-4 text-center border border-[var(--border)]"
              >
                <div className="text-3xl font-black text-rose-500 mb-1">{incorrect}</div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">Sai</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-[var(--bg-secondary)] rounded-2xl p-4 text-center border border-[var(--border)]"
              >
                <div className="text-3xl font-black text-[var(--text-secondary)] mb-1">{formatTime(timeSpentSeconds)}</div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">Thời gian</div>
              </motion.div>
            </div>

            {/* Chapter breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                Phân tích theo chương
              </h3>
              <div className="space-y-3">
                {chapterAnalysis.map((chapter, idx) => (
                  <motion.div
                    key={chapter.chapterNumber}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05 }}
                    className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold flex items-center justify-center">
                          {chapter.chapterNumber}
                        </span>
                        <span className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
                          {chapter.chapterShort}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${
                        chapter.accuracy >= 80 ? 'text-emerald-500' :
                        chapter.accuracy >= 60 ? 'text-amber-500' :
                        'text-rose-500'
                      }`}>
                        {chapter.accuracy}%
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${chapter.accuracy}%` }}
                        transition={{ delay: 0.4 + idx * 0.05, duration: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          chapter.accuracy >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                          chapter.accuracy >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                          'bg-gradient-to-r from-rose-500 to-rose-400'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-[var(--text-muted)]">
                      <span>{chapter.correct}/{chapter.total} câu đúng</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border)]"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                Nhận định
              </h3>
              <div className="space-y-3">
                {strongestChapter && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Điểm mạnh</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {strongestChapter.chapterShort} ({strongestChapter.accuracy}% đúng)
                      </p>
                    </div>
                  </div>
                )}
                
                {weakestChapter && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Cần cải thiện</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {weakestChapter.chapterShort} ({weakestChapter.accuracy}% đúng)
                      </p>
                    </div>
                  </div>
                )}

                {skipped > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Lưu ý</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {skipped} câu chưa trả lời. Hãy chú ý phân bổ thời gian hợp lý.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] p-4">
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold transition-all hover:opacity-80 active:scale-[0.98]"
            >
              <RotateCcw className="w-5 h-5" />
              Làm lại
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-bold transition-all hover:bg-[var(--bg-tertiary)]"
            >
              <Home className="w-5 h-5" />
              Về trang chính
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsAnalyticsModal;

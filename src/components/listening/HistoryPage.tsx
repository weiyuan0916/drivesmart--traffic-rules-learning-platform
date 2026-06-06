import React from 'react';
import { motion } from 'motion/react';
import { Clock, Play, CheckCircle, Star } from 'lucide-react';
import type { ListeningLessonDetail } from '@/types/listening';
import { getCompletedLessons } from '@/services/listeningProgressService';

interface HistoryPageProps {
  onStartPractice: (lesson: ListeningLessonDetail) => void;
}

export default function HistoryPage({ onStartPractice }: HistoryPageProps) {
  const lessons = getCompletedLessons();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return '#00BE7C';
    if (acc >= 50) return '#F97316';
    return '#FF3257';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--lm-text-primary)' }}>
          Practice History
        </h1>
        <p style={{ color: 'var(--lm-text-secondary)' }}>
          {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {lessons.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: 'var(--lm-surface)',
            border: '1px solid var(--lm-border)',
          }}
        >
          <Clock
            size={48}
            style={{ color: 'var(--lm-text-muted)', margin: '0 auto 12px' }}
          />
          <h3 className="font-bold mb-1" style={{ color: 'var(--lm-text-primary)' }}>
            No history yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--lm-text-secondary)' }}>
            Complete your first dictation to start building your history
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...lessons]
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
            .map((lesson, i) => (
              <motion.div
                key={`${lesson.lessonId}-${lesson.completedAt}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md cursor-pointer"
                style={{
                  background: 'var(--lm-surface)',
                  border: '1px solid var(--lm-border)',
                }}
              >
                {/* Accuracy circle */}
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22" cy="22" r="18"
                      fill="none"
                      stroke="var(--lm-border)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="22" cy="22" r="18"
                      fill="none"
                      stroke={getAccuracyColor(lesson.accuracy)}
                      strokeWidth="4"
                      strokeDasharray={`${(lesson.accuracy / 100) * 113} 113`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-xs font-black"
                      style={{ color: getAccuracyColor(lesson.accuracy) }}
                    >
                      {lesson.accuracy}%
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold truncate"
                    style={{ color: 'var(--lm-text-primary)' }}
                  >
                    {lesson.lessonName}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                    <span>{lesson.topicName.replace('Video', '').trim()}</span>
                    <span>•</span>
                    <span>{formatDate(lesson.completedAt)}</span>
                    <span>•</span>
                    <span>{formatDuration(lesson.durationSeconds)}</span>
                  </div>
                </div>

                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                  style={{ background: '#EEEDFB', color: '#35375B' }}
                  aria-label="Practice again"
                >
                  <Play size={16} fill="#35375B" />
                </button>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}

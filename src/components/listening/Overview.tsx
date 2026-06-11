import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, TrendingUp, Clock, Star, ChevronRight, Play } from 'lucide-react';
import type { ListeningTopic, ListeningLessonDetail, ListeningView, CompletedLesson } from '@/types/listening';
import { fetchTopics } from '@/services/listeningApi';
import {
  getRecentLessons,
  getStreakDays,
  getTotalListeningMinutes,
  getAverageAccuracy,
} from '@/services/listeningProgressService';

interface OverviewProps {
  onStartPractice: (lesson: ListeningLessonDetail) => void;
  onNavigate: (view: ListeningView, extra?: { topicSlug?: string; topicName?: string }) => void;
}

export default function Overview({ onNavigate }: OverviewProps) {
  const [topics, setTopics] = useState<ListeningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    streak: getStreakDays(),
    minutes: getTotalListeningMinutes(),
    accuracy: getAverageAccuracy(),
  });
  const recentLessons = getRecentLessons(4);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const popularTopics = topics.slice(0, 4);
  const recommendedTopics = topics.filter((t) => {
    const l = (t.levels || '').toLowerCase();
    return l.includes('a1') || l.includes('a2') || l.includes('beginner');
  }).slice(0, 3);

  const getDifficultyColor = (levels?: string) => {
    if (!levels) return '#9CA3AF';
    const l = levels.toLowerCase();
    // Full-word format from Supabase
    if (l.includes('beginner')) return '#00BE7C';
    if (l.includes('advanced')) return '#EF4444';
    if (l.includes('intermediate')) return '#F97316';
    // CEFR code format from SQLite
    if (l.includes('A1') || l.includes('A2')) return '#00BE7C';
    if (l.includes('B1') || l.includes('B2')) return '#F97316';
    if (l.includes('C1') || l.includes('C2')) return '#EF4444';
    return '#9CA3AF';
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #35375B 0%, #4A4D7A 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,86,50,0.3) 0%, transparent 40%)`,
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Practice Listening to English</h1>
              <p className="text-white/70 text-sm">Dictation exercises from Daily Dictation</p>
            </div>
          </div>
          <p className="text-white/80 text-sm max-w-lg mb-6">
            Improve your English listening skills with thousands of dictation exercises.
            From beginner to advanced, find lessons that match your level.
          </p>
          <button
            onClick={() => onNavigate('topics')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105"
            style={{ background: '#FF5632' }}
          >
            <Play size={16} fill="white" />
            Start Learning
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: <TrendingUp size={18} />,
            value: stats.streak,
            label: 'Day Streak',
            color: '#FF5632',
            bg: '#FFF0ED',
          },
          {
            icon: <Clock size={18} />,
            value: stats.minutes,
            label: 'Minutes',
            color: '#35375B',
            bg: '#EEEDFB',
          },
          {
            icon: <Star size={18} />,
            value: stats.accuracy > 0 ? `${stats.accuracy}%` : '—',
            label: 'Avg Accuracy',
            color: '#00BE7C',
            bg: '#E6FAF3',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--lm-surface, #fff)', border: '1px solid var(--lm-border, #E5E7EB)' }}
          >
            <div
              className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center"
              style={{ background: stat.bg, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="text-xl font-black" style={{ color: 'var(--lm-text-primary)' }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue Learning */}
      {recentLessons.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--lm-text-primary)' }}>
              Continue Learning
            </h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: 'var(--lm-primary, #35375B)' }}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentLessons.slice(0, 2).map((lesson, i) => (
              <motion.div
                key={lesson.lessonId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--lm-surface, #fff)',
                  border: '1px solid var(--lm-border)',
                  boxShadow: 'var(--lm-shadow-sm)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#EEEDFB' }}
                >
                  <BookOpen size={18} style={{ color: '#35375B' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm truncate"
                    style={{ color: 'var(--lm-text-primary)' }}
                  >
                    {lesson.lessonName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                    {lesson.topicName}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: '#00BE7C' }}>
                    {lesson.accuracy}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Topics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--lm-text-primary)' }}>
            Popular Topics
          </h2>
          <button
            onClick={() => onNavigate('topics')}
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: 'var(--lm-primary, #35375B)' }}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl h-32"
                style={{ background: 'var(--lm-surface-raised)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularTopics.map((topic, i) => (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                onClick={() => onNavigate('topic-detail', { topicSlug: topic.slug, topicName: topic.name })}
                className="text-left p-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-md"
                style={{
                  background: 'var(--lm-surface, #fff)',
                  border: '1px solid var(--lm-border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                  style={{
                    background: '#EEEDFB',
                    color: '#35375B',
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div
                  className="font-bold text-sm mb-1 truncate"
                  style={{ color: 'var(--lm-text-primary)' }}
                >
                  {topic.name.replace('Video', '').trim()}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: getDifficultyColor(topic.levels) + '20',
                      color: getDifficultyColor(topic.levels),
                    }}
                  >
                    {(() => {
                      const l = (topic.levels || '').toLowerCase();
                      if (!topic.levels) return 'Mixed';
                      if (l.includes('beginner') && l.includes('advanced')) return 'Mixed';
                      if (l.includes('beginner') && l.includes('intermediate')) return 'Mixed';
                      if (l.includes('advanced')) return 'Advanced';
                      if (l.includes('intermediate')) return 'Intermediate';
                      if (l.includes('beginner')) return 'Beginner';
                      return topic.levels;
                    })()}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                    {topic.lessonCount} lessons
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Topics */}
      <section>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--lm-text-primary)' }}>
          Recommended for Beginners
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl h-24"
                style={{ background: 'var(--lm-surface-raised)' }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recommendedTopics.map((topic, i) => (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                onClick={() => onNavigate('topic-detail', { topicSlug: topic.slug, topicName: topic.name })}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--lm-surface, #fff)',
                  border: '1px solid var(--lm-border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: '#E6FAF3' }}
                >
                  <BookOpen size={20} style={{ color: '#00BE7C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold truncate"
                    style={{ color: 'var(--lm-text-primary)' }}
                  >
                    {topic.name.replace('Video', '').trim()}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--lm-text-muted)' }}>
                    {topic.description || `${topic.lessonCount} lessons available`}
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--lm-text-muted)', flexShrink: 0 }} />
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

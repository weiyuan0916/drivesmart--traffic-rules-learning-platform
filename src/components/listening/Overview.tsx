import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, TrendingUp, Clock, Star, ChevronRight, Play, Globe, Mic, Headphones, Briefcase } from 'lucide-react';
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

// Topic background configurations based on name patterns
const TOPIC_THEMES: Record<string, { gradient: string; icon: React.ReactNode; accent: string }> = {
  default: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: <BookOpen size={20} />,
    accent: '#fff',
  },
  story: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: <BookOpen size={20} />,
    accent: '#fff',
  },
  conversation: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: <Mic size={20} />,
    accent: '#fff',
  },
  kids: {
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: <Headphones size={20} />,
    accent: '#fff',
  },
  toeic: {
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    icon: <Briefcase size={20} />,
    accent: '#fff',
  },
  ielts: {
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    icon: <Globe size={20} />,
    accent: '#333',
  },
  ted: {
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    icon: <Headphones size={20} />,
    accent: '#fff',
  },
  news: {
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    icon: <Globe size={20} />,
    accent: '#333',
  },
  toefl: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: <Briefcase size={20} />,
    accent: '#fff',
  },
};

function getTopicTheme(topicName: string) {
  const name = topicName.toLowerCase();
  if (name.includes('story')) return TOPIC_THEMES.story;
  if (name.includes('conversation')) return TOPIC_THEMES.conversation;
  if (name.includes('kid')) return TOPIC_THEMES.kids;
  if (name.includes('toeic')) return TOPIC_THEMES.toeic;
  if (name.includes('ielts')) return TOPIC_THEMES.ielts;
  if (name.includes('ted')) return TOPIC_THEMES.ted;
  if (name.includes('news')) return TOPIC_THEMES.news;
  if (name.includes('toefl')) return TOPIC_THEMES.toefl;
  return TOPIC_THEMES.default;
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
        style={{
          background: 'linear-gradient(135deg, #35375B 0%, #4A4D7A 50%, #35375B 100%)',
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/assets/img/bg-img/dark-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(53,55,91,0.9) 0%, rgba(74,77,122,0.7) 50%, rgba(53,55,91,0.9) 100%)',
          }}
        />
        {/* Decorative circles */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(255,86,50,0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 shadow-lg"
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
            gradient: 'linear-gradient(135deg, #FF5630 0%, #FF8A66 100%)',
          },
          {
            icon: <Clock size={18} />,
            value: stats.minutes,
            label: 'Minutes',
            gradient: 'linear-gradient(135deg, #35375B 0%, #5A5E8A 100%)',
          },
          {
            icon: <Star size={18} />,
            value: stats.accuracy > 0 ? `${stats.accuracy}%` : '—',
            label: 'Avg Accuracy',
            gradient: 'linear-gradient(135deg, #00BE7C 0%, #4ADE80 100%)',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
            className="rounded-xl p-4 text-center relative overflow-hidden"
            style={{ color: '#fff' }}
          >
            {/* Gradient background */}
            <div
              className="absolute inset-0"
              style={{ background: stat.gradient }}
            />
            {/* Decorative circle */}
            <div
              className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10"
              style={{ background: '#fff' }}
            />
            <div className="relative z-10">
              <div
                className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              >
                {stat.icon}
              </div>
              <div className="text-xl font-black text-white">
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {stat.label}
              </div>
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
            {popularTopics.map((topic, i) => {
              const theme = getTopicTheme(topic.name);
              return (
                <motion.button
                  key={topic.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  onClick={() => onNavigate('topic-detail', { topicSlug: topic.slug, topicName: topic.name })}
                  className="text-left p-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg overflow-hidden relative"
                  style={{
                    background: theme.gradient,
                    border: 'none',
                  }}
                >
                  {/* Decorative circles */}
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                    style={{ background: theme.accent }}
                  />
                  <div
                    className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
                    style={{ background: theme.accent }}
                  />
                  
                  <div
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center relative z-10"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: theme.accent,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {theme.icon}
                  </div>
                  <div
                    className="font-bold text-sm mb-1 truncate relative z-10"
                    style={{ color: theme.accent }}
                  >
                    {topic.name.replace('Video', '').trim()}
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: theme.accent,
                        backdropFilter: 'blur(4px)',
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
                    <span className="text-xs" style={{ color: theme.accent, opacity: 0.8 }}>
                      {topic.lessonCount} lessons
                    </span>
                  </div>
                </motion.button>
              );
            })}
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
            {recommendedTopics.map((topic, i) => {
              const theme = getTopicTheme(topic.name);
              return (
                <motion.button
                  key={topic.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  onClick={() => onNavigate('topic-detail', { topicSlug: topic.slug, topicName: topic.name })}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01] overflow-hidden relative"
                  style={{
                    background: theme.gradient,
                    border: 'none',
                  }}
                >
                  {/* Decorative circles */}
                  <div
                    className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
                    style={{ background: theme.accent }}
                  />
                  
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center relative z-10"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: theme.accent,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {theme.icon}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div
                      className="font-semibold truncate"
                      style={{ color: theme.accent }}
                    >
                      {topic.name.replace('Video', '').trim()}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: theme.accent, opacity: 0.8 }}>
                      {topic.description || `${topic.lessonCount} lessons available`}
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: theme.accent, flexShrink: 0, opacity: 0.8 }} />
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, ChevronRight } from 'lucide-react';
import type { ListeningTopic } from '@/types/listening';
import { fetchTopics } from '@/services/listeningApi';

interface TopicsPageProps {
  onTopicSelect: (slug: string, name: string) => void;
}

const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;
type FilterType = (typeof DIFFICULTY_FILTERS)[number];

const DIFFICULTY_LEVELS: Record<string, FilterType> = {
  A1: 'Beginner', A2: 'Beginner',
  B1: 'Intermediate', B2: 'Intermediate',
  C1: 'Advanced', C2: 'Advanced',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TOPIC_BACKGROUNDS: Record<string, { gradient: string; icon: string }> = {
  short: { gradient: 'from-amber-500/20 to-orange-600/20', icon: '#F59E0B' },
  conversation: { gradient: 'from-emerald-500/20 to-teal-600/20', icon: '#10B981' },
  toeic: { gradient: 'from-blue-500/20 to-indigo-600/20', icon: '#3B82F6' },
  ielts: { gradient: 'from-rose-500/20 to-pink-600/20', icon: '#F43F5E' },
  ted: { gradient: 'from-red-500/20 to-rose-600/20', icon: '#EF4444' },
  news: { gradient: 'from-slate-500/20 to-gray-600/20', icon: '#64748B' },
  toefl: { gradient: 'from-purple-500/20 to-violet-600/20', icon: '#A855F7' },
  story: { gradient: 'from-amber-500/20 to-orange-600/20', icon: '#F59E0B' },
  business: { gradient: 'from-blue-500/20 to-cyan-600/20', icon: '#0EA5E9' },
  travel: { gradient: 'from-sky-500/20 to-blue-600/20', icon: '#0EA5E9' },
  daily: { gradient: 'from-green-500/20 to-emerald-600/20', icon: '#22C55E' },
  culture: { gradient: 'from-yellow-500/20 to-amber-600/20', icon: '#EAB308' },
  interview: { gradient: 'from-violet-500/20 to-purple-600/20', icon: '#8B5CF6' },
  default: { gradient: 'from-indigo-500/20 to-purple-600/20', icon: '#6366F1' },
};

function getTopicBackground(topicName: string) {
  const name = topicName.toLowerCase();
  if (name.includes('short') || name.includes('story')) return TOPIC_BACKGROUNDS.short;
  if (name.includes('conversation') || name.includes('dialog')) return TOPIC_BACKGROUNDS.conversation;
  if (name.includes('toeic')) return TOPIC_BACKGROUNDS.toeic;
  if (name.includes('ielts')) return TOPIC_BACKGROUNDS.ielts;
  if (name.includes('ted')) return TOPIC_BACKGROUNDS.ted;
  if (name.includes('news')) return TOPIC_BACKGROUNDS.news;
  if (name.includes('toefl')) return TOPIC_BACKGROUNDS.toefl;
  if (name.includes('business')) return TOPIC_BACKGROUNDS.business;
  if (name.includes('travel')) return TOPIC_BACKGROUNDS.travel;
  if (name.includes('daily') || name.includes('life')) return TOPIC_BACKGROUNDS.daily;
  if (name.includes('culture') || name.includes('people')) return TOPIC_BACKGROUNDS.culture;
  if (name.includes('interview')) return TOPIC_BACKGROUNDS.interview;
  return TOPIC_BACKGROUNDS.default;
}

function topicLevelsToCategory(levelsStr: string): FilterType | null {
  if (!levelsStr) return null;

  // Normalize: lower case, strip "Levels:" prefix
  const normalized = levelsStr.replace(/Levels:\s*/gi, '').toLowerCase().trim();

  // Format 1: comma-separated full words — "advanced, beginner, intermediate"
  if (normalized.includes(',')) {
    const categories = normalized
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => DIFFICULTY_LEVELS[l])
      .filter(Boolean);

    if (categories.length === 0) return null;
    // Priority: Beginner > Intermediate > Advanced
    if (categories.includes('Beginner')) return 'Beginner';
    if (categories.includes('Intermediate')) return 'Intermediate';
    if (categories.includes('Advanced')) return 'Advanced';
    return categories[0] ?? null;
  }

  // Format 2: dash-separated CEFR codes — "A1-C1" or "A1"
  const parts = normalized.split('-');
  const categories = parts
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => DIFFICULTY_LEVELS[l])
    .filter(Boolean);

  if (categories.length === 0) return null;
  if (categories.includes('Beginner')) return 'Beginner';
  if (categories.includes('Intermediate')) return 'Intermediate';
  if (categories.includes('Advanced')) return 'Advanced';
  return categories[0] ?? null;
}

export default function TopicsPage({ onTopicSelect }: TopicsPageProps) {
  const [topics, setTopics] = useState<ListeningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('All');

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = topics;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }
    if (filter !== 'All') {
      result = result.filter((t) => {
        const level = topicLevelsToCategory(t.levels || '');
        return level === filter;
      });
    }
    return result;
  }, [topics, search, filter]);

  const getDifficultyColor = (levels?: string) => {
    const category = topicLevelsToCategory(levels || '');
    if (category === 'Beginner') return { bg: '#E6FAF3', text: '#00BE7C' };
    if (category === 'Intermediate') return { bg: '#FFF7ED', text: '#F97316' };
    if (category === 'Advanced') return { bg: '#FFF0ED', text: '#FF5632' };
    return { bg: '#EEEDFB', text: '#35375B' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--lm-text-primary)' }}>
          Topics
        </h1>
        <p style={{ color: 'var(--lm-text-secondary)' }}>
          Choose a topic to start practicing
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border"
          style={{ background: 'var(--lm-surface)', borderColor: 'var(--lm-border)' }}
        >
          <Search size={18} style={{ color: 'var(--lm-text-muted)' }} />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--lm-text-primary)' }}
          />
        </div>
        <div className="flex gap-2">
          {DIFFICULTY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: filter === f ? 'var(--lm-primary, #35375B)' : 'var(--lm-surface)',
                color: filter === f ? '#fff' : 'var(--lm-text-secondary)',
                border: '1px solid',
                borderColor: filter === f ? 'var(--lm-primary, #35375B)' : 'var(--lm-border)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Topics grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl h-40"
              style={{ background: 'var(--lm-surface-raised)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={48} style={{ color: 'var(--lm-text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--lm-text-secondary)' }}>No topics found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((topic, i) => {
            const colors = getDifficultyColor(topic.levels);
            const bgStyle = getTopicBackground(topic.name);
            const displayName = topic.name.replace('Video', '').trim();
            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onTopicSelect(topic.slug, topic.name)}
                className="relative text-left p-5 rounded-xl transition-all hover:shadow-md overflow-hidden"
                style={{
                  background: 'var(--lm-surface)',
                  border: '1px solid var(--lm-border)',
                }}
              >
                {/* Gradient background overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${bgStyle.gradient} opacity-60 dark:opacity-40`}
                />

                {/* Large watermark text */}
                <div className="absolute bottom-0 right-0 pointer-events-none select-none">
                  <span
                    className="text-[80px] lg:text-[100px] font-black opacity-[0.06] dark:opacity-[0.04] line-clamp-1"
                    style={{ color: bgStyle.icon }}
                  >
                    {displayName.split(' ')[0]}
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: bgStyle.icon + '20' }}
                    >
                      <BookOpen size={20} style={{ color: bgStyle.icon }} />
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--lm-text-muted)' }} />
                  </div>
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: 'var(--lm-text-primary)' }}
                  >
                    {displayName}
                  </h3>
                  <p
                    className="text-xs mb-3 line-clamp-2"
                    style={{ color: 'var(--lm-text-secondary)' }}
                  >
                    {topic.description || `${topic.lessonCount} lessons`}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {(() => {
                        if (!topic.levels) return 'Mixed';
                        const normalized = topic.levels.toLowerCase();
                        if (normalized.includes('beginner') && normalized.includes('advanced')) return 'Mixed';
                        if (normalized.includes('beginner') && normalized.includes('intermediate')) return 'Mixed';
                        if (normalized.includes('advanced')) return 'Advanced';
                        if (normalized.includes('intermediate')) return 'Intermediate';
                        if (normalized.includes('beginner')) return 'Beginner';
                        return topic.levels;
                      })()}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                      {topic.lessonCount} lessons
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

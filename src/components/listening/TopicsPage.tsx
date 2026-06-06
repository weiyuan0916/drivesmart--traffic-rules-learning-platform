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
  A1: 'Beginner',
  A2: 'Beginner',
  B1: 'Intermediate',
  B2: 'Intermediate',
  C1: 'Advanced',
};

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
        const level = DIFFICULTY_LEVELS[t.levels?.split('-')[0]?.trim() || ''] || '';
        return level === filter;
      });
    }
    return result;
  }, [topics, search, filter]);

  const getDifficultyColor = (levels?: string) => {
    const first = levels?.split('-')[0]?.trim() || '';
    if (first === 'A1' || first === 'A2') return { bg: '#E6FAF3', text: '#00BE7C' };
    if (first === 'B1' || first === 'B2') return { bg: '#FFF7ED', text: '#F97316' };
    if (first === 'C1') return { bg: '#FFF0ED', text: '#FF5632' };
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
            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onTopicSelect(topic.slug, topic.name)}
                className="text-left p-5 rounded-xl transition-all hover:shadow-md"
                style={{
                  background: 'var(--lm-surface)',
                  border: '1px solid var(--lm-border)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: '#EEEDFB' }}
                  >
                    <BookOpen size={20} style={{ color: '#35375B' }} />
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--lm-text-muted)' }} />
                </div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ color: 'var(--lm-text-primary)' }}
                >
                  {topic.name.replace('Video', '').trim()}
                </h3>
                <p
                  className="text-xs mb-3 line-clamp-2"
                  style={{ color: 'var(--lm-text-secondary)' }}
                >
                  {topic.description || `${topic.lessonCount} lessons`}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {topic.levels || 'Mixed'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--lm-text-muted)' }}>
                    {topic.lessonCount} lessons
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

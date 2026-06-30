import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ChevronRight, BookOpen, Headphones, CheckCircle, Play } from 'lucide-react';
import type { ListeningSection, ListeningLesson, ListeningLessonDetail } from '@/types/listening';
import { fetchTopicDetail, fetchLessonDetail, fetchLessonDetailBySlug } from '@/services/listeningApi';

interface TopicDetailPageProps {
  topicSlug: string;
  topicName?: string;
  lessonSlug?: string;
  onBack: () => void;
  onStartPractice: (lesson: ListeningLessonDetail) => void;
}

export default function TopicDetailPage({
  topicSlug,
  topicName: topicNameProp,
  lessonSlug,
  onBack,
  onStartPractice,
}: TopicDetailPageProps) {
  const [sections, setSections] = useState<ListeningSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<ListeningLesson | null>(null);
  const [lessonDetail, setLessonDetail] = useState<ListeningLessonDetail | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [topicName, setTopicName] = useState<string>(topicNameProp || '');

  // Fetch topic name if not provided (direct URL access)
  useEffect(() => {
    if (topicNameProp) {
      setTopicName(topicNameProp);
      return;
    }
    // Fetch topic info from API
    fetch(`${import.meta.env.VITE_LISTENING_API_URL || '/api/v1/listening'}/topics/${topicSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setTopicName(data.name);
      })
      .catch(console.error);
  }, [topicSlug, topicNameProp]);

  // Fetch lesson by slug if provided (for direct URL access)
  useEffect(() => {
    if (lessonSlug) {
      setLoadingLesson(true);
      fetchLessonDetailBySlug(lessonSlug)
        .then(setLessonDetail)
        .catch(console.error)
        .finally(() => setLoadingLesson(false));
    }
  }, [lessonSlug]);

  // Navigate to practice page once lesson is loaded
  // Trigger when lessonDetail changes to a valid lesson
  const hasNavigatedRef = useRef<string | number | null>(null);
  useEffect(() => {
    if (lessonDetail && hasNavigatedRef.current !== lessonDetail.id) {
      hasNavigatedRef.current = lessonDetail.id;
      onStartPractice(lessonDetail);
    }
  }, [lessonDetail, onStartPractice]);

  useEffect(() => {
    setLoading(true);
    fetchTopicDetail(topicSlug)
      .then(setSections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [topicSlug]);

  const toggleSection = (id: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLessonSelect = async (lesson: ListeningLesson) => {
    setSelectedLesson(lesson);
    setLoadingLesson(true);
    try {
      // Use slug if available, fallback to ID
      const detail = lesson.slug 
        ? await fetchLessonDetailBySlug(lesson.slug)
        : await fetchLessonDetail(lesson.id);
      setLessonDetail(detail);
      // Navigation will be triggered by useEffect when lessonDetail changes
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoadingLesson(false);
    }
  };

  const getLevelColor = (level?: string) => {
    if (!level) return '#9CA3AF';
    const normalized = level.toLowerCase();
    if (normalized === 'a1' || normalized === 'a2' || normalized === 'beginner') return '#00BE7C';
    if (normalized === 'b1' || normalized === 'b2' || normalized === 'intermediate') return '#F97316';
    if (normalized === 'c1' || normalized === 'c2' || normalized === 'advanced') return '#FF5632';
    return '#9CA3AF';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--lm-text-primary)' }}>
          {topicName.replace('Video', '').trim()}
        </h1>
        <p style={{ color: 'var(--lm-text-secondary)' }}>
          {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} lessons across{' '}
          {sections.length} sections
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl overflow-hidden"
              style={{ background: 'var(--lm-surface)', border: '1px solid var(--lm-border)' }}
            >
              <div className="h-14 bg-[var(--lm-surface-raised)]" />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded bg-[var(--lm-surface-raised)] w-3/4" />
                <div className="h-4 rounded bg-[var(--lm-surface-raised)] w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, si) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.05 }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'var(--lm-surface)',
                  border: '1px solid var(--lm-border)',
                }}
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-[var(--lm-surface-raised)]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: getLevelColor(section.vocabLevel) + '20',
                          color: getLevelColor(section.vocabLevel),
                        }}
                      >
                        {section.vocabLevel || 'Mixed'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--lm-text-primary)' }}>
                      {section.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--lm-text-muted)' }}>
                      {section.lessons?.length || 0} lessons
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={20} style={{ color: 'var(--lm-text-muted)' }} />
                  ) : (
                    <ChevronRight size={20} style={{ color: 'var(--lm-text-muted)' }} />
                  )}
                </button>

                {/* Lesson list */}
                {isExpanded && section.lessons && (
                  <div className="border-t" style={{ borderColor: 'var(--lm-border)' }}>
                    {section.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--lm-surface-raised)] border-b last:border-b-0"
                        style={{ borderColor: 'var(--lm-border)' }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: lesson.hasTranscript ? '#E6FAF3' : '#FFF7ED',
                          }}
                        >
                          {lesson.hasTranscript ? (
                            <CheckCircle size={14} style={{ color: '#00BE7C' }} />
                          ) : (
                            <Headphones size={14} style={{ color: '#F97316' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium truncate"
                            style={{ color: 'var(--lm-text-primary)' }}
                          >
                            {lesson.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {lesson.vocabLevel && (
                              <span
                                className="text-xs"
                                style={{ color: getLevelColor(lesson.vocabLevel) }}
                              >
                                {lesson.vocabLevel}
                              </span>
                            )}
                            {lesson.hasAudio && (
                              <span
                                className="text-xs flex items-center gap-1"
                                style={{ color: 'var(--lm-text-muted)' }}
                              >
                                <Headphones size={10} /> Audio
                              </span>
                            )}
                          </div>
                        </div>
                        <Play
                          size={16}
                          fill="var(--lm-primary)"
                          style={{ color: 'var(--lm-primary)', flexShrink: 0 }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

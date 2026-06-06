import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { ArrowLeft, Headphones, BookOpen, BarChart2, Trophy, Bookmark, Clock, Home } from 'lucide-react';
import type { ListeningLessonDetail, ListeningView } from '@/types/listening';
import Overview from './Overview';
import TopicsPage from './TopicsPage';
import TopicDetailPage from './TopicDetailPage';
import PracticePage from './PracticePage';
import ProgressPage from './ProgressPage';
import LeaderboardPage from './LeaderboardPage';
import BookmarksPage from './BookmarksPage';
import HistoryPage from './HistoryPage';

interface ListeningModuleProps {
  onBack: () => void;
}

interface NavigationState {
  currentView: ListeningView;
  topicSlug?: string;
  topicName?: string;
  lesson?: ListeningLessonDetail;
}

const NAV_ITEMS: { view: ListeningView; label: string; icon: React.ReactNode }[] = [
  { view: 'overview', label: 'Overview', icon: <Home size={16} /> },
  { view: 'topics', label: 'Topics', icon: <BookOpen size={16} /> },
  { view: 'progress', label: 'Progress', icon: <BarChart2 size={16} /> },
  { view: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
  { view: 'bookmarks', label: 'Bookmarks', icon: <Bookmark size={16} /> },
  { view: 'history', label: 'History', icon: <Clock size={16} /> },
];

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function ListeningModule({ onBack }: ListeningModuleProps) {
  const [nav, setNav] = useState<NavigationState>({ currentView: 'overview' });

  const navigate = useCallback(
    (view: ListeningView, extra?: Partial<NavigationState>) => {
      setNav((prev) => ({ ...prev, currentView: view, ...extra }));
    },
    [],
  );

  const goToPractice = useCallback((lesson: ListeningLessonDetail) => {
    setNav((prev) => ({ ...prev, currentView: 'practice', lesson }));
  }, []);

  const goToTopicDetail = useCallback((slug: string, name: string) => {
    setNav((prev) => ({ ...prev, currentView: 'topic-detail', topicSlug: slug, topicName: name }));
  }, []);

  const renderPage = () => {
    switch (nav.currentView) {
      case 'overview':
        return (
          <Overview
            onStartPractice={goToPractice}
            onNavigate={navigate}
          />
        );
      case 'topics':
        return <TopicsPage onTopicSelect={goToTopicDetail} />;
      case 'topic-detail':
        return (
          <TopicDetailPage
            topicSlug={nav.topicSlug!}
            topicName={nav.topicName!}
            onBack={() => navigate('topics')}
            onStartPractice={goToPractice}
          />
        );
      case 'practice':
        return (
          <PracticePage
            lesson={nav.lesson!}
            onBack={() => navigate(nav.topicSlug ? 'topic-detail' : 'overview', { topicSlug: nav.topicSlug, topicName: nav.topicName })}
          />
        );
      case 'progress':
        return <ProgressPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'bookmarks':
        return <BookmarksPage onStartPractice={goToPractice} />;
      case 'history':
        return <HistoryPage onStartPractice={goToPractice} />;
      default:
        return null;
    }
  };

  const showNav = nav.currentView !== 'practice';

  return (
    <div
      className="listening-root flex flex-col"
      style={{ background: 'var(--lm-bg, #F5F6F8)', minHeight: '100dvh' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          background: 'color-mix(in srgb, var(--lm-surface, #fff) 90%, transparent)',
          borderColor: 'var(--lm-border, #E5E7EB)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={nav.currentView === 'overview' ? onBack : () => {
              if (nav.currentView === 'topic-detail') navigate('topics');
              else if (nav.currentView === 'practice') navigate(nav.topicSlug ? 'topic-detail' : 'overview', { topicSlug: nav.topicSlug, topicName: nav.topicName });
              else navigate('overview');
            }}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--lm-surface-raised)]"
            style={{ color: 'var(--lm-text-secondary)' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--lm-primary, #35375B)' }}
            >
              <Headphones size={16} className="text-white" />
            </div>
            <span
              className="font-bold text-base"
              style={{ color: 'var(--lm-text-primary, #111827)' }}
            >
              Practice Listening
            </span>
          </div>

          <div className="flex-1" />

          {/* Desktop nav */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.view}
                  onClick={() => navigate(item.view)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background:
                      nav.currentView === item.view
                        ? 'var(--lm-primary, #35375B)'
                        : 'transparent',
                    color:
                      nav.currentView === item.view
                        ? '#fff'
                        : 'var(--lm-text-secondary, #6B7280)',
                  }}
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile nav */}
        {showNav && (
          <div className="md:hidden flex overflow-x-auto px-4 pb-2 gap-1 overscroll-x-contain" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`.md\\:hidden::-webkit-scrollbar { display: none; }`}</style>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  background:
                    nav.currentView === item.view
                      ? 'var(--lm-primary, #35375B)'
                      : 'var(--lm-surface-raised)',
                  color:
                    nav.currentView === item.view
                      ? '#fff'
                      : 'var(--lm-text-secondary, #6B7280)',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <div className="flex-1 min-h-0 flex flex-col" style={{ overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={nav.currentView + (nav.topicSlug || '') + (nav.lesson?.id || '')}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6 w-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

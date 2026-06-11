import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  ArrowLeft, Headphones, BookOpen, BarChart2, Trophy,
  Bookmark, Clock, Home, Menu, X, TrendingUp,
} from 'lucide-react';
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

// ─────────────────────────────────────────────────────────────
// Navigation items — flat array for both desktop sidebar & mobile bar
// ─────────────────────────────────────────────────────────────
interface NavItem {
  view: ListeningView;
  label: string;
  icon: React.ReactNode;
  iconFilled?: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'overview', label: 'Home', icon: <Home size={20} />, iconFilled: <Home size={20} /> },
  { view: 'topics', label: 'Topics', icon: <BookOpen size={20} />, iconFilled: <BookOpen size={20} /> },
  { view: 'progress', label: 'Progress', icon: <TrendingUp size={20} />, iconFilled: <TrendingUp size={20} /> },
  { view: 'leaderboard', label: 'Ranks', icon: <Trophy size={20} />, iconFilled: <Trophy size={20} /> },
  { view: 'history', label: 'History', icon: <Clock size={20} />, iconFilled: <Clock size={20} /> },
  { view: 'bookmarks', label: 'Saved', icon: <Bookmark size={20} />, iconFilled: <Bookmark size={20} /> },
];

const NAV_BOTTOM_ITEMS = NAV_ITEMS.slice(0, 5);

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

// ─────────────────────────────────────────────────────────────
// Desktop sidebar nav item
// ─────────────────────────────────────────────────────────────
function SidebarNavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
      style={{
        background: isActive ? 'var(--lm-primary)' : 'transparent',
        color: isActive ? '#fff' : 'var(--lm-text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = 'var(--lm-surface-raised)';
          (e.currentTarget as HTMLElement).style.color = 'var(--lm-text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--lm-text-secondary)';
        }
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {item.icon}
      </span>
      <span>{item.label}</span>
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile bottom tab bar item
// ─────────────────────────────────────────────────────────────
function BottomNavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[52px] transition-colors"
      style={{
        color: isActive ? 'var(--lm-primary)' : 'var(--lm-text-muted)',
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {item.icon}
      </span>
      <span className="text-[10px] font-semibold leading-none">{item.label}</span>
      {isActive && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full -mt-0"
          style={{ background: 'var(--lm-primary)' }}
          layoutId="bottom-active"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main ListeningModule component
// ─────────────────────────────────────────────────────────────
export default function ListeningModule({ onBack }: ListeningModuleProps) {
  const [nav, setNav] = useState<NavigationState>({ currentView: 'overview' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useCallback(
    (view: ListeningView, extra?: Partial<NavigationState>) => {
      setNav((prev) => ({ ...prev, currentView: view, ...extra }));
      setSidebarOpen(false);
    },
    [],
  );

  const goToPractice = useCallback((lesson: ListeningLessonDetail) => {
    setNav((prev) => ({ ...prev, currentView: 'practice', lesson }));
    setSidebarOpen(false);
  }, []);

  const goToTopicDetail = useCallback((slug: string, name: string) => {
    setNav((prev) => ({ ...prev, currentView: 'topic-detail', topicSlug: slug, topicName: name }));
    setSidebarOpen(false);
  }, []);

  const handleBack = () => {
    if (nav.currentView === 'topic-detail') navigate('topics');
    else if (nav.currentView === 'practice') navigate(nav.topicSlug ? 'topic-detail' : 'overview', { topicSlug: nav.topicSlug, topicName: nav.topicName });
    else if (nav.currentView === 'overview') onBack();
    else navigate('overview');
  };

  const showShellNav = nav.currentView !== 'practice';
  const isTopLevel = nav.currentView === 'overview' || nav.currentView === 'topics' || nav.currentView === 'progress' || nav.currentView === 'leaderboard' || nav.currentView === 'history' || nav.currentView === 'bookmarks';

  const renderPage = () => {
    switch (nav.currentView) {
      case 'overview':
        return <Overview onStartPractice={goToPractice} onNavigate={navigate} />;
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

  // ─────────────────────────────────────────────────────────────
  // HEADER — visible on all breakpoints
  // ─────────────────────────────────────────────────────────────
  const Header = (
    <header
      className="sticky top-0 z-30 flex-shrink-0 border-b backdrop-blur-md"
      style={{
        background: 'color-mix(in srgb, var(--lm-surface, #fff) 95%, transparent)',
        borderColor: 'var(--lm-border)',
        height: '56px',
      }}
    >
      <div
        className="h-full flex items-center gap-2 px-4"
        style={{ maxWidth: '100%' }}
      >
        {/* Back / Menu button */}
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          style={{
            background: 'var(--lm-surface-raised)',
            color: 'var(--lm-text-primary)',
          }}
          aria-label="Go back"
        >
          {sidebarOpen ? <X size={18} /> : <ArrowLeft size={18} />}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--lm-primary)' }}
          >
            <Headphones size={14} className="text-white" />
          </div>
          <span
            className="font-bold text-sm truncate hidden sm:block"
            style={{ color: 'var(--lm-text-primary)' }}
          >
            VinaListen
          </span>
        </div>

        <div className="flex-1" />

        {/* Desktop: inline nav (replaces sidebar when viewport allows) */}
        {showShellNav && (
          <nav
            className="hidden xl:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = nav.currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => navigate(item.view)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: isActive ? 'var(--lm-primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--lm-text-secondary)',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="w-4 h-4">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Mobile menu toggle */}
        {showShellNav && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: sidebarOpen ? 'var(--lm-primary)' : 'var(--lm-surface-raised)',
              color: sidebarOpen ? '#fff' : 'var(--lm-text-primary)',
            }}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>
    </header>
  );

  // ─────────────────────────────────────────────────────────────
  // MOBILE SIDEBAR OVERLAY (slides in from left on tablet)
  // ─────────────────────────────────────────────────────────────
  const SidebarOverlay = sidebarOpen && showShellNav && (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 xl:hidden"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar panel */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="fixed left-0 top-0 bottom-0 z-50 w-[280px] flex flex-col overflow-hidden xl:hidden"
        style={{
          background: 'var(--lm-surface)',
          borderRight: '1px solid var(--lm-border)',
        }}
        aria-label="Navigation sidebar"
      >
        {/* Sidebar header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--lm-border)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--lm-primary)' }}
          >
            <Headphones size={18} className="text-white" />
          </div>
          <div>
            <div
              className="font-bold text-sm"
              style={{ color: 'var(--lm-text-primary)' }}
            >
              VinaListen
            </div>
            <div
              className="text-xs"
              style={{ color: 'var(--lm-text-muted)' }}
            >
              Practice Listening
            </div>
          </div>
        </div>

        {/* Sidebar nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const isActive = nav.currentView === item.view;
            return (
              <SidebarNavItem
                key={item.view}
                item={item}
                isActive={isActive}
                onClick={() => navigate(item.view)}
              />
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div
          className="px-5 py-4 border-t text-xs"
          style={{
            borderColor: 'var(--lm-border)',
            color: 'var(--lm-text-muted)',
          }}
        >
          Practice Listening to English
        </div>
      </motion.aside>
    </>
  );

  // ─────────────────────────────────────────────────────────────
  // DESKTOP SIDEBAR (always visible at xl+)
  // ─────────────────────────────────────────────────────────────
  const DesktopSidebar = showShellNav ? (
    <aside
      className="hidden xl:flex flex-col w-[224px] shrink-0 border-r overflow-hidden"
      style={{
        background: 'var(--lm-surface)',
        borderColor: 'var(--lm-border)',
        height: 'calc(100dvh - 56px)',
        position: 'sticky',
        top: '56px',
      }}
      aria-label="Navigation sidebar"
    >
      {/* Sidebar nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const isActive = nav.currentView === item.view;
          return (
            <SidebarNavItem
              key={item.view}
              item={item}
              isActive={isActive}
              onClick={() => navigate(item.view)}
            />
          );
        })}
      </nav>
    </aside>
  ) : null;

  // ─────────────────────────────────────────────────────────────
  // MOBILE BOTTOM TAB BAR
  // ─────────────────────────────────────────────────────────────
  const BottomBar = showShellNav ? (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch overflow-hidden"
      style={{
        background: 'var(--lm-surface)',
        borderTop: '1px solid var(--lm-border)',
        height: '60px',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Mobile navigation"
    >
      {NAV_BOTTOM_ITEMS.map((item) => {
        const isActive = nav.currentView === item.view;
        return (
          <BottomNavItem
            key={item.view}
            item={item}
            isActive={isActive}
            onClick={() => navigate(item.view)}
          />
        );
      })}
    </nav>
  ) : null;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="listening-root flex flex-col"
      style={{
        background: 'var(--lm-bg, #F5F6F8)',
        minHeight: '100dvh',
      }}
    >
      {/* Header */}
      {Header}

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {SidebarOverlay}
      </AnimatePresence>

      {/* Body: sidebar + scrollable content */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        {DesktopSidebar}

        {/* Main scrollable content */}
        <main
          className="flex-1 min-w-0 flex flex-col"
          style={{
            paddingBottom: showShellNav ? '68px' : '0',
          }}
        >
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={nav.currentView + (nav.topicSlug || '') + (nav.lesson?.id || '')}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-w-6xl mx-auto px-4 py-6 w-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <AnimatePresence>
        {BottomBar}
      </AnimatePresence>
    </div>
  );
}

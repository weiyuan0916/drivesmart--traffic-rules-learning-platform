import React, { useCallback, useState, useEffect, createContext, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft, Headphones, BookOpen, BarChart2, Trophy,
  Bookmark, Clock, Home, Menu, X, TrendingUp, Globe,
} from 'lucide-react';
import type { ListeningLessonDetail, ListeningView } from '@/types/listening'
import type { BbcLesson } from '../../features/listening/types/bbc';
import { BbcDarkThemeShell } from '../../features/listening/components/BbcDarkThemeShell';
import Overview from './Overview';
import TopicsPage from './TopicsPage';
import TopicDetailPage from './TopicDetailPage';
import PracticePage from './PracticePage';
import ProgressPage from './ProgressPage';
import LeaderboardPage from './LeaderboardPage';
import BookmarksPage from './BookmarksPage';
import HistoryPage from './HistoryPage';

export type { ListeningView } from '@/types/listening'

// ─────────────────────────────────────────────────────────────────
// Navigation context — used by child pages to navigate within
// ListeningModule without touching react-router.
// ─────────────────────────────────────────────────────────────────
interface ListeningNavigationContextValue {
  navigate: (view: ListeningView, extra?: { slug?: string; topicSlug?: string; topicName?: string }) => void
  goBack: () => void
}

export const ListeningNavigationContext = createContext<ListeningNavigationContextValue | null>(null)

export function useListeningNavigation(): ListeningNavigationContextValue {
  const ctx = useContext(ListeningNavigationContext)
  if (!ctx) throw new Error('useListeningNavigation must be used inside ListeningModule')
  return ctx
}

const BbcLessonListPage = React.lazy(() => import('../../features/listening/pages/bbc/BbcLessonListPage'));
const BbcPracticePage = React.lazy(() => import('../../features/listening/pages/bbc/BbcPracticePage'));
const BbcWorkspacePage = React.lazy(() => import('../../features/listening/pages/bbc/BbcWorkspacePage'));
const BbcMicroDictationPage = React.lazy(() => import('../../features/listening/pages/bbc/BbcMicroDictationPage'));
const Skeleton = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
  </div>
);

const bbcQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const isBbcView = (view: ListeningView) =>
  view === 'bbc-list' || view === 'bbc-practice' || view === 'bbc-workspace' || view === 'bbc-dictation';

interface ListeningModuleProps {
  onBack: () => void;
  initialBbcSlug?: string;
}

interface NavigationState {
  currentView: ListeningView;
  topicSlug?: string;
  topicName?: string;
  lesson?: ListeningLessonDetail;
  lessonSlug?: string;
  dictationLesson?: BbcLesson;
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
  { view: 'topics', label: 'Exercises', icon: <BookOpen size={20} />, iconFilled: <BookOpen size={20} /> },
  { view: 'bbc-list', label: 'BBC', icon: <Globe size={20} />, iconFilled: <Globe size={20} /> },
  { view: 'progress', label: 'Progress', icon: <TrendingUp size={20} />, iconFilled: <TrendingUp size={20} /> },
  { view: 'leaderboard', label: 'Ranks', icon: <Trophy size={20} />, iconFilled: <Trophy size={20} /> },
  { view: 'history', label: 'History', icon: <Clock size={20} />, iconFilled: <Clock size={20} /> },
  { view: 'bookmarks', label: 'Saved', icon: <Bookmark size={20} />, iconFilled: <Bookmark size={20} /> },
];

const NAV_BOTTOM_ITEMS = NAV_ITEMS.slice(0, 5);

// Helper to check if Exercises menu item is active (including child views)
const isExercisesActive = (currentView: ListeningView) =>
  currentView === 'topics' || currentView === 'topic-detail' || currentView === 'practice';

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
// URL → NavigationState mapper (used both for initial state
// and for useEffect re-sync when URL changes)
// ─────────────────────────────────────────────────────────────
function urlToNavState(pathname: string): NavigationState {
  const bbcDictationMatch = pathname.match(/^\/listening\/bbc\/([^/]+)\/dictation$/);
  if (bbcDictationMatch) {
    return { currentView: 'bbc-dictation', topicSlug: bbcDictationMatch[1] };
  }
  const bbcLearnMatch = pathname.match(/^\/listening\/bbc\/([^/]+)\/learn$/);
  if (bbcLearnMatch) {
    return { currentView: 'bbc-practice', topicSlug: bbcLearnMatch[1] };
  }
  const bbcPracticeMatch = pathname.match(/^\/listening\/bbc\/([^/]+)\/practice$/);
  if (bbcPracticeMatch) {
    return { currentView: 'bbc-workspace', topicSlug: bbcPracticeMatch[1] };
  }
  if (/^\/listening\/bbc$/.test(pathname)) {
    return { currentView: 'bbc-list' };
  }
  if (pathname.startsWith('/listening/topics')) {
    // Both topic-detail and practice use the same URL pattern: /listening/topics/:topicSlug/:lessonSlug
    // The difference is that practice view has lesson data in nav.lesson
    const practiceMatch = pathname.match(/^\/listening\/topics\/([^/]+)\/([^/]+)$/);
    if (practiceMatch) {
      const topicSlug = practiceMatch[1];
      const lessonSlug = practiceMatch[2];
      return { currentView: 'topic-detail', topicSlug, lessonSlug };
    }
    // Topic detail without lesson: /listening/topics/:topicSlug
    const topicMatch = pathname.match(/^\/listening\/topics\/([^/]+)$/);
    if (topicMatch) {
      return { currentView: 'topic-detail', topicSlug: topicMatch[1] };
    }
    return { currentView: 'topics' };
  }
  if (pathname.startsWith('/listening/progress')) return { currentView: 'progress' };
  if (pathname.startsWith('/listening/leaderboard')) return { currentView: 'leaderboard' };
  if (pathname.startsWith('/listening/bookmarks')) return { currentView: 'bookmarks' };
  if (pathname.startsWith('/listening/history')) return { currentView: 'history' };
  if (pathname.startsWith('/listening/dashboard')) return { currentView: 'overview' };
  return { currentView: 'overview' };
}

// ─────────────────────────────────────────────────────────────
// Main ListeningModule component
// ─────────────────────────────────────────────────────────────
export default function ListeningModule({ onBack }: ListeningModuleProps) {
  const location = useLocation()
  // Initialize state synchronously from URL — no render flash
  const [nav, setNav] = useState<NavigationState>(() => urlToNavState(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastLessonSlugRef = useRef<string | undefined>(undefined);

  // Track URL changes
  // When TopicDetailPage loads a lesson and calls onStartPractice, it sets nav.lesson
  // We use lessonSlug to determine the view: if lesson is loaded, show practice
  useEffect(() => {
    const parsed = urlToNavState(location.pathname);
    // Only update if URL has changed or we're navigating to a different lesson
    if (parsed.lessonSlug !== lastLessonSlugRef.current) {
      lastLessonSlugRef.current = parsed.lessonSlug;
      setNav((prev) => ({
        ...prev,
        ...parsed,
        // If URL has lessonSlug and nav already has the same lesson loaded, keep practice view
        currentView: parsed.lessonSlug && prev.lesson && parsed.lessonSlug === prev.lesson.slug ? 'practice' : parsed.currentView,
      }));
    }
  }, [location.pathname]);

  // ─────────────────────────────────────────────────────────────
  // view → URL path mapping (used by navigate)
  // ─────────────────────────────────────────────────────────────
  const viewToPath = (view: ListeningView, extra?: Partial<NavigationState>): string => {
    switch (view) {
      case 'overview': return '/listening';
      case 'topics': return '/listening/topics';
      case 'topic-detail': return `/listening/topics/${extra?.topicSlug || nav.topicSlug || ''}`;
      case 'practice': {
        const topicSlug = extra?.topicSlug || nav.topicSlug;
        const lessonSlug = extra?.lessonSlug || nav.lessonSlug || nav.lesson?.slug;
        if (!topicSlug || !lessonSlug) return '/listening';
        return `/listening/topics/${topicSlug}/${lessonSlug}`;
      }
      case 'progress': return '/listening/progress';
      case 'leaderboard': return '/listening/leaderboard';
      case 'bookmarks': return '/listening/bookmarks';
      case 'history': return '/listening/history';
      case 'bbc-list': return '/listening/bbc';
      case 'bbc-practice': return `/listening/bbc/${extra?.topicSlug || nav.topicSlug}/learn`;
      case 'bbc-workspace': return `/listening/bbc/${extra?.topicSlug || nav.topicSlug}/practice`;
      case 'bbc-dictation': return `/listening/bbc/${extra?.topicSlug || nav.topicSlug}/dictation`;
      default: return '/listening';
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Navigation: update both internal state AND URL for persistence
  // ─────────────────────────────────────────────────────────────
  const navigate = useCallback(
    (view: ListeningView, extra?: Partial<NavigationState>) => {
      const path = viewToPath(view, extra);
      // Update URL for reload persistence
      window.history.pushState({}, '', path);
      setNav((prev) => ({ ...prev, currentView: view, topicSlug: extra?.topicSlug ?? prev.topicSlug, topicName: extra?.topicName ?? prev.topicName, lesson: extra?.lesson ?? prev.lesson }));
      setSidebarOpen(false);
    },
    [],
  );

  // Helper to generate slug from lesson name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const goToPractice = useCallback((lesson: ListeningLessonDetail) => {
    // Use topicSlug from nav state or from lesson's topic data
    const topicSlug = nav.topicSlug || lesson.topic?.slug;
    // Always generate slug from lesson object (do NOT reuse nav.lessonSlug)
    const lessonSlug = lesson.slug || generateSlug(lesson.name);
    if (!topicSlug || !lessonSlug) {
      console.error('Missing topicSlug or lessonSlug:', { topicSlug, lessonSlug });
      return;
    }
    const path = `/listening/topics/${topicSlug}/${lessonSlug}`;
    window.history.pushState({}, '', path);
    setNav((prev) => ({ ...prev, currentView: 'practice', lesson, lessonSlug, topicSlug }));
    setSidebarOpen(false);
  }, [nav.topicSlug]);

  const goToTopicDetail = useCallback((slug: string, name: string) => {
    const path = `/listening/topics/${slug}`;
    window.history.pushState({}, '', path);
    setNav((prev) => ({ ...prev, currentView: 'topic-detail', topicSlug: slug, topicName: name }));
    setSidebarOpen(false);
  }, []);

  const handleBack = () => {
    if (nav.currentView === 'topic-detail') {
      navigate('topics');
      window.history.pushState({}, '', '/listening/topics');
    }
    else if (nav.currentView === 'practice') {
      const path = nav.topicSlug ? `/listening/topics/${nav.topicSlug}` : '/listening';
      window.history.pushState({}, '', path);
      navigate(nav.topicSlug ? 'topic-detail' : 'overview', { topicSlug: nav.topicSlug, topicName: nav.topicName });
    }
    else if (nav.currentView === 'bbc-practice' || nav.currentView === 'bbc-workspace' || nav.currentView === 'bbc-dictation') {
      window.history.pushState({}, '', '/listening/bbc');
      navigate('bbc-list');
    }
    else if (nav.currentView === 'bbc-list') {
      window.history.pushState({}, '', '/listening');
      navigate('overview');
    }
    else if (nav.currentView === 'overview') {
      onBack();
    }
    else {
      window.history.pushState({}, '', '/listening');
      navigate('overview');
    }
  };

  const showShellNav = !['practice', 'bbc-practice', 'bbc-workspace', 'bbc-dictation'].includes(nav.currentView);
  const isTopLevel = nav.currentView === 'overview' || nav.currentView === 'topics' || nav.currentView === 'bbc-list' || nav.currentView === 'progress' || nav.currentView === 'leaderboard' || nav.currentView === 'history' || nav.currentView === 'bookmarks';

  const isBbcView = nav.currentView.startsWith('bbc-');
  
  // Navigation wrapper that syncs URL
  const navWithUrl = (view: ListeningView, extra?: { slug?: string; topicSlug?: string; topicName?: string }) => {
    navigate(view, extra);
  };
  
  const renderPage = () => {
    const content = (() => {
      switch (nav.currentView) {
        case 'overview':
          return <Overview onStartPractice={goToPractice} onNavigate={navWithUrl} />;
        case 'topics':
          return <TopicsPage onTopicSelect={goToTopicDetail} />;
        case 'topic-detail':
          return (
            <TopicDetailPage
              topicSlug={nav.topicSlug!}
              topicName={nav.topicName}
              lessonSlug={nav.lessonSlug}
              onBack={() => {
                window.history.pushState({}, '', '/listening/topics');
                navigate('topics');
              }}
              onStartPractice={goToPractice}
            />
          );
        case 'practice':
          return (
            <PracticePage
              lesson={nav.lesson!}
              onBack={() => {
                const path = nav.topicSlug ? `/listening/topics/${nav.topicSlug}` : '/listening';
                window.history.pushState({}, '', path);
                navigate(nav.topicSlug ? 'topic-detail' : 'overview', { topicSlug: nav.topicSlug, topicName: nav.topicName });
              }}
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
        case 'bbc-list':
          return (
            <QueryClientProvider client={bbcQueryClient}>
              <React.Suspense fallback={<Skeleton />}>
                <BbcLessonListPage onNavigate={(view, extra) => {
                  const slug = extra?.slug;
                  const path = viewToPath(view as ListeningView, { topicSlug: slug });
                  window.history.pushState({}, '', path);
                  navigate(view as ListeningView, { topicSlug: slug });
                }} />
              </React.Suspense>
            </QueryClientProvider>
          );
        case 'bbc-practice':
          return (
            <QueryClientProvider client={bbcQueryClient}>
              <React.Suspense fallback={<Skeleton />}>
                <BbcPracticePage lessonSlug={nav.topicSlug} />
              </React.Suspense>
            </QueryClientProvider>
          );
        case 'bbc-workspace':
          return (
            <QueryClientProvider client={bbcQueryClient}>
              <React.Suspense fallback={<Skeleton />}>
                <BbcWorkspacePage topicSlug={nav.topicSlug} onNavigate={(view, extra) => {
                  const slug = extra?.slug;
                  const path = viewToPath(view as ListeningView, { topicSlug: slug });
                  window.history.pushState({}, '', path);
                  navigate(view as ListeningView, { topicSlug: slug });
                }} />
              </React.Suspense>
            </QueryClientProvider>
          );
        case 'bbc-dictation':
          return (
            <QueryClientProvider client={bbcQueryClient}>
              <React.Suspense fallback={<Skeleton />}>
                <BbcMicroDictationPage
                  topicSlug={nav.topicSlug}
                  lesson={nav.dictationLesson}
                  onNavigate={(view, extra) => {
                    const slug = extra?.slug;
                    const path = viewToPath(view as ListeningView, { topicSlug: slug });
                    window.history.pushState({}, '', path);
                    navigate(view as ListeningView, { topicSlug: slug });
                  }}
                />
              </React.Suspense>
            </QueryClientProvider>
          );
        default:
          return null;
      }
    })();
    // Wrap BBC pages in dark theme shell — single shell for all BBC views
    return isBbcView ? <BbcDarkThemeShell>{content}</BbcDarkThemeShell> : content;
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
              const isActive = item.view === 'topics'
                ? isExercisesActive(nav.currentView)
                : nav.currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    const path = viewToPath(item.view);
                    window.history.pushState({}, '', path);
                    navigate(item.view);
                  }}
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
            const isActive = item.view === 'topics'
              ? isExercisesActive(nav.currentView)
              : nav.currentView === item.view;
            return (
              <SidebarNavItem
                key={item.view}
                item={item}
                isActive={isActive}
                onClick={() => {
                  const path = viewToPath(item.view);
                  window.history.pushState({}, '', path);
                  navigate(item.view);
                }}
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
  // DESKTOP SIDEBAR — removed
  // Desktop nav lives in the header; sidebar was redundant.
  // ─────────────────────────────────────────────────────────────
  const DesktopSidebar = null;

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
        const isActive = item.view === 'topics'
          ? isExercisesActive(nav.currentView)
          : nav.currentView === item.view;
        return (
          <BottomNavItem
            key={item.view}
            item={item}
            isActive={isActive}
            onClick={() => {
              const path = viewToPath(item.view);
              window.history.pushState({}, '', path);
              navigate(item.view);
            }}
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
        position: 'relative',
      }}
    >
      {/* Header - hidden on practice pages */}
      {showShellNav && Header}

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
          <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
            <ListeningNavigationContext.Provider value={{ navigate, goBack: handleBack }}>
              {renderPage()}
            </ListeningNavigationContext.Provider>
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

import { type ReactNode, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from './components/ui/Toast'
import { ListeningLayout } from './components/ListeningLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Spinner } from './components/ui/Spinner'
import { ExplanationProvider } from './contexts/ExplanationContext'

// Lazy-loaded pages for code splitting
const TopicsPage = lazy(() => import('./pages/topics/TopicsPage'))
const TopicDetailPage = lazy(() => import('./pages/topics/TopicDetailPage'))
const ListenPage = lazy(() => import('./pages/listen/LessonPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const ProgressPage = lazy(() => import('./pages/progress/ProgressPage'))
const HistoryPage = lazy(() => import('./pages/history/HistoryPage'))
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface AppRouterProps {
  children?: ReactNode
}

/**
 * Listening Module Router.
 *
 * This component provides React Router v6 routing for the listening feature.
 * It must be rendered INSIDE a <BrowserRouter> context (provided by the root App).
 * It does NOT include its own BrowserRouter — that would create nested router conflicts.
 */
export function AppRouter({ children }: AppRouterProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {children}
        <ExplanationProvider>
          <Routes>
            {/* Root redirects to topics */}
            <Route path="/" element={<Navigate to="/topics" replace />} />

            {/* Protected listening routes */}
            <Route element={<ListeningLayout />}>
              <Route
                path="/topics"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TopicsPage />
                  </Suspense>
                }
              />
              <Route
                path="/topics/:slug"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TopicDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/listen/:lessonId"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ListenPage />
                  </Suspense>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="/progress"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProgressPage />
                  </Suspense>
                }
              />
              <Route
                path="/history"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HistoryPage />
                  </Suspense>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <OnboardingPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/topics" replace />} />
          </Routes>
          <ToastContainer />
        </ExplanationProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

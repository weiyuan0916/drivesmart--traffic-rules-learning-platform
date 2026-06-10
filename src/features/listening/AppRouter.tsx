import { type ReactNode, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from './components/ui/Toast'
import { ListeningLayout } from './components/ListeningLayout'
import { AuthLayout } from './components/AuthLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Spinner } from './components/ui/Spinner'
import { GlobalAudioProvider } from './hooks/useGlobalAudio.tsx'
import { ExplanationProvider } from './contexts/ExplanationContext'

// Lazy-loaded pages for code splitting
const TopicsPage = lazy(() => import('./pages/topics/TopicsPage'))
const TopicDetailPage = lazy(() => import('./pages/topics/TopicDetailPage'))
const ListenPage = lazy(() => import('./pages/listen/LessonPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const ProgressPage = lazy(() => import('./pages/progress/ProgressPage'))
const HistoryPage = lazy(() => import('./pages/history/HistoryPage'))
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))

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

export function AppRouter({ children }: AppRouterProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          {children}
          <GlobalAudioProvider>
            <ExplanationProvider>
              <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/topics" replace />} />

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route
                path="/auth/login"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              <Route
                path="/auth/register"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RegisterPage />
                  </Suspense>
                }
              />
            </Route>

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
        </GlobalAudioProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

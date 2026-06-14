import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainContent from './components/MainContent';
import { Homepage } from './components/marketing/Homepage';
import { LenisProvider } from './components/marketing/LenisProvider';
import ImageAnalyzer from './components/ImageAnalyzer';
import LanguageSwitcher from './components/LanguageSwitcher';
import ExamSetupScreen from './components/ExamSetupScreen';
import ExamTakingScreen from './components/ExamTakingScreen';
import VocabularyFlashcards from './components/VocabularyFlashcards';
import OPALFlashcards from './components/OPALFlashcards';
import { AgriVietnamLanding } from './components/marketing/AgriVietnamLanding';
import { ImmersiveLanding } from './components/three/ImmersiveLanding';
import { SmoothScroll } from './components/SmoothScroll';
import ListeningModule from './components/listening/ListeningModule';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { VocabularyLanguageProvider } from './context/VocabularyLanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalAudioProvider } from './features/listening/hooks/useGlobalAudio.tsx';
import { LayoutDashboard, Menu, X, Car, BookOpen, ArrowLeft, AlertTriangle } from 'lucide-react';
import type { ChapterStat, Question } from './types';
import { loadExamQuestions } from './services/questionsService';
import { generateExamQuestions, EXAM_CONFIGS, LicenseType } from './services/examGenerator';
// Lazy-load auth pages for code splitting
import { lazy, Suspense } from 'react';
const AuthLoginPage = lazy(() => import('./features/listening/pages/auth/LoginPage'))
const AuthRegisterPage = lazy(() => import('./features/listening/pages/auth/RegisterPage'))
const OAuthCallbackPage = lazy(() => import('./features/listening/pages/auth/OAuthCallbackPage'))
import { useAuthStore } from './features/listening/stores/authStore'

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

/**
 * Redirects to /topics if the user is already authenticated.
 * Used to prevent authenticated users from seeing login/register pages.
 */
function AuthRedirectGuard() {
  const { isAuthenticated } = useAuthStore()
  const { navigate } = { navigate: (() => { /* lazy */ }) as unknown as ReturnType<typeof import('react-router-dom').useNavigate> }

  if (isAuthenticated) {
    // Use window.location as a fallback since we're not in a Router context
    window.location.href = '/topics'
    return null
  }
  return null
}

type AppMode = 'none' | 'driving' | 'vocabulary' | 'opal' | 'marketing' | 'listening';
type DrivingView = 'setup' | 'exam' | 'analyzer';

function AppContent() {
  const location = useLocation();
  const [selectedMode, setSelectedMode] = useState<AppMode>('none');
  const [drivingView, setDrivingView] = useState<DrivingView>('setup');
  const [examLoading, setExamLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [confirmedAnswers, setConfirmedAnswers] = useState<(string | null)[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [chapterStats, setChapterStats] = useState<ChapterStat[] | null>(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState<LicenseType>('B1');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const { t } = useLanguage();

  // Sync URL pathname → selectedMode (handles direct navigation to /listening, etc.)
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') {
      setSelectedMode('none');
    } else if (path.startsWith('/listening')) {
      // Any /listening/* route activates the listening mode
      setSelectedMode('listening');
    } else {
      setSelectedMode('none');
    }
  }, [location.pathname]);

  const examTimeMinutes = EXAM_CONFIGS[selectedLicenseType]?.timeMinutes || 30;

  const startExam = async (licenseType?: LicenseType) => {
    if (examLoading) return;
    setExamLoading(true);
    const type = licenseType || selectedLicenseType;
    setSelectedLicenseType(type);
    try {
      const allQuestions = await loadExamQuestions();
      const seed = String(Date.now());
      const selected = generateExamQuestions(allQuestions, type, seed);
      setExamQuestions(selected);
      setConfirmedAnswers(selected.map(() => null));
      setCurrentQuestionNumber(1);
      setChapterStats(null);
      setDrivingView('exam');
    } finally {
      setExamLoading(false);
    }
  };

  const handleExamComplete = (results: { correct: number; incorrect: number; skipped: number; totalQuestions: number; accuracy: number; pass: boolean; answers: (string | null)[]; timeSpentSeconds: number }) => {
    // Update confirmed answers with results
    setConfirmedAnswers(results.answers);
    
    // Compute chapter stats for the old MainContent
    const chapterMap = new Map<number, { correct: number; total: number }>();
    for (let i = 0; i < examQuestions.length; i++) {
      const q = examQuestions[i];
      const answer = results.answers[i];
      const isCorrect = answer !== null && answer === q.correctAnswer;
      
      const entry = chapterMap.get(q.chapterNumber) ?? { correct: 0, total: 0 };
      entry.total++;
      if (isCorrect) entry.correct++;
      chapterMap.set(q.chapterNumber, entry);
    }
    
    const stats: ChapterStat[] = Array.from(chapterMap.entries()).map(([chapterNumber, value]) => ({
      chapterNumber,
      chapter: examQuestions.find(q => q.chapterNumber === chapterNumber)?.chapter || '',
      correct: value.correct,
      total: value.total,
    }));
    setChapterStats(stats);
  };

  const handleExamExit = () => {
    setDrivingView('setup');
  };

  const handleRetry = () => {
    startExam(selectedLicenseType);
  };

  const returnToSetup = () => {
    setDrivingView('setup');
  };

  const isHomepage = location.pathname === '/' || location.pathname === '/home';
  const inMode = selectedMode !== 'none';
  const fullscreenLayout = isHomepage && !inMode;

  return (
    <div
      className={`flex flex-col h-screen font-sans relative transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)] ${
        fullscreenLayout ? 'overflow-y-auto' : 'overflow-hidden'
      }`}
      data-lenis-scroll={fullscreenLayout ? '' : undefined}
    >
      {/* Driving Mode Mobile Header (visible during exam on mobile) */}
      {drivingView === 'exam' && (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-secondary)] border-b border-[var(--border)] z-40">
          <div className="h-full flex items-center justify-between px-4">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[var(--text-primary)] rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-[var(--bg-primary)]" />
              </div>
              <span className="font-bold text-sm">DriveSmart</span>
            </div>
            <div className="w-9" />
          </div>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {drivingView === 'exam' && mobileMenuOpen && (
          <motion.div
            key="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex flex-col p-6 gap-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              className="flex justify-end"
            >
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white">
                <X className="w-8 h-8" />
              </button>
            </motion.div>
            <div className="flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.2 }}
              >
                <button
                  onClick={() => { returnToSetup(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-xl font-bold bg-[var(--text-primary)] text-[var(--bg-primary)]"
                >
                  <LayoutDashboard /> Thoát
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border)] p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Thoát bài thi?</h3>
              </div>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Bạn đang trong quá trình thi. Nếu thoát, các câu trả lời đã xác nhận sẽ không được lưu và bạn sẽ quay về màn hình chính.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    handleExamExit();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  Thoát
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Lenis smooth scroll — must be placed at root level */}
      {fullscreenLayout && <LenisProvider />}

      {/* Marketing Homepage — scroll storytelling landing page.
          Mutually exclusive with the mode views: when the user activates any
          mode (driving, vocabulary, opal, etc.), the homepage must unmount so
          the inner page (e.g. ExamSetupScreen) is not stacked beneath it. */}
      {isHomepage && selectedMode === 'none' && (
        <Homepage
          nav={{
            onNavigateDriving: () => setSelectedMode('driving'),
            onNavigateVocabulary: () => setSelectedMode('vocabulary'),
            onNavigateOPAL: () => setSelectedMode('opal'),
            onNavigateListening: () => { window.location.href = '/listening'; },
            onNavigateAgri: () => setSelectedMode('marketing'),
          }}
        />
      )}

      {/* Driving Test Mode */}
      {selectedMode === 'driving' && (
        <>
          {/* Exam Taking Screen (New modern exam flow) */}
          {drivingView === 'exam' && examQuestions.length > 0 && (
            <ExamTakingScreen
              questions={examQuestions}
              initialAnswers={confirmedAnswers}
              examTimeMinutes={examTimeMinutes}
              candidateName={candidateName}
              onComplete={handleExamComplete}
              onExit={handleExamExit}
            />
          )}

          {/* Exam Setup Screen */}
          {drivingView === 'setup' && (
            <ExamSetupScreen
              onStartExam={(licenseType) => {
                setCandidateName(''); // Would get from form
                startExam(licenseType);
              }}
              isStarting={examLoading}
              onBack={() => setSelectedMode('none')}
            />
          )}

          {/* AI Analyzer View */}
          {drivingView === 'analyzer' && (
            <SmoothScroll className="flex-1 pt-20 lg:pt-12 p-4 lg:p-12 bg-[var(--bg-primary)]">
              <button
                onClick={() => setSelectedMode('none')}
                className="fixed top-4 left-4 z-50 p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-sm hover:bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] text-[var(--text-primary)] transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
                <div className="text-center space-y-4">
                  <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">{t('aiAnalyzerTitle')}</h1>
                  <p className="text-[var(--text-secondary)] text-base lg:text-xl max-w-2xl mx-auto">
                    {t('aiAnalyzerDesc')}
                  </p>
                </div>
                <ImageAnalyzer />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 pb-32 lg:pb-24">
                  <div className="bg-[var(--bg-tertiary)] p-6 lg:p-8 rounded-3xl border border-[var(--border)]">
                    <h4 className="text-[var(--text-primary)] font-bold mb-3">{t('ruleIdentification')}</h4>
                    <p className="text-[var(--text-secondary)] text-sm">{t('ruleDesc')}</p>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] p-6 lg:p-8 rounded-3xl border border-[var(--border)]">
                    <h4 className="text-[var(--text-primary)] font-bold mb-3">{t('hazardDetection')}</h4>
                    <p className="text-[var(--text-secondary)] text-sm">{t('hazardDesc')}</p>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] p-6 lg:p-8 rounded-3xl border border-[var(--border)]">
                    <h4 className="text-[var(--text-primary)] font-bold mb-3">{t('actionGuidance')}</h4>
                    <p className="text-[var(--text-secondary)] text-sm">{t('actionDesc')}</p>
                  </div>
                </div>
              </div>
            </SmoothScroll>
          )}
        </>
      )}

      {/* Vocabulary Flashcards Mode */}
      {selectedMode === 'vocabulary' && (
        <VocabularyLanguageProvider>
          <VocabularyFlashcards onBack={() => setSelectedMode('none')} />
        </VocabularyLanguageProvider>
      )}

      {/* OPAL Flashcards Mode */}
      {selectedMode === 'opal' && (
        <OPALFlashcards onBack={() => setSelectedMode('none')} />
      )}

      {/* AgriVietnam Immersive Experience */}
      {selectedMode === 'marketing' && (
        <ImmersiveLanding onBack={() => setSelectedMode('none')} />
      )}

      {/* Practice Listening to English */}
      {selectedMode === 'listening' && (
        <ListeningModule onBack={() => setSelectedMode('none')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <GlobalAudioProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth pages — full-screen, no app shell */}
              <Route
                path="/auth/login"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AuthLoginPage />
                  </Suspense>
                }
              />
              <Route
                path="/auth/register"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AuthRegisterPage />
                  </Suspense>
                }
              />
              <Route
                path="/auth/callback"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <OAuthCallbackPage />
                  </Suspense>
                }
              />
              {/* Listening module — full standalone experience */}
              <Route
                path="/listening"
                element={
                  <ThemeProvider>
                    <LanguageProvider>
                      <GlobalAudioProvider>
                        <ListeningModule onBack={() => window.history.back()} />
                      </GlobalAudioProvider>
                    </LanguageProvider>
                  </ThemeProvider>
                }
              />
              {/* Main app shell */}
              <Route path="*" element={<AppContent />} />
            </Routes>
          </BrowserRouter>
        </GlobalAudioProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

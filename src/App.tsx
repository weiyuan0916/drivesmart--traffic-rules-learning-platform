import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import MainContent from './components/MainContent';
import ImageAnalyzer from './components/ImageAnalyzer';
import LanguageSwitcher from './components/LanguageSwitcher';
import ExamSetupScreen from './components/ExamSetupScreen';
import ExamTakingScreen from './components/ExamTakingScreen';
import VocabularyFlashcards from './components/VocabularyFlashcards';
import OPALFlashcards from './components/OPALFlashcards';
import { SmoothScroll } from './components/SmoothScroll';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Brain, LayoutDashboard, Menu, X, Car, BookOpen, ArrowLeft, AlertTriangle } from 'lucide-react';
import type { ChapterStat, Question } from './types';
import { loadExamQuestions } from './services/questionsService';
import { generateExamQuestions, EXAM_CONFIGS, LicenseType } from './services/examGenerator';

type AppMode = 'none' | 'driving' | 'vocabulary' | 'opal';
type DrivingView = 'setup' | 'exam' | 'analyzer';

function AppContent() {
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
    setConfirmedAnswers(results.answers);
    
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

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden relative transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)]">
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

      {/* Desktop Bottom Navigation (only when not in exam) */}
      {drivingView !== 'exam' && (
        <div className="hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border)] gap-1">
          <button
            onClick={() => setDrivingView('setup')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              drivingView === 'setup'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <Car className="w-4 h-4" />
            Thi GPLX
          </button>
          <button
            onClick={() => setDrivingView('analyzer')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              drivingView === 'analyzer'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <Brain className="w-4 h-4" />
            {t('aiAnalyzer')}
          </button>
        </div>
      )}

      {/* Main Menu Selection */}
      {selectedMode === 'none' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-16">
              <div 
                className="flex items-center justify-center gap-4 mb-6" 
                style={{ animation: 'fadeInDown 0.5s ease-out' }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                  <Car className="w-8 h-8 text-slate-900" />
                </div>
                <h1 className="text-5xl font-black text-white">DriveSmart</h1>
              </div>
              <p 
                className="text-xl text-slate-400"
                style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}
              >
                Choose a learning platform to get started
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              {/* Menu 1: Driving Test */}
              <button
                onClick={() => setSelectedMode('driving')}
                className="group relative bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-blue-500 rounded-xl md:rounded-2xl p-3 md:p-5 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
                style={{ animation: 'fadeInLeft 0.5s ease-out 0.3s both' }}
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <Car className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-bold text-blue-400 mb-1 md:mb-2">Driving Test</h3>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed hidden sm:block">
                  Practice for your driving license exam with 600 official theory questions. Track your progress, review mistakes, and get ready to pass your test with confidence.
                </p>
                <div className="mt-3 md:mt-4 flex items-center text-blue-400 font-semibold text-xs md:text-sm">
                  Start learning
                  <svg className="w-3 h-3 md:w-4 md:h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Menu 2: English Vocabulary Test */}
              <button
                onClick={() => setSelectedMode('vocabulary')}
                className="group relative bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-green-500 rounded-xl md:rounded-2xl p-3 md:p-5 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10"
                style={{ animation: 'fadeInRight 0.5s ease-out 0.4s both' }}
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-green-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-bold text-green-400 mb-1 md:mb-2">English Vocabulary</h3>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed hidden sm:block">
                  Learn English vocabulary with interactive flashcards powered by the Oxford Dictionary. Click to reveal words, guess their meanings, and double-click to check definitions and examples.
                </p>
                <div className="mt-3 md:mt-4 flex items-center text-green-400 font-semibold text-xs md:text-sm">
                  Start learning
                  <svg className="w-3 h-3 md:w-4 md:h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Menu 3: OPAL Phrases */}
              <button
                onClick={() => setSelectedMode('opal')}
                className="group relative bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-purple-500 rounded-xl md:rounded-2xl p-3 md:p-5 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
                style={{ animation: 'fadeInRight 0.5s ease-out 0.6s both' }}
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-purple-600 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl md:text-2xl">📚</span>
                </div>
                <h3 className="text-base md:text-xl font-bold text-purple-400 mb-1 md:mb-2">OPAL Phrases</h3>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed hidden sm:block">
                  Learn academic phrases and vocabulary from the Oxford Phrase Academy. Master spoken and written English for academic success with pronunciation audio.
                </p>
                <div className="mt-3 md:mt-4 flex items-center text-purple-400 font-semibold text-xs md:text-sm">
                  Start learning
                  <svg className="w-3 h-3 md:w-4 md:h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex justify-center mt-12">
              <LanguageSwitcher className="relative flex items-center gap-2" />
            </div>
          </div>
        </div>
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
        <VocabularyFlashcards onBack={() => setSelectedMode('none')} />
      )}

      {/* OPAL Flashcards Mode */}
      {selectedMode === 'opal' && (
        <OPALFlashcards onBack={() => setSelectedMode('none')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

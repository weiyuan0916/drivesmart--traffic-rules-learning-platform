import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import MainContent from './components/MainContent';
import ImageAnalyzer from './components/ImageAnalyzer';
import LanguageSwitcher from './components/LanguageSwitcher';
import DashboardDesktopHeader from './components/DashboardDesktopHeader';
import ExamSetupScreen from './components/ExamSetupScreen';
import { SmoothScroll } from './components/SmoothScroll';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Brain, LayoutDashboard, Menu, X, Car } from 'lucide-react';
import type { ChapterStat, Question } from './types';
import { loadExamQuestions } from './services/questionsService';
import { generateB1ExamQuestions } from './services/examGenerator';

function AppContent() {
  const [examStarted, setExamStarted] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [confirmedAnswers, setConfirmedAnswers] = useState<(string | null)[]>([]);
  const [view, setView] = useState<'dashboard' | 'analyzer'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [chapterStats, setChapterStats] = useState<ChapterStat[] | null>(null);
  const { t } = useLanguage();

  const startExam = async () => {
    if (examLoading) return;
    setExamLoading(true);
    try {
      const allQuestions = await loadExamQuestions();
      const seed = String(Date.now());
      const selected = generateB1ExamQuestions(allQuestions, seed);
      setExamQuestions(selected);
      setConfirmedAnswers(selected.map(() => null));
      setCurrentQuestionNumber(1);
      setChapterStats(null);
      setExamStarted(true);
      setView('dashboard');
    } finally {
      setExamLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden relative transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Mobile Header */}
      {examStarted && (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-b border-[var(--border)] z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--text-primary)] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-[var(--bg-primary)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight leading-tight">DriveSmart</span>
              <span className="text-[10px] text-[var(--text-secondary)] leading-tight">Bài thi B1</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
              {examQuestions.length > 0 ? `${confirmedAnswers.filter(Boolean).length}/${examQuestions.length}` : ''}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
      {examStarted && mobileMenuOpen && (
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
                onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xl font-bold transition-colors ${view === 'dashboard' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-gray-400'}`}
              >
                <LayoutDashboard /> {t('dashboard')}
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.2 }}
            >
              <button
                onClick={() => { setView('analyzer'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xl font-bold transition-colors ${view === 'analyzer' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-gray-400'}`}
              >
                <Brain /> {t('aiAnalyzer')}
              </button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.2 }}
            className="mt-auto pt-6 border-t border-white/15 flex justify-center"
          >
            <LanguageSwitcher className="relative top-auto right-auto z-auto flex items-center gap-2" />
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* View Toggle (Floating - Desktop Only, only shown on analyzer) */}
      {!examStarted && view === 'analyzer' && (
        <div className="hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border)] gap-1">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('dashboard')}
          </button>
          <button
            onClick={() => setView('analyzer')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--text-primary)] text-[var(--bg-primary)] transition-colors"
          >
            <Brain className="w-4 h-4" />
            {t('aiAnalyzer')}
          </button>
        </div>
      )}

      {!examStarted ? (
        <ExamSetupScreen
          onStartExam={() => startExam()}
          isStarting={examLoading}
        />
      ) : view === 'dashboard' ? (
        <div className="relative flex flex-col flex-1 overflow-hidden pt-14 lg:pt-14">
          <DashboardDesktopHeader />
          <MainContent
            questions={examQuestions}
            confirmedAnswers={confirmedAnswers}
            onConfirmedAnswersChange={setConfirmedAnswers}
            onExamStatsComputed={setChapterStats}
            onCurrentQuestionNumberChange={setCurrentQuestionNumber}
            onRestartExam={startExam}
          />
        </div>
      ) : (
        <SmoothScroll className="flex-1 pt-20 lg:pt-12 p-4 lg:p-12 bg-[var(--bg-primary)]">
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

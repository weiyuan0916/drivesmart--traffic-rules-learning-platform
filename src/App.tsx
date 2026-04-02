import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import ImageAnalyzer from './components/ImageAnalyzer';
import LanguageSwitcher from './components/LanguageSwitcher';
import MobileDashboardTabBar from './components/MobileDashboardTabBar';
import DashboardDesktopHeader from './components/DashboardDesktopHeader';
import ExamSetupScreen from './components/ExamSetupScreen';
import { SmoothScroll } from './components/SmoothScroll';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { useIsDesktop } from './hooks/useMediaQuery';
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
  const [activeSidebar, setActiveSidebar] = useState<'left' | 'main' | 'right'>('main');
  const [collapsedSidebar, setCollapsedSidebar] = useState<boolean>(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [chapterStats, setChapterStats] = useState<ChapterStat[] | null>(null);
  const { t } = useLanguage();
  const isDesktop = useIsDesktop();
  const hideFloatingLanguageSwitcher =
    !examStarted ||
    (view === 'dashboard' && (isDesktop || activeSidebar === 'main'));

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
    <div className="flex h-screen font-sans overflow-hidden relative transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className={mobileMenuOpen ? 'hidden lg:block' : 'block'}>
        {!hideFloatingLanguageSwitcher ? <LanguageSwitcher /> : null}
      </div>

      {/* Mobile Header */}
      {examStarted && !(view === 'dashboard' && activeSidebar === 'main') && (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-b border-[var(--border)] z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)] tracking-tight">DriveSmart</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      )}

      {/* Mobile Navigation Overlay */}
      {examStarted && mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex flex-col p-8 gap-6">
          <button onClick={() => setMobileMenuOpen(false)} className="self-end p-2 text-white">
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-4 p-4 rounded-2xl text-xl font-bold ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
          >
            <LayoutDashboard /> {t('dashboard')}
          </button>
          <button
            onClick={() => { setView('analyzer'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-4 p-4 rounded-2xl text-xl font-bold ${view === 'analyzer' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
          >
            <Brain /> {t('aiAnalyzer')}
          </button>
          <div className="mt-auto pt-6 border-t border-white/15 flex justify-center">
            <LanguageSwitcher className="relative top-auto right-auto z-auto flex items-center gap-2" />
          </div>
        </div>
      )}

      {/* View Toggle (Floating - Desktop Only) */}
      {examStarted ? (
      <div className="hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-tertiary)]/80 backdrop-blur-xl p-2 rounded-2xl border border-[var(--border)] shadow-2xl gap-2">
        <button
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            view === 'dashboard' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          {t('dashboard')}
        </button>
        <button
          onClick={() => setView('analyzer')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            view === 'analyzer' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Brain className="w-5 h-5" />
          {t('aiAnalyzer')}
        </button>
      </div>
      ) : null}

      {!examStarted ? (
        <ExamSetupScreen onStartExam={startExam} isStarting={examLoading} />
      ) : view === 'dashboard' ? (
        <div
          className={`relative flex flex-1 overflow-hidden ${
            isDesktop ? 'pt-14' : activeSidebar === 'main' ? 'pt-0' : 'pt-16'
          }`}
        >
          {isDesktop ? (
            <DashboardDesktopHeader active={activeSidebar} onChange={setActiveSidebar} onToggleCollapse={() => setCollapsedSidebar((v) => !v)} collapsedSidebar={collapsedSidebar} />
          ) : (
            <MobileDashboardTabBar active={activeSidebar} onChange={setActiveSidebar} />
          )}

          <div className="flex flex-1 overflow-hidden min-h-0">
            <div
              className={`${activeSidebar === 'left' ? 'flex' : 'hidden'} min-w-0 lg:flex h-full w-full shrink-0 transition-all duration-200 lg:w-80 xl:w-96 ${
                collapsedSidebar ? 'lg:w-0 lg:overflow-hidden lg:border-r-0' : ''
              }`}
            >
                <Sidebar
                  totalQuestions={examQuestions.length}
                  currentQuestionNumber={currentQuestionNumber}
                  questions={examQuestions}
                  confirmedAnswers={confirmedAnswers}
                  onCurrentQuestionNumberChange={setCurrentQuestionNumber}
                />
            </div>
            <div className={`${activeSidebar === 'main' ? 'flex' : 'hidden'} lg:flex flex-1 h-full overflow-hidden min-h-0`}>
                <MainContent
                  questions={examQuestions}
                  confirmedAnswers={confirmedAnswers}
                  onConfirmedAnswersChange={setConfirmedAnswers}
                  onExamStatsComputed={setChapterStats}
                  onBack={() => setActiveSidebar('left')}
                  onCurrentQuestionNumberChange={setCurrentQuestionNumber}
                  onRestartExam={startExam}
                  onToggleCollapse={() => setCollapsedSidebar((v) => !v)}
                  collapsedSidebar={collapsedSidebar}
                />
            </div>
            <div
              className={`${activeSidebar === 'right' ? 'flex' : 'hidden'} min-w-0 lg:flex h-full w-full shrink-0 transition-all duration-200 lg:w-96 xl:w-[28rem] ${
                collapsedSidebar ? 'lg:w-0 lg:overflow-hidden lg:border-l-0' : ''
              }`}
            >
              <RightSidebar chapterStats={chapterStats ?? undefined} examQuestions={examQuestions} />
            </div>
          </div>
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

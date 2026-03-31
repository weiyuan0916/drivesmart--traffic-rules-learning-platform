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

function AppContent() {
  const [examStarted, setExamStarted] = useState(false);
  const [view, setView] = useState<'dashboard' | 'analyzer'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<'left' | 'main' | 'right'>('main');
  const { t } = useLanguage();
  const isDesktop = useIsDesktop();
  const hideFloatingLanguageSwitcher =
    !examStarted ||
    (view === 'dashboard' && (isDesktop || activeSidebar === 'main'));

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
        <ExamSetupScreen onStartExam={() => setExamStarted(true)} />
      ) : view === 'dashboard' ? (
        <div
          className={`relative flex flex-1 overflow-hidden ${
            isDesktop ? 'pt-14' : activeSidebar === 'main' ? 'pt-0' : 'pt-16'
          }`}
        >
          {isDesktop ? (
            <DashboardDesktopHeader active={activeSidebar} onChange={setActiveSidebar} />
          ) : (
            <MobileDashboardTabBar active={activeSidebar} onChange={setActiveSidebar} />
          )}

          <div className="flex flex-1 overflow-hidden">
            <div className={`${activeSidebar === 'left' ? 'flex' : 'hidden'} lg:flex shrink-0 w-full lg:w-auto h-full`}>
              <Sidebar />
            </div>
            <div className={`${activeSidebar === 'main' ? 'flex' : 'hidden'} lg:flex flex-1 h-full`}>
              <MainContent onBack={() => setActiveSidebar('left')} />
            </div>
            <div className={`${activeSidebar === 'right' ? 'flex' : 'hidden'} lg:flex shrink-0 w-full lg:w-auto h-full`}>
              <RightSidebar />
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

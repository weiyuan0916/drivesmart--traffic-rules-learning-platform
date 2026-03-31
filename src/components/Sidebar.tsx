import React from 'react';
import { Scale, Shield, BookOpen, ChevronRight, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SmoothScroll } from './SmoothScroll';

const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  return (
    <SmoothScroll className="w-full lg:w-80 bg-[var(--bg-secondary)] p-4 lg:p-6 flex flex-col gap-6 border-r border-[var(--border)]">
      {/* Question Grid */}
      <div className="bg-[var(--bg-tertiary)] p-3 sm:p-4 rounded-2xl min-w-0">
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1 sm:gap-2">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={`size-6 sm:size-[26px] justify-self-center rounded-full flex items-center justify-center text-xs sm:text-sm font-bold leading-none ${
                i + 1 === 26 ? 'bg-blue-500 text-white' : 
                i + 1 <= 21 ? 'bg-emerald-500 text-white' :
                i + 1 <= 25 ? 'bg-rose-500 text-white' :
                'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold text-[var(--text-secondary)]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" /> 21 {t('correct')}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-rose-500" /> 4 {t('incorrect')}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" /> 26 {t('current')}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[var(--bg-hover)]" /> 25 {t('unanswered')}
          </div>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--text-primary)] font-bold text-sm">{t('explanation')}</h3>
          <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-1 bg-[var(--bg-hover)] rounded-full w-full opacity-50" />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <button className="w-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors p-4 rounded-2xl flex items-center gap-4 group">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">{t('republicOfSerbia')}</p>
            <p className="text-[var(--text-primary)] font-bold">{t('laws')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button className="w-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors p-4 rounded-2xl flex items-center gap-4 group">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">{t('republicOfSerbia')}</p>
            <p className="text-[var(--text-primary)] font-bold">{t('regulations')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
        </button>

        <button className="w-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors p-4 rounded-2xl flex items-center gap-4 group">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Zajednica Auto škola Srbije</p>
            <p className="text-[var(--text-primary)] font-bold">{t('studyLiterature')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </SmoothScroll>
  );
};

export default Sidebar;

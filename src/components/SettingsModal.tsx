import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme, ThemePreference } from '../context/ThemeContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import type { FontSizeLevel } from '../context/SettingsContext';

// ── helpers ───────────────────────────────────────────────────────────────────

function sectionLabel(text: string) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
      {text}
    </p>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border transition-colors duration-200 outline-none
        focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1
        ${checked
          ? 'bg-blue-500 border-blue-500'
          : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
        }
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onResetProgress: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, onResetProgress }) => {
  const { preference, setPreference } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { showAllAnswers, questionOrder, fontSizeLevel, setShowAllAnswers, setQuestionOrder, setFontSizeLevel, resetSettings } = useSettings();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Theme button group
  const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: t('themeLight'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ),
    },
    {
      value: 'dark',
      label: t('themeDark'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ),
    },
    {
      value: 'system',
      label: t('themeSystem'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
  ];

  // Font-size "A" labels
  const fontSizeLabels = ['A', 'A', 'A', 'A', 'A'] as const;
  const fontSizePx = [12, 14, 16, 18, 20] as const;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            key="settings-panel"
            role="dialog"
            aria-modal
            aria-label={t('settings')}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-sm overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">{t('settings')}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-6">

              {/* ── THEME ── */}
              <div>
                {sectionLabel(t('theme'))}
                <div className="flex gap-2">
                  {themeOptions.map((opt) => {
                    const active = preference === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPreference(opt.value)}
                        className={`
                          flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 px-2
                          font-semibold text-xs transition-all duration-150
                          focus-visible:ring-2 focus-visible:ring-blue-500/50
                          ${active
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                          }
                        `}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* ── LANGUAGE ── */}
              <div>
                {sectionLabel(t('language'))}
                <div className="grid grid-cols-2 gap-2">
                  {(['vi', 'en'] as Language[]).map((lang) => {
                    const active = language === lang;
                    const flagUrl = lang === 'vi'
                      ? 'https://flagcdn.com/w80/vn.png'
                      : 'https://flagcdn.com/w80/gb.png';
                    const label = lang === 'vi' ? t('langVi') : t('langEn');
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`
                          flex items-center gap-3 rounded-xl border py-3 px-3
                          font-semibold text-sm transition-all duration-150
                          focus-visible:ring-2 focus-visible:ring-blue-500/50
                          ${active
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                          }
                        `}
                      >
                        <div className={`h-5 w-7 overflow-hidden rounded-sm shadow-sm shrink-0 ${active ? 'opacity-90' : ''}`}>
                          <img
                            src={flagUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* ── SHOW ALL ANSWERS ── */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t('showAllAnswers')}</span>
                <Toggle
                  checked={showAllAnswers}
                  onChange={setShowAllAnswers}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* ── ORDER ── */}
              <div>
                {sectionLabel(t('order'))}
                <div className="grid grid-cols-2 gap-2">
                  {(['sequential', 'shuffle'] as const).map((order) => {
                    const active = questionOrder === order;
                    const label = order === 'sequential' ? t('sequential') : t('shuffle');
                    return (
                      <button
                        key={order}
                        type="button"
                        onClick={() => setQuestionOrder(order)}
                        className={`
                          rounded-xl border py-3 px-3 text-sm font-semibold
                          transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500/50
                          ${active
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                          }
                        `}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* ── FONT SIZE ── */}
              <div>
                {sectionLabel(t('fontSize'))}
                <div className="flex items-center justify-center gap-3">
                  {([1, 2, 3, 4, 5] as FontSizeLevel[]).map((level) => {
                    const active = fontSizeLevel === level;
                    const px = fontSizePx[level - 1];
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFontSizeLevel(level)}
                        className={`
                          relative flex flex-col items-center gap-1 transition-all duration-150
                          focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-lg
                          ${active ? '' : 'hover:opacity-80'}
                        `}
                        aria-label={`Font size ${level}`}
                      >
                        <span
                          className={`
                            leading-none font-bold transition-all duration-150
                            ${active ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                          `}
                          style={{ fontSize: `${px}px` }}
                        >
                          A
                        </span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* ── RESET ── */}
              <div>
                {sectionLabel(t('reset'))}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { resetSettings(); onClose(); }}
                    className={`
                      rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]
                      py-2.5 px-3 text-sm font-semibold
                      text-[var(--text-secondary)] transition-colors duration-150
                      hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]
                      focus-visible:ring-2 focus-visible:ring-blue-500/50
                    `}
                  >
                    {t('resetSettings')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { onResetProgress(); onClose(); }}
                    className="
                      rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-500/10
                      py-2.5 px-3 text-sm font-semibold
                      text-rose-500 transition-colors duration-150
                      hover:border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20
                      focus-visible:ring-2 focus-visible:ring-rose-500/50
                    "
                  >
                    {t('resetProgress')}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SettingsModal;

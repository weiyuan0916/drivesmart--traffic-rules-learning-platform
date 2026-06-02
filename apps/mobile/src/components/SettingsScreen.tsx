import React from 'react';
import { Sun, Moon, Monitor, ChevronRight } from 'lucide-react';
import { useTheme, ThemePreference } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

interface SettingsScreenProps {
  onResetProgress?: () => void;
}

export function SettingsScreen(_props: SettingsScreenProps) {
  const { t, setLanguage } = useLanguage();
  const { preference, setPreference } = useTheme();
  const { fontSizeLevel, setFontSizeLevel, resetSettings } = useSettings();

  const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('themeLight'), icon: <Sun size={20} /> },
    { value: 'dark', label: t('themeDark'), icon: <Moon size={20} /> },
    { value: 'system', label: t('themeSystem'), icon: <Monitor size={20} /> },
  ];

  const fontSizes = [
    { value: 1, label: 'XS' },
    { value: 2, label: 'S' },
    { value: 3, label: 'M' },
    { value: 4, label: 'L' },
    { value: 5, label: 'XL' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Theme Section */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {t('theme')}
        </h2>
        <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
          {themeOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => setPreference(option.value)}
              className={`w-full flex items-center gap-3 p-4 transition-colors ${
                index !== themeOptions.length - 1 ? 'border-b border-[var(--border)]' : ''
              } ${preference === option.value ? 'bg-[var(--color-primary)]/10' : 'hover:bg-[var(--bg-hover)]'}`}
            >
              <span className={preference === option.value ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}>
                {option.icon}
              </span>
              <span className={`flex-1 text-left ${preference === option.value ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--text-primary)]'}`}>
                {option.label}
              </span>
              {preference === option.value && (
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Language Section */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {t('language')}
        </h2>
        <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
          {[
            { value: 'vi' as const, label: t('langVi') },
            { value: 'en' as const, label: t('langEn') },
          ].map((option, index, arr) => (
            <button
              key={option.value}
              onClick={() => setLanguage(option.value)}
              className={`w-full flex items-center gap-3 p-4 transition-colors ${
                index !== arr.length - 1 ? 'border-b border-[var(--border)]' : ''
              }`}
            >
              <span className="text-[var(--text-primary)]">{option.label}</span>
              <ChevronRight size={20} className="ml-auto text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      </section>

      {/* Font Size Section */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {t('fontSize')}
        </h2>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <div className="flex justify-between items-center gap-2">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => setFontSizeLevel(size.value as 1 | 2 | 3 | 4 | 5)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  fontSizeLevel === size.value
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reset Section */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {t('reset')}
        </h2>
        <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
          <button
            onClick={resetSettings}
            className="w-full flex items-center gap-3 p-4 hover:bg-[var(--bg-hover)] transition-colors text-left"
          >
            <span className="text-[var(--color-error)]">{t('resetSettings')}</span>
          </button>
        </div>
      </section>
    </div>
  );
}

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage, Language } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'menu';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className, variant = 'default' }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 260 });

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const updatePanelPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.min(280, window.innerWidth - 32);
    const left = Math.min(Math.max(16, r.right - w), window.innerWidth - w - 16);
    setPanelPos({ top: r.bottom + 8, left, width: w });
  };

  useLayoutEffect(() => {
    if (!menuOpen || variant !== 'menu') return;
    updatePanelPosition();
    const onScroll = () => updatePanelPosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updatePanelPosition);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updatePanelPosition);
    };
  }, [menuOpen, variant]);

  useEffect(() => {
    if (!menuOpen || variant !== 'menu') return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, variant]);

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const selectTheme = (next: 'light' | 'dark') => {
    if (theme !== next) toggleTheme();
  };

  if (variant === 'menu') {
    return (
      <div className={className ?? 'relative'}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm transition-colors hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)] data-[open=true]:ring-2 data-[open=true]:ring-blue-500/40"
          data-open={menuOpen}
        >
          <Menu className="w-6 h-6" strokeWidth={2.25} />
        </button>
        {menuOpen &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[199] bg-black/40 backdrop-blur-[2px]"
                aria-hidden
                onClick={() => setMenuOpen(false)}
              />
              <div
                ref={panelRef}
                role="menu"
                className="fixed z-[200] rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl p-3 text-[var(--text-primary)]"
                style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-1 mb-2">
                  {t('languageSection')}
                </p>
                <div className="flex flex-col gap-1 mb-4">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      selectLanguage('vi');
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold transition-colors hover:bg-[var(--bg-hover)]"
                  >
                    <div className="h-6 w-9 overflow-hidden rounded-sm shadow-sm shrink-0">
                      <img
                        src="https://flagcdn.com/w80/vn.png"
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="flex-1">{t('langVi')}</span>
                    {language === 'vi' ? <Check className="h-5 w-5 shrink-0 text-blue-500" /> : null}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      selectLanguage('en');
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold transition-colors hover:bg-[var(--bg-hover)]"
                  >
                    <div className="h-6 w-9 overflow-hidden rounded-sm shadow-sm shrink-0">
                      <img
                        src="https://flagcdn.com/w80/us.png"
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="flex-1">{t('langEn')}</span>
                    {language === 'en' ? <Check className="h-5 w-5 shrink-0 text-blue-500" /> : null}
                  </button>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-1 mb-2">
                  {t('appearanceSection')}
                </p>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      selectTheme('light');
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold transition-colors hover:bg-[var(--bg-hover)]"
                  >
                    <Sun className="h-6 w-6 shrink-0 text-amber-500" />
                    <span className="flex-1">{t('themeLight')}</span>
                    {theme === 'light' ? <Check className="h-5 w-5 shrink-0 text-blue-500" /> : null}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      selectTheme('dark');
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold transition-colors hover:bg-[var(--bg-hover)]"
                  >
                    <Moon className="h-6 w-6 shrink-0 text-indigo-400" />
                    <span className="flex-1">{t('themeDark')}</span>
                    {theme === 'dark' ? <Check className="h-5 w-5 shrink-0 text-blue-500" /> : null}
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div className={className || "fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2"}>
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all shadow-lg backdrop-blur-md ${
          theme === 'dark' 
            ? 'bg-[#1C1D31]/80 border-gray-800 text-yellow-500 hover:bg-[#252642]' 
            : 'bg-white/80 border-gray-200 text-blue-600 hover:bg-gray-100'
        }`}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all shadow-lg backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-[#1C1D31]/80 border-gray-800 hover:bg-[#252642]'
            : 'bg-white/80 border-gray-200 hover:bg-gray-100'
        }`}
        title={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
        aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
      >
        <div className="h-5 w-5 overflow-hidden rounded-sm shadow-sm">
          {language === 'vi' ? (
            <img
              src="https://flagcdn.com/w80/vn.png"
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img
              src="https://flagcdn.com/w80/us.png"
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </button>
    </div>
  );
};

export default LanguageSwitcher;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, type Language } from '../../context/LanguageContext';
import { useScrollDirection } from '../../hooks/useScrollAnimation';

const NAV_ITEMS = [
  { id: 'hero', labelVi: 'Trang chủ', labelEn: 'Home' },
  { id: 'driving', labelVi: 'Thi GPLX', labelEn: 'Driving Test' },
  { id: 'vocabulary', labelVi: 'Từ vựng', labelEn: 'Vocabulary' },
  { id: 'opal', labelVi: 'OPAL', labelEn: 'OPAL' },
  { id: 'listening', labelVi: 'Luyện nghe', labelEn: 'Listening' },
  { id: 'faq', labelVi: 'FAQ', labelEn: 'FAQ' },
];

interface StickyHeaderProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

export function StickyHeader({ activeSection = 'hero', onNavigate }: StickyHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { scrollDirection, isAtTop } = useScrollDirection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const handleNavClick = (id: string) => {
    onNavigate?.(id);
    setMobileMenuOpen(false);
  };

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isHidden = scrollDirection === 'down' && !isAtTop && !mobileMenuOpen;
  const isTransparent = isAtTop && !mobileMenuOpen;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isHidden ? 0 : 1, y: isHidden ? -10 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isTransparent
            ? 'bg-transparent'
            : 'bg-[var(--bg-secondary)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm'}
        `}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">

            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); handleNavClick('hero'); }}
              className="flex items-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 rounded-lg"
              aria-label="DriveSmart — Trang chủ"
            >
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-[var(--text-primary)] hidden sm:block">
                DriveSmart
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => { e.preventDefault(); handleNavClick(item.id); }}
                    className={`
                      relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                      min-h-[40px] flex items-center
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
                      ${isActive
                        ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {language === 'vi' ? item.labelVi : item.labelEn}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--accent)] rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Controls */}
            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="px-2 py-1.5 text-xs font-bold rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors min-w-[44px] min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={`Switch to ${language === 'vi' ? 'English' : 'Tiếng Việt'}`}
              >
                {language === 'vi' ? 'EN' : 'VI'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors min-w-[44px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.span key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                      <Sun className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                      <Moon className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Login / Register — desktop */}
              <div className="hidden lg:flex items-center gap-2 ml-1">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors min-h-[36px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  {language === 'vi' ? 'Đăng nhập' : 'Login'}
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-dark)] rounded-lg transition-colors min-h-[36px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  {language === 'vi' ? 'Đăng ký' : 'Register'}
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                      <X className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                      <Menu className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ top: '56px' }}
            role="dialog"
            aria-label="Mobile navigation"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.nav
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative bg-[var(--bg-secondary)] border-b border-[var(--border)] shadow-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => { e.preventDefault(); handleNavClick(item.id); }}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset
                        transition-colors duration-150
                        ${isActive
                          ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
                      `}
                    >
                      <span>{language === 'vi' ? item.labelVi : item.labelEn}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      )}
                    </motion.a>
                  );
                })}

                {/* Mobile auth buttons */}
                <div className="pt-3 pb-1 border-t border-[var(--border)] flex gap-3 mt-3">
                  <Link
                    to="/auth/login"
                    className="flex-1 px-4 py-3 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors min-h-[48px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                  >
                    {language === 'vi' ? 'Đăng nhập' : 'Login'}
                  </Link>
                  <Link
                    to="/auth/register"
                    className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-dark)] rounded-xl transition-colors min-h-[48px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                  >
                    {language === 'vi' ? 'Đăng ký' : 'Register'}
                  </Link>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Menu, Zap, MoreVertical, ExternalLink, BookOpen, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { useTheme } from '../../../context/ThemeContext'

function DarkModeToggleSwitch() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        isDark ? 'bg-[#4F46E5]' : 'bg-[#E5E7EB]',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          isDark ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

interface LessonTopBarProps {
  title: string
  level?: string
  sourceUrl?: string
  description?: string
  duration?: string
  currentProgress: number
  totalProgress: number
  xp: number
  onBack: () => void
  className?: string
}

export default function LessonTopBar({
  title,
  level,
  sourceUrl,
  description,
  duration,
  currentProgress,
  totalProgress,
  xp,
  onBack,
  className,
}: LessonTopBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleInfoClick = () => {
    setIsMenuOpen(false)
    setShowInfoModal(true)
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-transform duration-200',
          className
        )}
        style={{
          height: '64px',
          backgroundColor: 'var(--bg-primary-alpha, var(--bg-primary))',
          borderColor: 'var(--border)',
        }}
        initial={{ translateY: 0 }}
        animate={{ translateY: isVisible ? 0 : -100 }}
      >
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4 max-w-screen-xl mx-auto">
          {/* Left: Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-colors flex-shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Quay lại</span>
          </button>

          {/* Center: Title & Progress */}
          <div className="flex-1 text-center min-w-0">
            <h1 className="font-semibold text-sm sm:text-base truncate px-2" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              {level && (
                <span className="px-2 py-0.5 text-xs rounded-full capitalize" style={{ backgroundColor: 'var(--accent-alpha, var(--accent))', color: 'var(--accent-text, white)' }}>
                  {level}
                </span>
              )}
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {currentProgress}/{totalProgress} câu
              </span>
            </div>
          </div>

          {/* Right: XP & Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#F59E0B]/10 rounded-full">
              <Zap size={14} className="text-[#F59E0B]" />
              <span className="text-sm font-semibold text-[#F59E0B]">{xp} XP</span>
            </div>

            {/* Menu button */}
            <div ref={menuRef} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Menu"
              >
                <MoreVertical size={18} />
              </button>
              <style>{`
                .dark .menu-hover:hover {
                  background-color: rgba(255,255,255,0.1);
                }
              `}</style>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Dark mode
                      </p>
                      <DarkModeToggleSwitch />
                    </div>
                    <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                    <button
                      onClick={handleInfoClick}
                      className="w-full px-4 py-3 text-left text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Thông tin bài học
                    </button>
                    <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50/50 transition-colors"
                      style={{ color: '#EF4444' }}
                    >
                      Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--border)' }}>
          <motion.div
            className="h-full"
            style={{
              width: totalProgress > 0 ? `${(currentProgress / totalProgress) * 100}%` : '0%',
              background: 'linear-gradient(to right, var(--accent), #7C3AED)',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.header>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl shadow-2xl max-w-md w-full p-6"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Thông tin bài học</h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                  style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Tiêu đề</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
                </div>

                {description && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Mô tả</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{description}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 flex-wrap">
                  {level && (
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span className="px-2 py-1 text-xs rounded-full capitalize" style={{ backgroundColor: 'var(--accent-alpha)', color: 'var(--accent-text, white)' }}>
                        {level}
                      </span>
                    </div>
                  )}
                  {duration && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{duration}</span>
                    </div>
                  )}
                </div>

                {sourceUrl && (
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Nguồn trích dẫn</p>
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl transition-colors group"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      <ExternalLink size={18} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
                      <span className="text-sm truncate group-hover:underline" style={{ color: 'var(--accent)' }}>
                        {sourceUrl}
                      </span>
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                    DriveSmart không lưu trữ nội dung audio hay transcript từ BBC. Dữ liệu cá nhân của bạn chỉ được lưu trong tài khoản.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

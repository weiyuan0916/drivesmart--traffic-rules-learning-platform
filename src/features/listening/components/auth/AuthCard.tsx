import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'

interface AuthCardProps {
  children: ReactNode
  title: string
  subtitle: string
  footer?: ReactNode
}

export function AuthCard({ children, title, subtitle, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 rounded-lg"
            aria-label="DriveSmart — Trang chủ"
          >
            <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">DriveSmart</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
          className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] shadow-lg p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1.5">{title}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
          </div>

          {/* Content */}
          {children}
        </motion.div>

        {/* Footer */}
        {footer && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-xs text-[var(--text-muted)] mt-6 leading-relaxed"
          >
            {footer}
          </motion.p>
        )}
      </div>
    </div>
  )
}

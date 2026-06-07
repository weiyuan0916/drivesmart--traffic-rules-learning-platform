import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, BarChart3, User } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Trang chủ' },
  { to: '/topics', icon: BookOpen, label: 'Bài học' },
  { to: '/progress', icon: BarChart3, label: 'Tiến độ' },
  { to: '/history', icon: BookOpen, label: 'Lịch sử' },
]

export function ListeningLayout() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-text-primary',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:pb-0 pb-20">
        <Outlet />
      </main>
    </div>
  )
}

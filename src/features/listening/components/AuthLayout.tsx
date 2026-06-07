import { Outlet, Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/topics" className="inline-flex items-center gap-2">
            <Logo size={40} />
            <span className="text-2xl font-bold text-primary">VinaListen</span>
          </Link>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-2xl border border-border shadow-lg p-6">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Điều khoản sử dụng
          </Link>{' '}
          và{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>
        </p>
      </div>
    </div>
  )
}

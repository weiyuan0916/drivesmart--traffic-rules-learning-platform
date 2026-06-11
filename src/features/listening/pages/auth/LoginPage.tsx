import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { AuthCard } from '../../components/auth/AuthCard'
import { OAuthButton } from '../../components/auth/OAuthButton'
import { FormInput } from '../../components/auth/FormInput'
import { login, setToken } from '../../api/authApi'
import { useAuthStore } from '../../stores/authStore'
import { useOAuth } from '../../hooks/useOAuth'

interface LoginForm {
  email: string
  password: string
}

const DIVIDER_TEXT = {
  vi: 'Hoặc tiếp tục với',
  en: 'Or continue with',
}

export default function LoginPage() {
  const { login: loginStore } = useAuthStore()
  const { initiateOAuth, isLoading: oauthLoading, error: oauthError } = useOAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const isLoading = isSubmitting || oauthLoading

  const onSubmit = async (data: LoginForm) => {
    setApiError(null)
    try {
      const { user, token } = await login({ email: data.email, password: data.password })
      setToken(token)
      loginStore(user, token)
      window.location.href = '/topics'
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string }
      const lang = document.documentElement.lang === 'en' ? 'en' : 'vi'
      if (error.code === 'E_AUTH_001') {
        setApiError(
          lang === 'en'
            ? 'Invalid email or password.'
            : 'Email hoặc mật khẩu không đúng.'
        )
      } else {
        setApiError(
          error.message ??
            (lang === 'en' ? 'Something went wrong. Please try again.' : 'Đã xảy ra lỗi. Vui lòng thử lại.')
        )
      }
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setApiError(null)
    try {
      await initiateOAuth(provider)
      window.location.href = '/topics'
    } catch {
      // Error is already managed by useOAuth
    }
  }

  return (
    <AuthCard
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay trở lại"
      footer={
        <>
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <Link to="/terms" className="text-[var(--accent)] hover:underline font-medium">
            Điều khoản sử dụng
          </Link>{' '}
          và{' '}
          <Link to="/privacy" className="text-[var(--accent)] hover:underline font-medium">
            Chính sách bảo mật
          </Link>
        </>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-5"
      >
        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-3">
          <OAuthButton
            provider="google"
            onClick={() => handleOAuth('google')}
            isLoading={oauthLoading}
            disabled={isSubmitting}
          />
          <OAuthButton
            provider="github"
            onClick={() => handleOAuth('github')}
            isLoading={oauthLoading}
            disabled={isSubmitting}
          />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]">
              Hoặc đăng nhập với email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* API Error */}
          {(apiError || oauthError) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl text-sm text-[var(--error)]"
              role="alert"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {apiError ?? oauthError}
            </motion.div>
          )}

          <FormInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Email là bắt buộc.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email không hợp lệ.',
              },
            })}
          />

          <div className="relative">
            <FormInput
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Mật khẩu là bắt buộc.',
                minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.' },
              })}
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:ring-offset-2 cursor-pointer accent-[var(--accent)]"
              />
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Ghi nhớ đăng nhập
              </span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-[var(--accent)] hover:underline font-medium text-sm focus-visible:outline-none focus-visible:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-semibold text-sm rounded-xl transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-lg hover:shadow-[var(--accent)]/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Chưa có tài khoản?{' '}
          <Link
            to="/auth/register"
            className="text-[var(--accent)] font-semibold hover:underline focus-visible:outline-none"
          >
            Đăng ký miễn phí
          </Link>
        </p>
      </motion.div>
    </AuthCard>
  )
}

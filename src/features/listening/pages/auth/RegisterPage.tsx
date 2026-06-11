import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { AuthCard } from '../../components/auth/AuthCard'
import { OAuthButton } from '../../components/auth/OAuthButton'
import { FormInput } from '../../components/auth/FormInput'
import { register as registerApi, setToken } from '../../api/authApi'
import { useAuthStore } from '../../stores/authStore'
import { useOAuth } from '../../hooks/useOAuth'

interface RegisterForm {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export default function RegisterPage() {
  const { login: loginStore } = useAuthStore()
  const { initiateOAuth, isLoading: oauthLoading } = useOAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  const password = watch('password')
  const isLoading = isSubmitting || oauthLoading

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null)
    try {
      const { user, token } = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      setToken(token)
      loginStore(user, token)
      window.location.href = '/onboarding'
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> }
      if (error.errors) {
        // Field-level validation errors from Laravel
        const firstFieldError = Object.values(error.errors)[0]
        setApiError(Array.isArray(firstFieldError) ? firstFieldError[0] : String(firstFieldError))
      } else {
        setApiError(
          error.message ??
            'Đã xảy ra lỗi. Vui lòng thử lại.'
        )
      }
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setApiError(null)
    try {
      await initiateOAuth(provider)
      window.location.href = '/onboarding'
    } catch {
      // Error managed by useOAuth
    }
  }

  return (
    <AuthCard
      title="Tạo tài khoản"
      subtitle="Bắt đầu hành trình học tập miễn phí"
      footer={
        <>
          Bằng việc đăng ký, bạn đồng ý với{' '}
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
              Hoặc đăng ký với email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* API Error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl text-sm text-[var(--error)]"
              role="alert"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {apiError}
            </motion.div>
          )}

          <FormInput
            label="Họ và tên"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            leftIcon={<User className="w-4 h-4" />}
            required
            error={errors.name?.message}
            {...register('name', {
              required: 'Vui lòng nhập họ và tên.',
              minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự.' },
              maxLength: { value: 255, message: 'Tên quá dài.' },
            })}
          />

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
              autoComplete="new-password"
              placeholder="Ít nhất 8 ký tự"
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
              hint="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc.',
                minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' },
              })}
            />
          </div>

          <div className="relative">
            <FormInput
              label="Xác nhận mật khẩu"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
              error={errors.password_confirmation?.message}
              {...register('password_confirmation', {
                required: 'Vui lòng xác nhận mật khẩu.',
                validate: (value) =>
                  value === password || 'Mật khẩu xác nhận không khớp.',
              })}
            />
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--accent)] focus:ring-offset-2 cursor-pointer accent-[var(--accent)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-relaxed">
              Tôi đã đọc và đồng ý với{' '}
              <Link to="/terms" className="text-[var(--accent)] hover:underline font-medium">
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-[var(--accent)] hover:underline font-medium">
                Chính sách bảo mật
              </Link>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-semibold text-sm rounded-xl transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-lg hover:shadow-[var(--accent)]/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tạo tài khoản...
              </span>
            ) : (
              'Tạo tài khoản miễn phí'
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Đã có tài khoản?{' '}
          <Link
            to="/auth/login"
            className="text-[var(--accent)] font-semibold hover:underline focus-visible:outline-none"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </motion.div>
    </AuthCard>
  )
}

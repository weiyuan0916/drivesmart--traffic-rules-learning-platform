import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--error)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Đã xảy ra lỗi
            </h1>
            <p className="text-muted-foreground mb-6">
              Rất tiếc, đã có lỗi xảy ra. Vui lòng tải lại trang.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Tải lại trang
            </button>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 text-left p-4 bg-bg-tertiary rounded-lg text-xs overflow-auto max-h-48 text-error">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

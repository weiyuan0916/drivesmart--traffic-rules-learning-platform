import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * OAuth Callback Page
 *
 * This page is opened in a popup window by the OAuth flow.
 * It reads the token from the URL, stores it in localStorage,
 * and sends it to the opener window via postMessage, then closes.
 *
 * Backend redirects here after OAuth: /auth/callback?token=xxx&user=...
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userParam = params.get('user')

    if (token && userParam) {
      try {
        const user = JSON.parse(atob(userParam))
        // Store in localStorage for the opener to pick up
        localStorage.setItem('oauth_token', JSON.stringify({ token, user }))
        // Notify opener
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', token, user }, window.location.origin)
        }
        // Close popup after short delay
        setTimeout(() => {
          window.close()
        }, 500)
      } catch {
        navigate('/auth/login?error=oauth_failed')
      }
    } else {
      const error = params.get('error')
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_ERROR', error: error ?? 'unknown' }, window.location.origin)
      }
      navigate('/auth/login?error=' + (error ?? 'oauth_failed'))
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">Đang xác thực...</p>
      </div>
    </div>
  )
}

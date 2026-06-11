/**
 * OAuth Callback Page
 *
 * This page is opened in a popup window by the OAuth flow.
 * Backend redirects here after OAuth: /auth/callback?token=xxx&user=...
 * It parses the token, sends it to the opener via postMessage, then closes.
 *
 * The MESSAGE_SOURCE identifier must match what useOAuth.ts listens for.
 */
const MESSAGE_SOURCE = 'drivesmart-oauth'

export default function OAuthCallbackPage() {
  const handleCallback = () => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userParam = params.get('user')
    const error = params.get('error')

    if (token && userParam) {
      try {
        const user = JSON.parse(atob(userParam))
        if (window.opener) {
          window.opener.postMessage(
            { source: MESSAGE_SOURCE, type: 'OAUTH_SUCCESS', token, user },
            window.location.origin
          )
        }
      } catch {
        // Fall through to error redirect
      }
    }

    if (error || !token || !userParam) {
      if (window.opener) {
        window.opener.postMessage(
          { source: MESSAGE_SOURCE, type: 'OAUTH_ERROR', error: error ?? 'oauth_failed' },
          window.location.origin
        )
      }
    }

    // Close popup after short delay to allow postMessage to be sent
    setTimeout(() => {
      window.close()
    }, 500)
  }

  // Run synchronously after render so postMessage is sent as early as possible
  handleCallback()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">Đang xác thực...</p>
      </div>
    </div>
  )
}

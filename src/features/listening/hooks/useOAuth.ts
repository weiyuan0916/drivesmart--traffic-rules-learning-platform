import { useCallback, useState } from 'react'
import { getOAuthRedirectUrl, extractOAuthToken, setToken } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'

interface UseOAuthReturn {
  initiateOAuth: (provider: 'google' | 'github') => Promise<void>
  isLoading: boolean
  error: string | null
}

const POPUP_WIDTH = 500
const POPUP_HEIGHT = 700

/**
 * Hook to initiate OAuth flow in a popup window.
 * Handles opening the popup, polling for the auth token, and storing it.
 */
export function useOAuth(): UseOAuthReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()

  const initiateOAuth = useCallback(async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    try {
      // Get redirect URL from our backend
      const redirectUrl = await getOAuthRedirectUrl(provider)

      // Calculate popup position
      const left = Math.round(window.screenX + (window.outerWidth - POPUP_WIDTH) / 2)
      const top = Math.round(window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2)

      // Open OAuth popup
      const popup = window.open(
        redirectUrl,
        `${provider}-oauth`,
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`
      )

      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.')
      }

      // Poll for the auth token in localStorage (set by the OAuth callback handler)
      await new Promise<void>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          try {
            // The popup sets oauth_token in localStorage on success
            const tokenData = extractOAuthToken()

            if (tokenData) {
              clearInterval(checkInterval)
              setToken(tokenData.token)
              login(tokenData.user, tokenData.token)
              popup.close()
              resolve()
            }

            // Check if popup was closed manually
            if (popup.closed) {
              clearInterval(checkInterval)
              reject(new Error('Authentication was cancelled.'))
            }
          } catch {
            // Cross-origin error — popup is still on OAuth provider page
          }
        }, 500)

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval)
          if (!popup.closed) popup.close()
          reject(new Error('Authentication timed out.'))
        }, 5 * 60 * 1000)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [login])

  return { initiateOAuth, isLoading, error }
}

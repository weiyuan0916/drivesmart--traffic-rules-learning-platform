import { useCallback, useEffect, useRef, useState } from 'react'
import { getOAuthRedirectUrl, setToken } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'

interface UseOAuthReturn {
  initiateOAuth: (provider: 'google' | 'github') => Promise<void>
  isLoading: boolean
  error: string | null
}

const POPUP_WIDTH = 500
const POPUP_HEIGHT = 700

const MESSAGE_SOURCE = 'drivesmart-oauth'

interface OAuthSuccessMessage {
  source: typeof MESSAGE_SOURCE
  type: 'OAUTH_SUCCESS'
  token: string
  user: Record<string, unknown>
}

interface OAuthErrorMessage {
  source: typeof MESSAGE_SOURCE
  type: 'OAUTH_ERROR'
  error: string
}

type OAuthMessage = OAuthSuccessMessage | OAuthErrorMessage

/**
 * Hook to initiate OAuth flow in a popup window.
 * Uses postMessage (not localStorage) to communicate between popup and opener,
 * which works across different origins (e.g. localhost:3000 ↔ localhost:8000).
 */
export function useOAuth(): UseOAuthReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()
  const popupRef = useRef<Window | null>(null)
  const listenerRef = useRef<((e: MessageEvent) => void) | null>(null)

  // Cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('message', listenerRef.current)
      }
    }
  }, [])

  const initiateOAuth = useCallback(async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    // Remove any stale listener
    if (listenerRef.current) {
      window.removeEventListener('message', listenerRef.current)
      listenerRef.current = null
    }

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
      popupRef.current = popup

      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.')
      }

      // Listen for postMessage from the popup
      await new Promise<void>((resolve, reject) => {
        const handleMessage = (event: MessageEvent<OAuthMessage>) => {
          // Only accept messages from our own OAuth flow
          if (event.data?.source !== MESSAGE_SOURCE) return
          if (event.data.type === 'OAUTH_SUCCESS') {
            setToken(event.data.token)
            login(
              {
                id: String(event.data.user.id),
                email: String(event.data.user.email ?? ''),
                name: String(event.data.user.name ?? ''),
                avatarUrl: event.data.user.avatar_url
                  ? String(event.data.user.avatar_url)
                  : null,
                level: Number(event.data.user.level ?? 1),
                totalXp: Number(event.data.user.total_xp ?? 0),
                currentStreak: Number(event.data.user.current_streak ?? 0),
                longestStreak: Number(event.data.user.longest_streak ?? 0),
                lastLessonDate: event.data.user.last_lesson_date
                  ? String(event.data.user.last_lesson_date)
                  : null,
                learningGoal: 'daily',
                timezone: String(event.data.user.timezone ?? 'Asia/Ho_Chi_Minh'),
                dailyGoalMinutes: Number(event.data.user.daily_goal_minutes ?? 10),
                onboardingCompleted: Boolean(event.data.user.onboarding_completed ?? false),
                createdAt: event.data.user.created_at
                  ? String(event.data.user.created_at)
                  : new Date().toISOString(),
                updatedAt: event.data.user.updated_at
                  ? String(event.data.user.updated_at)
                  : new Date().toISOString(),
              },
              event.data.token
            )
            popupRef.current?.close()
            resolve()
          } else if (event.data.type === 'OAUTH_ERROR') {
            popupRef.current?.close()
            reject(new Error(event.data.error ?? 'Authentication failed.'))
          }
        }

        listenerRef.current = handleMessage
        window.addEventListener('message', handleMessage)

        // Poll for popup close (fallback if postMessage doesn't fire)
        const pollClosed = setInterval(() => {
          if (!popupRef.current || popupRef.current.closed) {
            clearInterval(pollClosed)
            window.removeEventListener('message', handleMessage)
            listenerRef.current = null
            // Only reject if we haven't received a success message
            reject(new Error('Authentication was cancelled.'))
          }
        }, 500)

        // Cleanup on resolve
        const cleanup = () => {
          clearInterval(pollClosed)
          window.removeEventListener('message', handleMessage)
          listenerRef.current = null
        }
        // Override resolve/reject to cleanup first
        const originalResolve = resolve
        const originalReject = reject
        resolve = (v) => { cleanup(); originalResolve(v) }
        reject = (e) => { cleanup(); originalReject(e) }
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

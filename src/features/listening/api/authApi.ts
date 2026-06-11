// ============================================================
// Auth API — DriveSmart
// API calls for authentication endpoints
// ============================================================

import { apiClient } from './client'
import type { User } from '../types'

// ── Response Transformers ────────────────────────────────────
// Transform backend snake_case response → frontend camelCase User

function transformUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id),
    email: String(raw.email ?? ''),
    name: String(raw.name ?? ''),
    avatarUrl: raw.avatar_url ? String(raw.avatar_url) : null,
    level: Number(raw.level ?? 1),
    totalXp: Number(raw.total_xp ?? 0),
    currentStreak: Number(raw.current_streak ?? 0),
    longestStreak: Number(raw.longest_streak ?? 0),
    lastLessonDate: raw.last_lesson_date ? String(raw.last_lesson_date) : null,
    learningGoal: (raw.learning_goal as User['learningGoal']) ?? 'daily',
    timezone: String(raw.timezone ?? 'Asia/Ho_Chi_Minh'),
    dailyGoalMinutes: Number(raw.daily_goal_minutes ?? 10),
    onboardingCompleted: Boolean(raw.onboarding_completed ?? false),
    createdAt: raw.created_at ? String(raw.created_at) : new Date().toISOString(),
    updatedAt: raw.updated_at ? String(raw.updated_at) : new Date().toISOString(),
  }
}

// ── Payload Types ────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  timezone?: string
  learning_goal?: string
  daily_goal_minutes?: number
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

// ── Auth API ─────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<{ user: User; token: string }> {
  const response = await apiClient.post<{
    data: { user: Record<string, unknown>; token: string; token_type: string }
  }>('/api/v1/auth/login', payload)
  return {
    user: transformUser(response.data.user),
    token: response.data.token,
  }
}

export async function register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
  const response = await apiClient.post<{
    data: { user: Record<string, unknown>; token: string; token_type: string }
  }>('/api/v1/auth/register', payload)
  return {
    user: transformUser(response.data.user),
    token: response.data.token,
  }
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout')
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<{ data: Record<string, unknown> }>('/api/v1/auth/me')
  return transformUser(response.data)
}

// ── OAuth ────────────────────────────────────────────────────

/**
 * Get the OAuth redirect URL from our backend.
 */
export async function getOAuthRedirectUrl(provider: 'google' | 'github'): Promise<string> {
  const response = await apiClient.get<{ data: { redirect_url: string } }>(
    `/api/v1/auth/${provider}/redirect`
  )
  return response.data.redirect_url
}

/**
 * Store the token in the shared API client.
 */
export function setToken(token: string): void {
  apiClient.setToken(token)
}

/**
 * Clear the token from the shared API client.
 */
export function clearToken(): void {
  apiClient.setToken(null)
}

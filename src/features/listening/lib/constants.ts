// ============================================================
// Constants — VinaListen
// ============================================================

// XP System
export const XP_PER_LEVEL = 100
export const XP_BONUS_STREAK_7 = 30
export const XP_BONUS_STREAK_30 = 100

export const LEVEL_THRESHOLDS = Array.from({ length: 20 }, (_, i) => ({
  level: i + 1,
  xpRequired: i * XP_PER_LEVEL,
}))

// Playback Speeds
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

// Daily Goals
export const DAILY_GOALS = [5, 10, 20, 30] as const
export type DailyGoalMinutes = (typeof DAILY_GOALS)[number]

// Learning Goals
export const LEARNING_GOALS = [
  { value: 'ielts', label: 'IELTS' },
  { value: 'toeic', label: 'TOEIC' },
  { value: 'daily', label: 'Giao tiếp' },
  { value: 'business', label: 'Business' },
] as const

// Levels
export const VOCAB_LEVELS = [
  { value: 'beginner', label: 'Sơ cấp' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'advanced', label: 'Nâng cao' },
] as const

// Breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Toast Duration
export const TOAST_DURATION = 4000
export const TOAST_DURATION_LONG = 6000

// Audio
export const MAX_RECORDING_SECONDS = 30
export const MIN_RECORDING_SECONDS = 1

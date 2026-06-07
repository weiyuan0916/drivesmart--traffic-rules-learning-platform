// ============================================================
// Shared Types — VinaListen
// ============================================================

// --- User & Auth ---

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  level: number
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastLessonDate: string | null
  learningGoal: LearningGoal
  timezone: string
  dailyGoalMinutes: number
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type LearningGoal = 'ielts' | 'toeic' | 'daily' | 'business'

export interface AuthToken {
  token: string
  tokenType: string
}

// --- Topics & Lessons ---

export interface Topic {
  id: string
  slug: string
  name: string
  nameVi: string | null
  description: string | null
  descriptionVi: string | null
  icon: string
  color: string
  orderIndex: number
  isActive: boolean
  lessonCount?: number
  completedCount?: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  topicId: string
  slug: string
  name: string
  audioUrl: string
  duration: number
  vocabLevel: VocabLevel
  orderIndex: number
  clipCount?: number
  createdAt: string
  updatedAt: string
}

export interface LessonClip {
  id: string
  lessonId: string
  transcript: string
  audioUrl: string
  duration: number
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type VocabLevel = 'beginner' | 'intermediate' | 'advanced'

// --- Progress ---

export interface UserProgress {
  id: string
  userId: string
  lessonId: string
  accuracy: number | null
  xpEarned: number
  timeSeconds: number
  attemptCount: number
  bestScore: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DailyActivity {
  id: string
  userId: string
  date: string
  lessonsDone: number
  clipsDone: number
  timeMinutes: number
  xpEarned: number
  createdAt: string
  updatedAt: string
}

export interface UserClipProgress {
  id: string
  userId: string
  clipId: string
  transcriptInput: string | null
  accuracy: number | null
  transcribedText: string | null
  speakingScore: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

// --- Scoring ---

export interface ScoreResult {
  accuracy: number
  xpEarned: number
  correctCount: number
  wrongCount: number
  missingCount: number
  extraCount: number
  totalWords: number
  wordResults: WordResult[]
}

export interface WordResult {
  word: string
  status: WordStatus
  expected?: string
}

export type WordStatus = 'correct' | 'wrong' | 'missing' | 'extra'

// --- Dashboard ---

export interface DashboardStats {
  totalLessons: number
  totalClips: number
  totalMinutes: number
  avgAccuracy: number
  currentStreak: number
  longestStreak: number
  totalXp: number
  level: number
  xpToNextLevel: number
}

export interface WeeklyActivity {
  date: string
  lessonsDone: number
  clipsDone: number
  xpEarned: number
}

// --- History ---

export interface HistoryItem {
  id: string
  lessonId: string
  lessonName: string
  topicName: string
  topicSlug: string
  accuracy: number | null
  xpEarned: number
  timeSeconds: number
  completedAt: string
}

// --- API Response Wrappers ---

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  code: string
  message: string
  errors?: Record<string, string[]>
}

// --- Listening Module Page View ---

export type ListeningView = 'topics' | 'topic-detail' | 'lesson' | 'complete'

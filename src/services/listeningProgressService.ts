// User progress and bookmarks service (localStorage for MVP)
import type {
  UserListeningProgress,
  CompletedLesson,
  Bookmark,
} from '@/types/listening';

const PROGRESS_KEY = 'drivesmart_listening_progress';
const BOOKMARKS_KEY = 'drivesmart_listening_bookmarks';

function getProgress(): UserListeningProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    completedLessons: [],
    streakDays: 0,
    lastPracticeDate: '',
    totalListeningMinutes: 0,
  };
}

function saveProgress(progress: UserListeningProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getStreakDays(): number {
  return getProgress().streakDays;
}

export function getTotalListeningMinutes(): number {
  return getProgress().totalListeningMinutes;
}

export function getCompletedLessons(): CompletedLesson[] {
  return getProgress().completedLessons;
}

export function getRecentLessons(limit = 5): CompletedLesson[] {
  return [...getProgress().completedLessons]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit);
}

export function getAverageAccuracy(): number {
  const completed = getProgress().completedLessons;
  if (completed.length === 0) return 0;
  const sum = completed.reduce((acc, l) => acc + l.accuracy, 0);
  return Math.round(sum / completed.length);
}

export function recordCompletedLesson(
  lesson: CompletedLesson,
  durationSeconds: number,
): void {
  const progress = getProgress();
  const today = new Date().toISOString().split('T')[0];

  // Update streak
  if (progress.lastPracticeDate) {
    const lastDate = new Date(progress.lastPracticeDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      progress.streakDays += 1;
    } else if (diffDays > 1) {
      progress.streakDays = 1;
    }
  } else {
    progress.streakDays = 1;
  }
  progress.lastPracticeDate = today;

  // Update total listening minutes
  progress.totalListeningMinutes += Math.floor(durationSeconds / 60);

  // Add to completed lessons (replace if same lesson)
  const existingIdx = progress.completedLessons.findIndex(
    (l) => l.lessonId === lesson.lessonId,
  );
  if (existingIdx >= 0) {
    progress.completedLessons[existingIdx] = lesson;
  } else {
    progress.completedLessons.push(lesson);
  }

  saveProgress(progress);
}

export function getWeeklyActivity(): { day: string; count: number }[] {
  const completed = getProgress().completedLessons;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = days[d.getDay()];
    result[key] = 0;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);

  for (const lesson of completed) {
    const date = new Date(lesson.completedAt);
    if (date >= cutoff) {
      const key = days[date.getDay()];
      if (key in result) result[key]++;
    }
  }

  return Object.entries(result).map(([day, count]) => ({ day, count }));
}

export function getMonthlyAccuracy(): { label: string; accuracy: number }[] {
  const completed = getProgress().completedLessons;
  const result: Record<string, { total: number; count: number }> = {};

  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const label = `W${4 - i}`;
    result[label] = { total: 0, count: 0 };
  }

  for (const lesson of completed) {
    const label = `W${Math.floor(Math.random() * 4) + 1}`;
    if (label in result) {
      result[label].total += lesson.accuracy;
      result[label].count++;
    }
  }

  return Object.entries(result).map(([label, data]) => ({
    label,
    accuracy: data.count > 0 ? Math.round(data.total / data.count) : 0,
  }));
}

// Bookmarks
function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveBookmarks(bookmarks: Bookmark[]): void {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function getAllBookmarks(): Bookmark[] {
  return getBookmarks();
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  bookmarks.unshift(bookmark);
  saveBookmarks(bookmarks);
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks().filter((b) => b.id !== id);
  saveBookmarks(bookmarks);
}

export function isLessonBookmarked(lessonId: number): boolean {
  return getBookmarks().some((b) => b.type === 'lesson' && b.lessonId === lessonId);
}

export function isSentenceBookmarked(sentence: string): boolean {
  return getBookmarks().some((b) => b.type === 'sentence' && b.sentence === sentence);
}

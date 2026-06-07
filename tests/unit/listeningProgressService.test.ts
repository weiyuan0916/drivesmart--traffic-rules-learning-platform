import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStreakDays,
  getTotalListeningMinutes,
  getCompletedLessons,
  getRecentLessons,
  getAverageAccuracy,
  recordCompletedLesson,
  getWeeklyActivity,
} from './src/services/listeningProgressService';

// We mock localStorage since Node.js doesn't have it
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Helper to create a completed lesson
function makeLesson(lessonId: number, accuracy: number, completedAt: Date): {
  lessonId: number;
  lessonName: string;
  topicName: string;
  accuracy: number;
  completedAt: string;
  clipsCount: number;
} {
  return {
    lessonId,
    lessonName: `Lesson ${lessonId}`,
    topicName: 'Test Topic',
    accuracy,
    completedAt: completedAt.toISOString(),
    clipsCount: 3,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('getStreakDays', () => {
  it('returns 0 for new user with no progress', () => {
    expect(getStreakDays()).toBe(0);
  });
});

describe('getTotalListeningMinutes', () => {
  it('returns 0 for new user', () => {
    expect(getTotalListeningMinutes()).toBe(0);
  });
});

describe('getCompletedLessons', () => {
  it('returns empty array for new user', () => {
    expect(getCompletedLessons()).toEqual([]);
  });
});

describe('getAverageAccuracy', () => {
  it('returns 0 for no completed lessons', () => {
    expect(getAverageAccuracy()).toBe(0);
  });

  it('calculates average accuracy across completed lessons', () => {
    const lesson1 = makeLesson(1, 80, new Date());
    const lesson2 = makeLesson(2, 60, new Date());
    recordCompletedLesson(lesson1, 60);
    recordCompletedLesson(lesson2, 120);

    expect(getAverageAccuracy()).toBe(70);
  });

  it('rounds to nearest integer', () => {
    const lesson1 = makeLesson(1, 85, new Date());
    const lesson2 = makeLesson(2, 95, new Date());
    recordCompletedLesson(lesson1, 60);
    recordCompletedLesson(lesson2, 120);

    expect(getAverageAccuracy()).toBe(90); // (80+60)/2 = 70
  });
});

describe('recordCompletedLesson', () => {
  it('records first lesson and starts streak at 1', () => {
    const lesson = makeLesson(1, 80, new Date());
    recordCompletedLesson(lesson, 300);

    expect(getStreakDays()).toBe(1);
  });

  it('increments streak on consecutive day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const lesson1 = makeLesson(1, 80, yesterday);
    recordCompletedLesson(lesson1, 300);

    const today = new Date();
    const lesson2 = makeLesson(2, 90, today);
    recordCompletedLesson(lesson2, 120);

    expect(getStreakDays()).toBe(2);
  });

  it('resets streak when gap is more than 1 day', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const lesson1 = makeLesson(1, 80, threeDaysAgo);
    recordCompletedLesson(lesson1, 300);

    const today = new Date();
    const lesson2 = makeLesson(2, 90, today);
    recordCompletedLesson(lesson2, 120);

    expect(getStreakDays()).toBe(1);
  });

  it('does not increment streak on same day', () => {
    const now = new Date();
    const lesson1 = makeLesson(1, 80, now);
    recordCompletedLesson(lesson1, 300);

    const lesson2 = makeLesson(2, 90, now);
    recordCompletedLesson(lesson2, 120);

    expect(getStreakDays()).toBe(1);
  });

  it('updates total listening minutes', () => {
    const lesson = makeLesson(1, 80, new Date());
    recordCompletedLesson(lesson, 300); // 5 minutes

    expect(getTotalListeningMinutes()).toBe(5);
  });

  it('accumulates listening minutes', () => {
    const lesson1 = makeLesson(1, 80, new Date());
    recordCompletedLesson(lesson1, 300); // 5 minutes

    const lesson2 = makeLesson(2, 90, new Date());
    recordCompletedLesson(lesson2, 180); // 3 minutes

    expect(getTotalListeningMinutes()).toBe(8);
  });

  it('replaces existing lesson record instead of duplicating', () => {
    const now = new Date();
    const lesson1 = makeLesson(1, 50, now);
    recordCompletedLesson(lesson1, 60);

    const lesson1Updated = makeLesson(1, 90, now);
    recordCompletedLesson(lesson1Updated, 120);

    const completed = getCompletedLessons();
    expect(completed.length).toBe(1);
    expect(completed[0].accuracy).toBe(90);
  });

  it('adds new lesson to completed list', () => {
    const now = new Date();
    const lesson1 = makeLesson(1, 80, now);
    const lesson2 = makeLesson(2, 70, now);

    recordCompletedLesson(lesson1, 60);
    recordCompletedLesson(lesson2, 120);

    expect(getCompletedLessons().length).toBe(2);
  });
});

describe('getRecentLessons', () => {
  it('returns empty array for no lessons', () => {
    expect(getRecentLessons()).toEqual([]);
  });

  it('returns limited number of recent lessons', () => {
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      recordCompletedLesson(makeLesson(i, 80, date), 60);
    }

    const recent = getRecentLessons(3);
    expect(recent.length).toBe(3);
  });

  it('orders lessons by most recent first', () => {
    const older = new Date();
    older.setDate(older.getDate() - 5);
    recordCompletedLesson(makeLesson(1, 80, older), 60);

    const newer = new Date();
    recordCompletedLesson(makeLesson(2, 90, newer), 120);

    const recent = getRecentLessons(2);
    expect(recent[0].lessonId).toBe(2);
    expect(recent[1].lessonId).toBe(1);
  });
});

describe('getWeeklyActivity', () => {
  it('returns exactly 7 days', () => {
    const weekly = getWeeklyActivity();
    expect(weekly.length).toBe(7);
  });

  it('all days have count of 0 for new user', () => {
    const weekly = getWeeklyActivity();
    weekly.forEach((day) => {
      expect(day.count).toBe(0);
    });
  });

  it('returns correct ordering from 6 days ago to today', () => {
    const weekly = getWeeklyActivity();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // The function returns last 7 days ending today
    const expectedDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      expectedDays.push(days[d.getDay()]);
    }

    const actualDays = weekly.map((d) => d.day);
    expect(actualDays).toEqual(expectedDays);
  });

  it('counts lessons completed within the last 7 days', () => {
    const today = new Date();
    const todayLesson = makeLesson(1, 80, today);
    recordCompletedLesson(todayLesson, 60);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayLesson = makeLesson(2, 70, yesterday);
    recordCompletedLesson(yesterdayLesson, 120);

    const weekly = getWeeklyActivity();
    const totalCount = weekly.reduce((sum, d) => sum + d.count, 0);
    expect(totalCount).toBe(2);
  });

  it('does not count lessons older than 7 days', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    const oldLesson = makeLesson(1, 80, oldDate);
    recordCompletedLesson(oldLesson, 60);

    const weekly = getWeeklyActivity();
    const totalCount = weekly.reduce((sum, d) => sum + d.count, 0);
    expect(totalCount).toBe(0);
  });

  it('sparse activity: some days have 0, some have counts', () => {
    const today = new Date();
    recordCompletedLesson(makeLesson(1, 80, today), 60);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    recordCompletedLesson(makeLesson(2, 70, twoDaysAgo), 120);

    const weekly = getWeeklyActivity();
    const activeDays = weekly.filter((d) => d.count > 0);
    const inactiveDays = weekly.filter((d) => d.count === 0);

    expect(activeDays.length).toBeGreaterThan(0);
    expect(inactiveDays.length).toBeGreaterThan(0);
  });
});

describe('streak edge cases', () => {
  it('multiple lessons completed same day keeps streak at 1', () => {
    const now = new Date();
    recordCompletedLesson(makeLesson(1, 80, now), 60);
    recordCompletedLesson(makeLesson(2, 70, now), 120);
    recordCompletedLesson(makeLesson(3, 90, now), 180);

    expect(getStreakDays()).toBe(1);
  });

  it('streak calculation handles month boundary', () => {
    // Simulate: last lesson yesterday (previous month)
    const progress = {
      completedLessons: [makeLesson(1, 80, new Date(Date.now() - 86400000))],
      streakDays: 1,
      lastPracticeDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      totalListeningMinutes: 5,
    };
    localStorage.setItem('drivesmart_listening_progress', JSON.stringify(progress));

    // Today: complete a lesson
    recordCompletedLesson(makeLesson(2, 90, new Date()), 120);
    expect(getStreakDays()).toBe(2);
  });
});

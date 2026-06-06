// Listening module types

export type ListeningView =
  | 'overview'
  | 'topics'
  | 'topic-detail'
  | 'practice'
  | 'progress'
  | 'leaderboard'
  | 'bookmarks'
  | 'history';

export interface ListeningTopic {
  id: number;
  name: string;
  slug: string;
  url: string;
  lessonCount: number;
  levels: string;
  description: string;
  sectionCount: number;
}

export interface ListeningSection {
  id: number;
  topicId: number;
  name: string;
  slug: string;
  orderIndex: number;
  lessonCount: number;
  vocabLevel: string;
  lessons?: ListeningLesson[];
}

export interface ListeningLesson {
  id: number;
  sectionId: number;
  name: string;
  partsCount: number;
  vocabLevel: string;
  hasAudio: boolean;
  hasTranscript: boolean;
}

export interface Challenge {
  id: number;
  position: number;
  content: string;
  solution: string[][];
  audioSrc: string;
  localClipPath: string;
  timeStart: string;
  timeEnd: string;
  hints: string[];
  nbComments: number;
  discussionUrl: string;
}

export interface ListeningLessonDetail {
  id: number;
  sectionId: number;
  name: string;
  partsCount: number;
  vocabLevel: string;
  audioSrc: string;
  localAudioPath: string;
  transcript: string;
  section: { id: number; name: string; vocabLevel: string } | null;
  topic: { id: number; name: string; slug: string; levels: string; lessonCount: number } | null;
  challenges: Challenge[];
}

// Dictation result types
export type WordStatus = 'correct' | 'wrong' | 'missing' | 'extra';

export interface WordResult {
  word: string;
  status: WordStatus;
  index?: number;
}

export interface DictationResult {
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  missingWords: number;
  extraWords: number;
  completionRate: number;
  wordResults: WordResult[];
}

// User progress types
export interface CompletedLesson {
  lessonId: number;
  lessonName: string;
  topicName: string;
  topicSlug: string;
  score: number;
  accuracy: number;
  completedAt: string;
  durationSeconds: number;
}

export interface UserListeningProgress {
  completedLessons: CompletedLesson[];
  streakDays: number;
  lastPracticeDate: string;
  totalListeningMinutes: number;
}

export interface Bookmark {
  id: string;
  type: 'lesson' | 'sentence';
  lessonId?: number;
  lessonName?: string;
  topicSlug?: string;
  sentence?: string;
  createdAt: string;
}

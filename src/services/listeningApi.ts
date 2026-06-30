// Listening API service
import type {
  ListeningTopic,
  ListeningLesson,
  ListeningLessonDetail,
  ListeningSection,
} from '@/types/listening';

const API_BASE = import.meta.env.VITE_LISTENING_API_URL ?? '/api/v1/listening';

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTopics(): Promise<ListeningTopic[]> {
  const data = await apiFetch<{ topics: ListeningTopic[] }>(`${API_BASE}/topics`);
  return data.topics;
}

export async function fetchTopicDetail(slug: string): Promise<ListeningSection[]> {
  const data = await apiFetch<{ sections: ListeningSection[] }>(`${API_BASE}/topics/${slug}`);
  return data.sections;
}

export async function fetchSectionLessons(sectionId: number): Promise<ListeningLesson[]> {
  const data = await apiFetch<{ lessons: ListeningLesson[] }>(
    `${API_BASE}/sections/${sectionId}/lessons`,
  );
  return data.lessons;
}

export async function fetchLessonDetail(lessonId: number): Promise<ListeningLessonDetail> {
  return apiFetch<ListeningLessonDetail>(`${API_BASE}/lessons/${lessonId}`);
}

export async function fetchLessonDetailBySlug(slug: string): Promise<ListeningLessonDetail> {
  return apiFetch<ListeningLessonDetail>(`${API_BASE}/lessons/slug/${slug}`);
}

export function getAudioUrl(lessonId: number): string {
  return `${API_BASE}/audio/${lessonId}`;
}

export function getChallengeAudioUrl(challengeId: number): string {
  return `${API_BASE}/challenges/${challengeId}/audio`;
}

export function getClipsUrl(clipId: number): string {
  return `${API_BASE}/clips/${clipId}`;
}

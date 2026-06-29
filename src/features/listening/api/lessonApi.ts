// ============================================================
// Lesson API — VinaListen
// API calls for lessons and progress management
// ============================================================

import { apiClient } from '../api/client'
import { API_BASE } from './constants'
import type { LessonWithClips, ResetProgressResponse } from '../types/lesson'
import type { ApiResponse } from '../types'

const BASE_PATH = API_BASE

export const lessonApi = {
  getLesson: (lessonId: string): Promise<ApiResponse<LessonWithClips>> => {
    return apiClient.get<ApiResponse<LessonWithClips>>(
      `${BASE_PATH}/lessons/${lessonId}`,
    )
  },

  resetProgress: (lessonId: string): Promise<ResetProgressResponse> => {
    return apiClient.delete<ResetProgressResponse>(
      `${BASE_PATH}/lessons/${lessonId}/progress`,
    )
  },
}

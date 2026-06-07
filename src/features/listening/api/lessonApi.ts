// ============================================================
// Lesson API — VinaListen
// API calls for lessons and progress management
// ============================================================

import { apiClient } from '../api/client'
import type { LessonWithClips, ResetProgressResponse } from '../types/lesson'
import type { ApiResponse } from '../types'

const BASE_PATH = '/api/v1'

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

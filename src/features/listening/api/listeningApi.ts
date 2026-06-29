// ============================================================
// Listening API — VinaListen
// API calls for the lesson practice experience
// ============================================================

import { apiClient } from '../api/client'
import { API_BASE } from './constants'
import type { CheckRequest, CheckResponse } from '../types/lesson'

const BASE_PATH = API_BASE

export const listeningApi = {
  check: (request: CheckRequest): Promise<CheckResponse> => {
    return apiClient.post<CheckResponse>(
      `${BASE_PATH}/listening/check`,
      request,
    )
  },
}

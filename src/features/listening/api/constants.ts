// ============================================================
// API Path Constants — VinaListen
//
// All API path segments MUST be defined here. Do NOT hardcode
// path strings directly in API files.
//
// Backend route prefix: /api/v1/*
// VITE_API_URL must include the /api/v1 prefix (e.g. http://vinalisten.test/api/v1)
// API files use path segments without version prefix.
//
// Usage in API files:
//   import { API_BASE } from './constants'
//   return apiClient.get(`${API_BASE}/listening/bbc/${slug}`)
//
// ============================================================

/** Base path for all API endpoints (includes /api/v1 — matches VITE_API_URL) */
export const API_BASE = ''

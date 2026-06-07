// ============================================================
// API Client — VinaListen
// Base HTTP client for Laravel backend
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      const error = new Error(data.message ?? 'Request failed') as Error & {
        code: string
        errors?: Record<string, string[]>
      }
      error.code = data.code ?? 'E_SERVER'
      error.errors = data.errors
      throw error
    }

    return data as T
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>('GET', path, undefined, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>('POST', path, body, options)
  }

  put<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>('PUT', path, body, options)
  }

  patch<T>(path: string, body?: unknown, options?: RequestInit) {
    return this.request<T>('PATCH', path, body, options)
  }

  delete<T>(path: string, options?: RequestInit) {
    return this.request<T>('DELETE', path, undefined, options)
  }
}

export const apiClient = new ApiClient()

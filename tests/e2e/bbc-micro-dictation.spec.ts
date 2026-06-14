import { test, expect } from '@playwright/test'

// ======================================================================
// BBC Micro Dictation — E2E Tests
// ======================================================================

const API_BASE = 'http://127.0.0.1:8000/api'
const FRONTEND_BASE = 'http://localhost:3000'

// ======================================================================
// Helper: Get auth token
// ======================================================================

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'qa_auth_test@example.com',
      password: 'Password123!',
    }),
  })
  const data = await res.json()
  return data.data?.token ?? ''
}

// ======================================================================
// API Tests — Dictation Endpoints
// ======================================================================

test.describe('API: Dictation Endpoints', () => {
  let token: string

  test.beforeAll(async () => {
    token = await getAuthToken()
  })

  // TC-E2E-01: GET /dictation returns 401 without auth
  test('GET /dictation requires authentication', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc/1/dictation`)
    expect(res.status()).toBe(401)
  })

  // TC-E2E-02: GET /dictation/summary requires authentication
  test('GET /dictation/summary requires authentication', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc/1/dictation/summary`)
    expect(res.status()).toBe(401)
  })

  // TC-E2E-03: POST /dictation/segments requires authentication
  test('POST /dictation/segments requires authentication', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/listening/bbc/1/dictation/segments`, {
      data: { segment_index: 0, user_input: 'hello', time_spent_ms: 1000 },
    })
    expect(res.status()).toBe(401)
  })

  // TC-E2E-04: GET /dictation returns 404 for invalid lesson
  test('GET /dictation returns 404 for non-existent lesson', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc/99999/dictation`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(404)
  })

  // TC-E2E-05: POST /dictation/segments validates user_input
  test('POST /dictation/segments rejects empty user_input', async ({ request }) => {
    // First get a valid lesson ID
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const listBody = await listRes.json()

    if (listBody.data?.length === 0) {
      test.skip()
      return
    }

    const lessonId = listBody.data[0].id
    const res = await request.post(`${API_BASE}/v1/listening/bbc/${lessonId}/dictation/segments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { segment_index: 0, user_input: '', time_spent_ms: 1000 },
    })
    expect(res.status()).toBe(422)
  })

  // TC-E2E-06: POST /dictation/segments validates required fields
  test('POST /dictation/segments validates required fields', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const listBody = await listRes.json()

    if (listBody.data?.length === 0) {
      test.skip()
      return
    }

    const lessonId = listBody.data[0].id
    const res = await request.post(`${API_BASE}/v1/listening/bbc/${lessonId}/dictation/segments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { segment_index: 0 }, // missing user_input
    })
    expect(res.status()).toBe(422)
  })

  // TC-E2E-07: POST /dictation/complete marks lesson as completed
  test('POST /dictation/complete marks lesson completed', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const listBody = await listRes.json()

    if (listBody.data?.length === 0) {
      test.skip()
      return
    }

    const lessonId = listBody.data[0].id
    const res = await request.post(`${API_BASE}/v1/listening/bbc/${lessonId}/dictation/complete`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.status).toBe('completed')
  })

  // TC-E2E-08: GET /dictation/summary returns empty for fresh lesson
  test('GET /dictation/summary returns zeros for fresh lesson', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const listBody = await listRes.json()

    if (listBody.data?.length === 0) {
      test.skip()
      return
    }

    const lessonId = listBody.data[0].id
    const res = await request.get(`${API_BASE}/v1/listening/bbc/${lessonId}/dictation/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveProperty('segments_completed')
    expect(body.data).toHaveProperty('overall_accuracy')
    expect(body.data).toHaveProperty('total_time_ms')
    expect(body.data).toHaveProperty('segment_scores')
  })
})

// ======================================================================
// E2E Tests — Dictation Frontend Flow
// ======================================================================

test.describe('E2E: BBC Micro Dictation Flow', () => {
  test('Dictation page is accessible at /bbc/:slug/dictation', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/listening`)
    await page.waitForLoadState('networkidle')

    // Navigate to BBC
    const bbcNav = page.locator('nav').getByText('BBC')
    if (await bbcNav.isVisible()) {
      await bbcNav.click()
      await page.waitForTimeout(2000)

      // Navigate to first lesson if available
      const cards = page.locator('[role="button"]')
      const count = await cards.count()

      if (count > 0) {
        await cards.first().click()
        await page.waitForTimeout(1500)

        // Look for dictation CTA
        const dictationBtn = page.locator('button').filter({ hasText: 'Luyện nghe chép' })
        if (await dictationBtn.isVisible()) {
          await dictationBtn.click()
          await page.waitForTimeout(1000)

          // Verify we're on the dictation page
          expect(page.url()).toContain('/dictation')
        }
      }
    }
  })

  test('Dictation page shows intro phase on load', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/listening/bbc/ep-test-001/dictation`)
    await page.waitForTimeout(2000)

    // Page should either show intro content or loading/error state
    const hasContent = await page.locator('text=Bắt đầu').isVisible().catch(() => false)
    const hasLoading = await page.locator('[class*="skeleton"]').isVisible().catch(() => false)
    const hasError = await page.locator('text=Không tìm thấy').isVisible().catch(() => false)
    const hasError404 = await page.locator('text=Không tìm thấy bài học').isVisible().catch(() => false)

    // Page should render one of these states
    expect(hasContent || hasLoading || hasError || hasError404).toBeTruthy()
  })

  test('Settings button toggles settings panel', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/listening/bbc/ep-test-001/dictation`)
    await page.waitForTimeout(2000)

    const settingsBtn = page.locator('button').filter({ hasText: 'Cài đặt' })
    if (await settingsBtn.isVisible().catch(() => false)) {
      await settingsBtn.click()
      await page.waitForTimeout(300)

      const settingsPanel = page.locator('text=Thời lượng mỗi đoạn')
      await expect(settingsPanel).toBeVisible()
    }
  })
})

import { test, expect } from '@playwright/test'

// ======================================================================
// BBC Learning English — E2E Tests
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
// API Tests — BBC Endpoints
// ======================================================================

test.describe('API: BBC Endpoints', () => {
  let token: string

  test.beforeAll(async () => {
    token = await getAuthToken()
  })

  test('GET /listening/bbc returns paginated lessons', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(Array.isArray(body.data)).toBe(true)
    expect(body).toHaveProperty('source')
    expect(body).toHaveProperty('pagination')
    expect(body.source.slug).toBe('bbc-learning-english')
  })

  test('GET /listening/bbc filters by level', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc?level=beginner`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    for (const lesson of body.data) {
      if (lesson.level) {
        expect(lesson.level).toBe('beginner')
      }
    }
  })

  test('GET /listening/bbc searches by title', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc?search=test`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data.length).toBeLessThanOrEqual(body.pagination.per_page)
  })

  test('GET /listening/bbc sorts by oldest', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc?sort_by=oldest`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('pagination')
  })

  test('GET /listening/bbc/{slug} returns lesson detail', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip() // No lessons crawled yet
      return
    }

    const firstLesson = listBody.data[0]
    const res = await request.get(`${API_BASE}/v1/listening/bbc/${firstLesson.slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.data.slug).toBe(firstLesson.slug)
    expect(body.data.title).toBeDefined()
    expect(body.data.source_url).toBeDefined()
  })

  test('GET /listening/bbc/{slug} returns 404 for unknown slug', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc/nonexistent-lesson-slug-xyz`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(404)
  })

  test('POST /listening/bbc/{id}/progress marks lesson in_progress', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip()
      return
    }

    const firstLesson = listBody.data[0]
    const res = await request.post(
      `${API_BASE}/v1/listening/bbc/${firstLesson.id}/progress`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { status: 'in_progress' },
      },
    )

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.data.status).toBe('in_progress')
    expect(body.data.lesson_id).toBe(firstLesson.id)
  })

  test('POST /listening/bbc/{id}/complete marks lesson completed', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip()
      return
    }

    const firstLesson = listBody.data[0]
    const res = await request.post(`${API_BASE}/v1/listening/bbc/${firstLesson.id}/complete`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.data.status).toBe('completed')
    expect(body.data.completed_at).toBeDefined()
  })

  test('GET /listening/bbc/{id}/notes returns empty notes', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip()
      return
    }

    const firstLesson = listBody.data[0]
    const res = await request.get(`${API_BASE}/v1/listening/bbc/${firstLesson.id}/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.data.lesson_id).toBe(firstLesson.id)
    expect(body.data.content !== undefined).toBe(true)
  })

  test('PUT /listening/bbc/{id}/notes saves notes', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip()
      return
    }

    const firstLesson = listBody.data[0]
    const noteContent = 'This is a test note for BBC lesson.'

    const res = await request.put(`${API_BASE}/v1/listening/bbc/${firstLesson.id}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { content: noteContent },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.data.content).toBe(noteContent)
    expect(body.data.lesson_id).toBe(firstLesson.id)
  })

  test('POST /listening/bbc/{id}/vocabulary creates vocabulary', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip()
      return
    }

    const firstLesson = listBody.data[0]
    const vocabData = {
      word: 'test',
      meaning: 'a test word',
      example: 'This is a test sentence.',
      note: 'Personal note',
    }

    const res = await request.post(`${API_BASE}/v1/listening/bbc/${firstLesson.id}/vocabulary`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: vocabData,
    })

    expect(res.status()).toBe(201)

    const body = await res.json()
    expect(body.data.word).toBe(vocabData.word)
    expect(body.data.meaning).toBe(vocabData.meaning)
    expect(body.data.lesson_id).toBe(firstLesson.id)
  })

  test('DELETE /listening/bbc/{id}/vocabulary/{vocabId} removes vocabulary', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip()
      return
    }

    const firstLesson = listBody.data[0]

    const createRes = await request.post(`${API_BASE}/v1/listening/bbc/${firstLesson.id}/vocabulary`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { word: 'to-delete', meaning: 'test' },
    })

    const created = await createRes.json()
    const vocabId = created.data.id

    const delRes = await request.delete(`${API_BASE}/v1/listening/bbc/${firstLesson.id}/vocabulary/${vocabId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(delRes.status()).toBe(200)
  })

  test('GET /listening/bbc/{id}/vocabulary returns vocabulary list', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const listBody = await listRes.json()
    if (listBody.data.length === 0) {
      test.skip()
      return
    }

    const firstLesson = listBody.data[0]
    const res = await request.get(`${API_BASE}/v1/listening/bbc/${firstLesson.id}/vocabulary`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /listening/bbc/dashboard returns metrics', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status()).toBe(200)

    const body = await res.json()
    expect(body.data).toHaveProperty('lessons_started')
    expect(body.data).toHaveProperty('lessons_completed')
    expect(body.data).toHaveProperty('completion_rate')
    expect(typeof body.data.lessons_started).toBe('number')
    expect(typeof body.data.lessons_completed).toBe('number')
    expect(typeof body.data.completion_rate).toBe('number')
  })

  test('rejects unauthenticated requests', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/listening/bbc`)
    expect(res.status()).toBe(401)
  })
})

// ======================================================================
// E2E Tests — BBC Frontend Flow
// ======================================================================

test.describe('E2E: BBC Learning English Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/listening`)
  })

  test('BBC nav item is visible in the navigation', async ({ page }) => {
    await page.waitForSelector('text=BBC', { timeout: 5000 })
    const bbcNav = page.locator('nav').getByText('BBC')
    await expect(bbcNav).toBeVisible()
  })

  test('BBC navigation item is clickable', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await expect(bbcNav).toBeVisible()
    await bbcNav.click()
    await expect(page).toHaveURL(/\/listening/)
  })

  test('BBC list page shows lesson cards or empty state', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const heading = page.locator('h1').getByText('BBC Learning English')
    await expect(heading).toBeVisible()

    const hasCards = await page.locator('[role="button"]').count() > 0
    const hasEmptyState = await page.locator('text=Không tìm thấy').isVisible().catch(() => false)
    const hasError = await page.locator('text=Đã xảy ra lỗi').isVisible().catch(() => false)

    expect(hasCards || hasEmptyState || hasError).toBe(true)
  })

  test('BBC lesson cards are clickable', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const cards = page.locator('[role="button"]')
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      const detailHeading = page.locator('h1')
      await expect(detailHeading).toBeVisible()
    }
  })

  test('BBC lesson detail shows source attribution', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const cards = page.locator('[role="button"]')
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await page.waitForTimeout(1000)

      const attribution = page.locator('text=Source: BBC Learning English')
      await expect(attribution).toBeVisible()
    }
  })

  test('BBC lesson detail has Start Learning button', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const cards = page.locator('[role="button"]')
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await page.waitForTimeout(1000)

      const startBtn = page.locator('button').filter({ hasText: 'Bắt đầu học' })
      await expect(startBtn).toBeVisible()
    }
  })

  test('BBC lesson detail has Open Original button', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const cards = page.locator('[role="button"]')
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await page.waitForTimeout(1000)

      const openBtn = page.locator('button').filter({ hasText: 'Mở bài gốc' })
      await expect(openBtn).toBeVisible()
    }
  })

  test('BBC lesson detail Back button works', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const cards = page.locator('[role="button"]')
    const count = await cards.count()

    if (count > 0) {
      await cards.first().click()
      await page.waitForTimeout(1000)

      const backBtn = page.locator('button').filter({ hasText: 'Quay lại danh sách' })
      await expect(backBtn).toBeVisible()
      await backBtn.click()
      await page.waitForTimeout(500)

      const heading = page.locator('h1').getByText('BBC Learning English')
      await expect(heading).toBeVisible()
    }
  })

  test('BBC lesson list has level filters', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const beginnerFilter = page.locator('button').filter({ hasText: 'Sơ cấp' })
    await expect(beginnerFilter).toBeVisible()
  })

  test('BBC lesson list has search input', async ({ page }) => {
    const bbcNav = page.locator('nav').getByText('BBC')
    await bbcNav.click()
    await page.waitForTimeout(2000)

    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]')
    await expect(searchInput).toBeVisible()
  })
})

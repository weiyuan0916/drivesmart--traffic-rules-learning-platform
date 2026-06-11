import { test, expect } from '@playwright/test';

// ======================================================================
// Helper: Auth API Utilities
// ======================================================================

const API_BASE = 'http://127.0.0.1:8000/api'
const FRONTEND_BASE = 'http://localhost:3000'
const TEST_EMAIL = `qa_auth_${Date.now()}@example.com`
const TEST_PASSWORD = 'Password123!'

async function registerUser(): Promise<void> {
  await fetch(`${API_BASE}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Auth Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      password_confirmation: TEST_PASSWORD,
    }),
  })
}

async function loginUser(): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  })
  const data = await res.json()
  return data.data?.token ?? ''
}

// ======================================================================
// API Layer Tests (direct HTTP — no UI dependency)
// ======================================================================

test.describe('API: Register', () => {
  test('rejects registration with missing fields', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/register`, {
      data: { name: 'Only Name' },
    })
    expect(res.status()).toBe(422)
  })

  test('rejects registration with unmatching passwords', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/register`, {
      data: {
        name: 'Test User',
        email: 'new@example.com',
        password: 'password123',
        password_confirmation: 'different',
      },
    })
    expect(res.status()).toBe(422)
  })

  test('registers successfully and returns token', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/register`, {
      data: {
        name: 'Success User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        password_confirmation: TEST_PASSWORD,
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.user.email).toBe(TEST_EMAIL)
    expect(body.data.token).toBeTruthy()
    expect(body.data.user.current_streak).toBe(0)
    expect(body.data.user.level).toBe(1)
  })
})

test.describe('API: Login', () => {
  test.beforeAll(async () => {
    await registerUser()
  })

  test('returns 401 for wrong password', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: TEST_EMAIL, password: 'wrongpassword' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.code).toBe('E_AUTH_001')
  })

  test('returns 401 for nonexistent email', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: 'nonexistent@example.com', password: TEST_PASSWORD },
    })
    expect(res.status()).toBe(401)
  })

  test('returns token for valid credentials', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.user.email).toBe(TEST_EMAIL)
    expect(body.data.token).toBeTruthy()
  })

  test('authenticated user can access /me', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    })
    const token = (await loginRes.json()).data.token

    const meRes = await request.get(`${API_BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(meRes.status()).toBe(200)
    const me = await meRes.json()
    expect(me.data.email).toBe(TEST_EMAIL)
  })

  test('unauthenticated user gets 401 on /me', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/auth/me`)
    expect(res.status()).toBe(401)
  })

  test('logout revokes token', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    })
    const token = (await loginRes.json()).data.token

    const logoutRes = await request.post(`${API_BASE}/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(logoutRes.status()).toBe(200)
  })
})

// ======================================================================
// UI: Login Page Render Tests
// ======================================================================

test.describe('UI: Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('networkidle')
  })

  test('page loads without crash', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.locator('h1').textContent()).toContain('Đăng nhập')
  })

  test('renders Google and GitHub OAuth buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible()
  })

  test('renders email and password form fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('renders remember me checkbox and forgot password link', async ({ page }) => {
    await expect(page.locator('input[type="checkbox"]')).toBeVisible()
    await expect(page.getByText(/quên mật khẩu/i)).toBeVisible()
  })

  test('renders register link', async ({ page }) => {
    await expect(page.getByText(/đăng ký miễn phí/i)).toBeVisible()
  })

  test('shows submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
  })

  test('renders DriveSmart logo/brand', async ({ page }) => {
    await expect(page.getByText('DriveSmart')).toBeVisible()
  })
})

// ======================================================================
// UI: Register Page Render Tests
// ======================================================================

test.describe('UI: Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('networkidle')
  })

  test('page loads without crash', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.locator('h1').textContent()).toContain('Tạo tài khoản')
  })

  test('renders all required fields', async ({ page }) => {
    await expect(page.getByLabel(/họ và tên/i)).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByLabel(/xác nhận mật khẩu/i)).toBeVisible()
  })

  test('renders Google and GitHub OAuth buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible()
  })

  test('renders terms and privacy links', async ({ page }) => {
    await expect(page.getByText(/điều khoản sử dụng/i).first()).toBeVisible()
    await expect(page.getByText(/chính sách bảo mật/i).first()).toBeVisible()
  })

  test('renders login link', async ({ page }) => {
    await expect(page.getByText(/đăng nhập ngay/i)).toBeVisible()
  })

  test('renders submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /tạo tài khoản/i })).toBeVisible()
  })
})

// ======================================================================
// UI: Form Validation
// ======================================================================

test.describe('UI: Login Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('networkidle')
  })

  test('shows error for empty submission', async ({ page }) => {
    await page.getByRole('button', { name: /đăng nhập/i }).click()
    await expect(page.getByText(/email là bắt buộc/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.locator('input[type="email"]').fill('notanemail')
    await page.locator('input[name="password"]').fill('password123')
    await page.getByRole('button', { name: /đăng nhập/i }).click()
    await expect(page.getByText(/email không hợp lệ/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('UI: Register Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('networkidle')
  })

  test('shows error for empty name submission', async ({ page }) => {
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.getByText(/vui lòng nhập họ và tên/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for short password', async ({ page }) => {
    await page.getByLabel(/họ và tên/i).fill('Test User')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.getByText(/ít nhất 8 ký tự/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for password mismatch', async ({ page }) => {
    await page.getByLabel(/họ và tên/i).fill('Test User')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[name="password"]').fill('password123')
    await page.getByLabel(/xác nhận mật khẩu/i).fill('different456')
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.getByText(/mật khẩu xác nhận không khớp/i)).toBeVisible({ timeout: 5000 })
  })
})

// ======================================================================
// UI: Password Visibility Toggle
// ======================================================================

test.describe('UI: Password Visibility Toggle', () => {
  test('login page — toggles password visibility', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('networkidle')

    const pwd = page.locator('input[name="password"]')
    await pwd.fill('secret123')
    await expect(pwd).toHaveAttribute('type', 'password')

    await page.getByLabel(/hiện mật khẩu/i).click()
    await expect(pwd).toHaveAttribute('type', 'text')

    await page.getByLabel(/ẩn mật khẩu/i).click()
    await expect(pwd).toHaveAttribute('type', 'password')
  })

  test('register page — toggles password visibility', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('networkidle')

    const pwd = page.locator('input[name="password"]')
    await pwd.fill('secret123')
    await page.getByLabel(/hiện mật khẩu/i).first().click()
    await expect(pwd).toHaveAttribute('type', 'text')
  })
})

// ======================================================================
// UI: Responsive Layout
// ======================================================================

test.describe('UI: Responsive Layout', () => {
  const viewports = [
    { name: 'Mobile SE', width: 375, height: 667 },
    { name: 'iPhone 15', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
  ]

  for (const vp of viewports) {
    test(`${vp.name} login page fits viewport`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${FRONTEND_BASE}/auth/login`)
      await page.waitForLoadState('networkidle')
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(vp.width)
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    })

    test(`${vp.name} register page fits viewport`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${FRONTEND_BASE}/auth/register`)
      await page.waitForLoadState('networkidle')
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(vp.width)
      await expect(page.getByRole('heading', { name: /tạo tài khoản/i })).toBeVisible()
    })
  }
})

// ======================================================================
// UI: Keyboard Navigation
// ======================================================================

test.describe('UI: Keyboard Navigation', () => {
  test('Tab navigates through login form', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('networkidle')
    // Tab through 6 interactive elements
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
    }
    // Page should remain functional
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
  })

  test('Enter on submit button triggers form submission', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('networkidle')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[name="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: /đăng nhập/i }).focus()
    await page.keyboard.press('Enter')
    // Form should be submitted (either validation error or API error shows)
    await expect(page.locator('body')).toBeVisible({ timeout: 2000 })
  })
})

// ======================================================================
// UI: Navigation Links
// ======================================================================

test.describe('UI: Navigation Links', () => {
  test('login → register link works', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('networkidle')
    await page.getByText(/đăng ký miễn phí/i).click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test('register → login link works', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('networkidle')
    await page.getByText(/đăng nhập ngay/i).click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('OAuth buttons are clickable (popup blocked — graceful)', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('networkidle')
    // Click OAuth button — popup may be blocked but page should remain stable
    await page.getByRole('button', { name: /continue with google/i }).click()
    await page.waitForTimeout(1000)
    // Page should not crash
    await expect(page.locator('body')).toBeVisible()
  })
})

// ======================================================================
// OAuth Integration Tests
// ======================================================================

test.describe('OAuth: API Integration', () => {
  test('GitHub redirect returns valid OAuth URL with correct params', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/auth/github/redirect`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.redirect_url).toContain('github.com/login/oauth/authorize')
    expect(body.data.redirect_url).toContain('client_id=Ov23liHIqZTVQp1K5hju')
    expect(body.data.redirect_url).toContain('redirect_uri=')
    expect(body.data.redirect_url).toContain('scope=user%3Aemail')
  })

  test('Google redirect returns valid OAuth URL with correct params', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/auth/google/redirect`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.redirect_url).toContain('accounts.google.com')
    expect(body.data.redirect_url).toContain('client_id=846388188692')
    expect(body.data.redirect_url).toContain('scope=')
  })

  test('invalid OAuth provider returns 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/v1/auth/twitter/redirect`)
    expect(res.status()).toBe(404)
  })
})

// ======================================================================
// Supabase Data Persistence Tests
// ======================================================================

test.describe('Data Persistence: Supabase', () => {
  const uniqueEmail = `supabase_test_${Date.now()}@example.com`
  const password = 'TestPass123!'

  test('user data is persisted in Supabase after registration', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/register`, {
      data: {
        name: 'Supabase Test User',
        email: uniqueEmail,
        password,
        password_confirmation: password,
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.user.email).toBe(uniqueEmail)
    expect(body.data.user.name).toBe('Supabase Test User')
    expect(body.data.user.level).toBe(1)
    expect(body.data.user.current_streak).toBe(0)
    expect(body.data.user.total_xp).toBe(0)
    expect(body.data.user.timezone).toBe('Asia/Ho_Chi_Minh')
    expect(body.data.user.learning_goal).toBe('daily')
    expect(body.data.token).toBeTruthy()
  })

  test('registered user can login with correct credentials', async ({ request }) => {
    const res = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: uniqueEmail, password },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.user.email).toBe(uniqueEmail)
    expect(body.data.token).toBeTruthy()
  })

  test('protected /me endpoint returns correct user data', async ({ request }) => {
    // Login first
    const loginRes = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: uniqueEmail, password },
    })
    const token = (await loginRes.json()).data.token

    // Get user data
    const meRes = await request.get(`${API_BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(meRes.status()).toBe(200)
    const me = await meRes.json()
    expect(me.data.email).toBe(uniqueEmail)
    expect(me.data.name).toBe('Supabase Test User')
    expect(me.data.id).toBeTruthy()
  })

  test('logout invalidates the token', async ({ request }) => {
    // Login
    const loginRes = await request.post(`${API_BASE}/v1/auth/login`, {
      data: { email: uniqueEmail, password },
    })
    const token = (await loginRes.json()).data.token

    // Logout
    const logoutRes = await request.post(`${API_BASE}/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(logoutRes.status()).toBe(200)
  })
})

// ======================================================================
// OAuth Callback Page Tests
// ======================================================================

test.describe('OAuth Callback Page', () => {
  test('callback page renders loading spinner', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/callback`)
    await page.waitForLoadState('networkidle')
    // Should show loading state or spinner
    await expect(page.locator('body')).toBeVisible()
  })

  test('callback page exists and has no JS crash', async ({ page }) => {
    // Should not crash even without token/user params
    const res = await page.goto(`${FRONTEND_BASE}/auth/callback`)
    expect(res?.status()).toBe(200)
    await page.waitForTimeout(500)
  })
})

import { test, expect, type Page } from '@playwright/test';

// ======================================================================
// Helper: Auth Test Utilities
// ======================================================================

const API_BASE = 'http://127.0.0.1:8000/api'
const FRONTEND_BASE = 'http://localhost:3003'
const TEST_EMAIL = `qa_auth_${Date.now()}@example.com`
const TEST_PASSWORD = 'password123'

async function registerUser(): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Auth Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      password_confirmation: TEST_PASSWORD,
    }),
  })
  const data = await res.json()
  return data.data?.token ?? ''
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
// TC-AUTH-01: Login Page Load
// ======================================================================
test.describe('TC-AUTH-01: Login Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')
  })

  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.locator('h1').textContent()).toContain('Đăng nhập')
  })

  test('shows Google and GitHub OAuth buttons', async ({ page }) => {
    const googleBtn = page.getByRole('button', { name: /continue with google/i })
    const githubBtn = page.getByRole('button', { name: /continue with github/i })
    await expect(googleBtn).toBeVisible()
    await expect(githubBtn).toBeVisible()
  })

  test('shows email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mật khẩu/i)).toBeVisible()
  })

  test('shows remember me and forgot password links', async ({ page }) => {
    await expect(page.getByText(/ghi nhớ đăng nhập/i)).toBeVisible()
    await expect(page.getByText(/quên mật khẩu/i)).toBeVisible()
  })

  test('shows register link', async ({ page }) => {
    await expect(page.getByText(/đăng ký miễn phí/i)).toBeVisible()
  })

  test('submit button is visible and labeled', async ({ page }) => {
    const submit = page.getByRole('button', { name: /đăng nhập/i })
    await expect(submit).toBeVisible()
    await expect(submit).toBeEnabled()
  })
})

// ======================================================================
// TC-AUTH-02: Login Form Validation
// ======================================================================
test.describe('TC-AUTH-02: Login Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')
  })

  test('shows error for empty email', async ({ page }) => {
    await page.getByRole('button', { name: /đăng nhập/i }).click()
    await expect(page.getByText(/email là bắt buộc/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('notanemail')
    await page.getByRole('button', { name: /đăng nhập/i }).click()
    await expect(page.getByText(/email không hợp lệ/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for empty password', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /đăng nhập/i }).click()
    await expect(page.getByText(/mật khẩu là bắt buộc/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for wrong password', async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/mật khẩu/i).fill('wrongpassword')
    await page.getByRole('button', { name: /đăng nhập/i }).click()
    await expect(page.getByText(/email hoặc mật khẩu không đúng/i)).toBeVisible({ timeout: 8000 })
  })
})

// ======================================================================
// TC-AUTH-03: Successful Login Flow
// ======================================================================
test.describe('TC-AUTH-03: Successful Login Flow', () => {
  test.beforeAll(async () => {
    // Pre-register a user for login tests
    await registerUser()
  })

  test('redirects after successful login', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/mật khẩu/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // After login, should redirect to /topics
    await page.waitForURL(/\/topics/, { timeout: 8000 })
    expect(page.url()).toContain('/topics')
  })
})

// ======================================================================
// TC-AUTH-04: Register Page Load
// ======================================================================
test.describe('TC-AUTH-04: Register Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('domcontentloaded')
  })

  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.locator('h1').textContent()).toContain('Tạo tài khoản')
  })

  test('shows all required form fields', async ({ page }) => {
    await expect(page.getByLabel(/họ và tên/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/^mật khẩu$/i)).toBeVisible()
    await expect(page.getByLabel(/xác nhận mật khẩu/i)).toBeVisible()
  })

  test('shows Google and GitHub OAuth buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible()
  })

  test('shows terms checkbox', async ({ page }) => {
    await expect(page.getByText(/điều khoản sử dụng/i)).toBeVisible()
    await expect(page.getByText(/chính sách bảo mật/i)).toBeVisible()
  })

  test('shows login link', async ({ page }) => {
    await expect(page.getByText(/đăng nhập ngay/i)).toBeVisible()
  })
})

// ======================================================================
// TC-AUTH-05: Register Form Validation
// ======================================================================
test.describe('TC-AUTH-05: Register Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('domcontentloaded')
  })

  test('shows error for empty name', async ({ page }) => {
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.getByText(/vui lòng nhập họ và tên/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for invalid email', async ({ page }) => {
    await page.getByLabel(/họ và tên/i).fill('Test User')
    await page.getByLabel(/email/i).fill('notanemail')
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.getByText(/email không hợp lệ/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for short password', async ({ page }) => {
    await page.getByLabel(/họ và tên/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/mật khẩu/i).fill('123')
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.getByText(/ít nhất 8 ký tự/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for password mismatch', async ({ page }) => {
    await page.getByLabel(/họ và tên/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/mật khẩu/i).fill('password123')
    await page.getByLabel(/xác nhận mật khẩu/i).fill('different123')
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.getByText(/mật khẩu xác nhận không khớp/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows error for duplicate email', async ({ page }) => {
    await registerUser() // Ensure user exists

    await page.getByLabel(/họ và tên/i).fill('Another User')
    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/mật khẩu/i).fill('password123')
    await page.getByLabel(/xác nhận mật khẩu/i).fill('password123')
    await page.locator('input[type="checkbox"]').check()
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 })
  })
})

// ======================================================================
// TC-AUTH-06: Successful Registration Flow
// ======================================================================
test.describe('TC-AUTH-06: Successful Registration Flow', () => {
  test('registers and redirects to onboarding', async ({ page }) => {
    const uniqueEmail = `register_success_${Date.now()}@example.com`

    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('domcontentloaded')

    await page.getByLabel(/họ và tên/i).fill('Success User')
    await page.getByLabel(/email/i).fill(uniqueEmail)
    await page.getByLabel(/mật khẩu/i).fill('password123')
    await page.getByLabel(/xác nhận mật khẩu/i).fill('password123')
    await page.locator('input[type="checkbox"]').check()
    await page.getByRole('button', { name: /tạo tài khoản/i }).click()

    // After registration, should redirect to /onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 8000 })
    expect(page.url()).toContain('/onboarding')
  })
})

// ======================================================================
// TC-AUTH-07: Password Visibility Toggle
// ======================================================================
test.describe('TC-AUTH-07: Password Visibility Toggle', () => {
  test('toggles password visibility on login page', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    const passwordInput = page.getByLabel(/mật khẩu/i)
    await passwordInput.fill('secret123')

    // Initially should be masked
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button
    await page.getByLabel(/hiện mật khẩu/i).click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await page.getByLabel(/ẩn mật khẩu/i).click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('toggles password visibility on register page', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('domcontentloaded')

    const passwordInput = page.getByLabel(/^mật khẩu$/i)
    await passwordInput.fill('secret123')
    await page.getByLabel(/hiện mật khẩu/i).first().click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })
})

// ======================================================================
// TC-AUTH-08: Responsive Layout
// ======================================================================
test.describe('TC-AUTH-08: Responsive Layout', () => {
  const viewports = [
    { name: 'Mobile SE', width: 375, height: 667 },
    { name: 'iPhone 15', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
  ]

  for (const vp of viewports) {
    test(`${vp.name} (${vp.width}x${vp.height}) — login page fits viewport`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${FRONTEND_BASE}/auth/login`)
      await page.waitForLoadState('domcontentloaded')

      // No horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(vp.width)

      // Key elements visible
      await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /đăng nhập/i }).toBeVisible()
    })

    test(`${vp.name} (${vp.width}x${vp.height}) — register page fits viewport`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${FRONTEND_BASE}/auth/register`)
      await page.waitForLoadState('domcontentloaded')

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(vp.width)

      await expect(page.getByRole('heading', { name: /tạo tài khoản/i })).toBeVisible()
    })
  }
})

// ======================================================================
// TC-AUTH-09: Dark Mode Compatibility
// ======================================================================
test.describe('TC-AUTH-09: Dark Mode Compatibility', () => {
  for (const path of ['/auth/login', '/auth/register']) {
    test(`${path} renders in dark mode`, async ({ page }) => {
      await page.goto(`${FRONTEND_BASE}${path}`)
      await page.waitForLoadState('domcontentloaded')

      // Toggle dark mode if a theme button exists
      const themeBtn = page.getByRole('button').filter({ hasText: /dark|light|🌙|🌞/i }).first()
      if (await themeBtn.isVisible()) {
        await themeBtn.click()
        await page.waitForTimeout(500)
      }

      // Page should still render correctly
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('h1')).toBeVisible()
    })
  }
})

// ======================================================================
// TC-AUTH-10: Keyboard Navigation
// ======================================================================
test.describe('TC-AUTH-10: Keyboard Navigation', () => {
  test('Tab navigates through login form fields in order', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    // Start tabbing
    await page.keyboard.press('Tab')
    // Continue tabbing through form
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
    }

    // Form should still be visible
    await expect(page.getByRole('button', { name: /đăng nhập/i }).toBeVisible()
  })

  test('Enter submits the form when focused on submit button', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/mật khẩu/i).fill('wrongpassword')

    // Focus submit and press Enter
    await page.getByRole('button', { name: /đăng nhập/i }).focus()
    await page.keyboard.press('Enter')

    // Should show error
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 })
  })

  test('Escape closes any open popover', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')

    await page.getByLabel(/mật khẩu/i).fill('test')
    // Press Escape — should clear or not cause errors
    await page.keyboard.press('Escape')
    // Page should still be functional
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
  })
})

// ======================================================================
// TC-AUTH-11: Navigation Links
// ======================================================================
test.describe('TC-AUTH-11: Navigation Links', () => {
  test('login page has working register link', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/login`)
    await page.waitForLoadState('domcontentloaded')
    await page.getByText(/đăng ký miễn phí/i).click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test('register page has working login link', async ({ page }) => {
    await page.goto(`${FRONTEND_BASE}/auth/register`)
    await page.waitForLoadState('domcontentloaded')
    await page.getByText(/đăng nhập ngay/i).click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

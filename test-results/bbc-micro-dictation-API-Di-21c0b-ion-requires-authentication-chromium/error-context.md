# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bbc-micro-dictation.spec.ts >> API: Dictation Endpoints >> GET /dictation requires authentication
- Location: tests/e2e/bbc-micro-dictation.spec.ts:39:3

# Error details

```
TypeError: fetch failed
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | // ======================================================================
  4   | // BBC Micro Dictation — E2E Tests
  5   | // ======================================================================
  6   | 
  7   | const API_BASE = 'http://127.0.0.1:8000/api'
  8   | const FRONTEND_BASE = 'http://localhost:3000'
  9   | 
  10  | // ======================================================================
  11  | // Helper: Get auth token
  12  | // ======================================================================
  13  | 
  14  | async function getAuthToken(): Promise<string> {
> 15  |   const res = await fetch(`${API_BASE}/v1/auth/login`, {
      |               ^ TypeError: fetch failed
  16  |     method: 'POST',
  17  |     headers: { 'Content-Type': 'application/json' },
  18  |     body: JSON.stringify({
  19  |       email: 'qa_auth_test@example.com',
  20  |       password: 'Password123!',
  21  |     }),
  22  |   })
  23  |   const data = await res.json()
  24  |   return data.data?.token ?? ''
  25  | }
  26  | 
  27  | // ======================================================================
  28  | // API Tests — Dictation Endpoints
  29  | // ======================================================================
  30  | 
  31  | test.describe('API: Dictation Endpoints', () => {
  32  |   let token: string
  33  | 
  34  |   test.beforeAll(async () => {
  35  |     token = await getAuthToken()
  36  |   })
  37  | 
  38  |   // TC-E2E-01: GET /dictation returns 401 without auth
  39  |   test('GET /dictation requires authentication', async ({ request }) => {
  40  |     const res = await request.get(`${API_BASE}/v1/listening/bbc/1/dictation`)
  41  |     expect(res.status()).toBe(401)
  42  |   })
  43  | 
  44  |   // TC-E2E-02: GET /dictation/summary requires authentication
  45  |   test('GET /dictation/summary requires authentication', async ({ request }) => {
  46  |     const res = await request.get(`${API_BASE}/v1/listening/bbc/1/dictation/summary`)
  47  |     expect(res.status()).toBe(401)
  48  |   })
  49  | 
  50  |   // TC-E2E-03: POST /dictation/segments requires authentication
  51  |   test('POST /dictation/segments requires authentication', async ({ request }) => {
  52  |     const res = await request.post(`${API_BASE}/v1/listening/bbc/1/dictation/segments`, {
  53  |       data: { segment_index: 0, user_input: 'hello', time_spent_ms: 1000 },
  54  |     })
  55  |     expect(res.status()).toBe(401)
  56  |   })
  57  | 
  58  |   // TC-E2E-04: GET /dictation returns 404 for invalid lesson
  59  |   test('GET /dictation returns 404 for non-existent lesson', async ({ request }) => {
  60  |     const res = await request.get(`${API_BASE}/v1/listening/bbc/99999/dictation`, {
  61  |       headers: { Authorization: `Bearer ${token}` },
  62  |     })
  63  |     expect(res.status()).toBe(404)
  64  |   })
  65  | 
  66  |   // TC-E2E-05: POST /dictation/segments validates user_input
  67  |   test('POST /dictation/segments rejects empty user_input', async ({ request }) => {
  68  |     // First get a valid lesson ID
  69  |     const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
  70  |       headers: { Authorization: `Bearer ${token}` },
  71  |     })
  72  |     const listBody = await listRes.json()
  73  | 
  74  |     if (listBody.data?.length === 0) {
  75  |       test.skip()
  76  |       return
  77  |     }
  78  | 
  79  |     const lessonId = listBody.data[0].id
  80  |     const res = await request.post(`${API_BASE}/v1/listening/bbc/${lessonId}/dictation/segments`, {
  81  |       headers: {
  82  |         Authorization: `Bearer ${token}`,
  83  |         'Content-Type': 'application/json',
  84  |       },
  85  |       data: { segment_index: 0, user_input: '', time_spent_ms: 1000 },
  86  |     })
  87  |     expect(res.status()).toBe(422)
  88  |   })
  89  | 
  90  |   // TC-E2E-06: POST /dictation/segments validates required fields
  91  |   test('POST /dictation/segments validates required fields', async ({ request }) => {
  92  |     const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
  93  |       headers: { Authorization: `Bearer ${token}` },
  94  |     })
  95  |     const listBody = await listRes.json()
  96  | 
  97  |     if (listBody.data?.length === 0) {
  98  |       test.skip()
  99  |       return
  100 |     }
  101 | 
  102 |     const lessonId = listBody.data[0].id
  103 |     const res = await request.post(`${API_BASE}/v1/listening/bbc/${lessonId}/dictation/segments`, {
  104 |       headers: {
  105 |         Authorization: `Bearer ${token}`,
  106 |         'Content-Type': 'application/json',
  107 |       },
  108 |       data: { segment_index: 0 }, // missing user_input
  109 |     })
  110 |     expect(res.status()).toBe(422)
  111 |   })
  112 | 
  113 |   // TC-E2E-07: POST /dictation/complete marks lesson as completed
  114 |   test('POST /dictation/complete marks lesson completed', async ({ request }) => {
  115 |     const listRes = await request.get(`${API_BASE}/v1/listening/bbc`, {
```
import { test, expect, type Page } from '@playwright/test';

const mockSession = {
  user: {
    id: 'user-e2e',
    username: 'e2e-user',
    email: 'test@example.com',
    fullName: 'E2E User',
  },
  sessionInfo: {
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    csrfToken: 'csrf-e2e',
  },
};

const API_BASE_URL = 'http://localhost:3000/api';

const loginWithMockSession = async (page: Page) => {
  await page.route('**/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession),
    });
  });

  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'OK', data: mockSession }),
    });
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, {
    timeout: 15000,
  });
};

/**
 * US5: 文書詳細表示・ダウンロードの契約テスト
 */
test.describe('US5: 文書詳細の取得とダウンロード', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMockSession(page);
  });

  test('T068-1: GET /files/:id が詳細を返す', async ({ page }) => {
    const { status, body } = await page.evaluate(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/files/doc-001`);
      return { status: res.status, body: await res.json() };
    }, API_BASE_URL);

    expect(status).toBe(200);
    expect(body.id).toBe('doc-001');
    expect(body.fileName).toContain('請求書');
    expect(body.tags.some((t: any) => t.id === 'tag-001')).toBeTruthy();
  });

  test('T068-2: GET /files/:id/download が添付レスポンスを返す', async ({ page }) => {
    const result = await page.evaluate(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/files/doc-001/download`);
      return {
        status: res.status,
        contentType: res.headers.get('content-type'),
        disposition: res.headers.get('content-disposition'),
        size: (await res.arrayBuffer()).byteLength,
      };
    }, API_BASE_URL);

    expect(result.status).toBe(200);
    expect(result.contentType).toContain('application/octet-stream');
    expect(result.disposition).toContain('filename=');
    expect(result.size).toBeGreaterThan(0);
  });
});

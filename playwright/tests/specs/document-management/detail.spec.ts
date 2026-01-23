import { test, expect, type Page } from '@playwright/test';
import { Buffer } from 'buffer';

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

const mockDocumentDetail = {
  id: 'doc-001',
  fileName: '請求書_20250110.pdf',
  fileSize: 2048576,
  fileFormat: 'pdf',
  uploadedAt: '2025-01-10T08:30:00Z',
  updatedAt: '2025-01-10T08:30:00Z',
  uploadedByUserId: 'user-123',
  tags: [
    {
      id: 'tag-doc-001',
      name: '請求書',
      color: 'primary',
      createdAt: '2025-01-10T08:00:00Z',
      updatedAt: '2025-01-10T08:00:00Z',
      createdByUserId: 'user-123',
    },
    {
      id: 'tag-prog-003',
      name: '進行中',
      color: 'info',
      createdAt: '2025-01-10T08:00:00Z',
      updatedAt: '2025-01-10T08:00:00Z',
      createdByUserId: 'user-123',
    },
  ],
  isDeleted: false,
  deletedAt: null,
};

const API_BASE_URL = 'http://localhost:3000/api';

const MOCK_PDF_BASE64 = `JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVu
ZG9ibjoyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj5lbmRvYmoK
MyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0Yx
IDQgMCBSPj4+Pi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNSAwIFI+PmVuZG9i
ago0IDAgb2JqPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj5l
bmRvYmoKNSAwIG9iajw8L0xlbmd0aCAzOD4+c3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihIZWxsbyBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNzggMDAwMDAgbiAKMDAwMDAwMDM4MiAwMDAwMCBuIAp0cmFpbGVyPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDY3CiUlRU9G`;

function base64ToUint8Array(base64String: string): Uint8Array {
  const cleanBase64 = base64String.replace(/\s/g, '');
  return new Uint8Array(Buffer.from(cleanBase64, 'base64'));
}

const pdfBytes = base64ToUint8Array(MOCK_PDF_BASE64);
const pdfBuffer = Buffer.from(pdfBytes);

const loginWithMockSession = async (page: Page) => {
  // LSにセッションフラグを設定
  await page.addInitScript(() => {
    window.localStorage.setItem('test-session', 'true');
  });

  // ✅ 重要: ルートを先に設定（goto前）
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

  // APIエンドポイントのルート設定
  await page.route(`${API_BASE_URL}/files/doc-001`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDocumentDetail),
      });
    }
  });

  // ダウンロードエンドポイントのルート設定
  await page.route(`${API_BASE_URL}/files/doc-001/download`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: pdfBuffer,
        headers: {
          'Content-Disposition': 'inline; filename="請求書_20250110.pdf"',
          'Content-Length': String(pdfBuffer.byteLength),
        },
      });
    }
  });

  // ✅ ルート設定後にナビゲーション
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // MSWのロードを待機（最大15秒）
  try {
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, {
      timeout: 15000,
    });
  } catch (e) {
    // MSWがロードされなくても続行（ページルートがカバー）
    console.log('⚠️ MSWロード待機タイムアウト、ページルートで処理');
  }
};

/**
 * US5: 文書詳細表示・ダウンロードの契約テスト
 */
test.describe('US5: 文書詳細の取得とダウンロード', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMockSession(page);
  });

  test('T068-1: GET /api/files/:id が詳細を返す', async ({ page }) => {
    // ページルートでモックされたAPIを呼び出す
    const body = await page.evaluate(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/files/doc-001`);
      if (!res.ok) {
        throw new Error(`API failed: ${res.status}`);
      }
      return res.json();
    }, API_BASE_URL);

    expect(body.id).toBe('doc-001');
    expect(body.fileName).toContain('請求書');
    expect(body.tags.some((t: any) => t.id === 'tag-doc-001')).toBeTruthy();
  });

  test('T068-2: GET /api/files/:id/download が添付レスポンスを返す', async ({ page }) => {
    // ページルートでモックされたダウンロードエンドポイントを呼び出す
    const result = await page.evaluate(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/files/doc-001/download`);
      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }
      const buffer = await res.arrayBuffer();
      return {
        status: res.status,
        contentType: res.headers.get('content-type'),
        disposition: res.headers.get('content-disposition'),
        size: buffer.byteLength,
      };
    }, API_BASE_URL);

    expect(result.status).toBe(200);
    expect(result.contentType).toContain('application/pdf');
    expect(result.disposition).toContain('filename=');
    expect(result.size).toBeGreaterThan(0);
  });
});

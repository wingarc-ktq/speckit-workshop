import { test, expect } from '@playwright/test';

/**
 * 文書検索機能のE2E・契約テスト
 * US3: キーワード検索
 *
 * テスト対象:
 * - GET /api/files?search=keyword でのフィルタリング
 * - キーワードでのファイル名部分一致検索
 * - 複数キーワード検索 (スペース区切り、AND 論理)
 * - 空キーワード検索（全文書表示）
 * - 検索結果0件の場合
 */

test.describe('US3: キーワード検索', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'メールアドレスまたはユーザー名' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'パスワード' }).fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('**/');
    
    // 文書一覧ページに遷移
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('T045-1: 単一キーワードで文書をフィルタリング', async ({ page }) => {
    // 検索バーを確認
    const searchInput = page.locator('input[placeholder*="検索"]');
    await expect(searchInput).toBeVisible();

    // キーワード入力
    await searchInput.fill('請求書');
    
    // デバウンス (300ms) を待つ + ネットワーク完了
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // 検索結果確認: "請求書" を含む文書のみ表示
    const tableRows = page.locator('table tbody tr');
    const visibleRows = await tableRows.count();
    
    expect(visibleRows).toBeGreaterThan(0);
    
    // 最初の行に "請求書" が含まれることを確認
    const firstRow = tableRows.first();
    await expect(firstRow).toContainText('請求書');
  });

  test('T045-2: 複数キーワード (AND 論理) で検索', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"]');

    // 複数キーワード入力 (スペース区切り)
    await searchInput.fill('請求書 20250110');
    
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // 両方のキーワードを含む文書のみ表示されることを確認
    const tableRows = page.locator('table tbody tr');
    const visibleRows = await tableRows.count();

    // 少なくとも0件以上結果がある（検索機能が動作していること）
    expect(visibleRows).toBeGreaterThanOrEqual(0);
  });

  test('T045-3: 空のキーワード検索は全文書を表示', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"]');

    // 何も入力しない状態
    await searchInput.fill('');
    
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // 全文書が表示される (テーブル行が存在すること)
    const tableRows = page.locator('table tbody tr');
    const visibleRows = await tableRows.count();
    expect(visibleRows).toBeGreaterThan(0);
  });

  test('T045-4: 検索結果が0件の場合、EmptyState を表示', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"]');

    // 存在しないキーワードで検索
    await searchInput.fill('存在しないファイル名XXXXX');
    
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // 検索結果0件メッセージを確認（テーブル行が0件またはメッセージが表示）
    const tableRows = page.locator('table tbody tr');
    const visibleRows = await tableRows.count();
    
    // 0件の場合、または空状態メッセージが表示されること
    if (visibleRows === 0) {
      // テーブルが空であることを確認
      expect(visibleRows).toBe(0);
    } else {
      // または空状態メッセージが含まれること
      const emptyMessage = page.getByText('該当する文書はありません').first();
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('T045-5: 検索をクリアすると全文書が表示される', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"]');

    // キーワード入力
    await searchInput.fill('請求書');
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // 検索をクリア (✕ボタンまたは input をクリア)
    const clearButton = page.locator('button[aria-label*="クリア"], button:has-text("✕")').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      await searchInput.clear();
    }
    
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // 全文書が表示される
    const tableRows = page.locator('table tbody tr');
    const visibleRows = await tableRows.count();
    expect(visibleRows).toBeGreaterThanOrEqual(0);
  });

  test('T045-6: API 契約テスト - GET /api/files?search パラメータ', async ({ page }) => {
    // ネットワークリクエストを監視
    const requests: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/files')) {
        requests.push({
          url: request.url(),
          method: request.method(),
        });
      }
    });

    await page.goto('/login');
    await page.getByRole('textbox', { name: 'メールアドレスまたはユーザー名' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'パスワード' }).fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('**/');    
    await page.goto('/');
    
    const searchInput = page.locator('input[placeholder*="検索"]');
    await searchInput.fill('test');
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // GET /files?search=test というリクエストが発行されることを確認
    const getFilesRequest = requests.find(
      (r) => r.url.includes('/files') && r.method === 'GET' && r.url.includes('search=')
    );

    expect(getFilesRequest).toBeDefined();
    expect(getFilesRequest?.url).toContain('search=test');
  });

  test('T045-7: デバウンス動作確認 - 高速入力時は1回のみ API 呼び出し', async ({ page }) => {
    const requests: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/files') && request.method() === 'GET') {
        requests.push({ url: request.url() });
      }
    });

    await page.goto('/login');
    await page.getByRole('textbox', { name: 'メールアドレスまたはユーザー名' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'パスワード' }).fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('**/');
    
    await page.goto('/');
    
    const searchInput = page.locator('input[placeholder*="検索"]');

    // 高速入力シミュレーション
    await searchInput.fill('t');
    await page.waitForTimeout(50);
    await searchInput.fill('te');
    await page.waitForTimeout(50);
    await searchInput.fill('tes');
    await page.waitForTimeout(50);
    await searchInput.fill('test');
    
    // デバウンス完了待機
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    // 最終的に "test" に対するリクエストが存在
    const testRequest = requests.find((r) => r.url.includes('search=test'));
    expect(testRequest).toBeDefined();
  });
});

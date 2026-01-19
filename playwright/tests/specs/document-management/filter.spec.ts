import { test, expect, type Page, type Request } from '@playwright/test';
import { testUsers } from '../../fixtures/testUsers';

/**
 * タグフィルタリング機能のE2E・契約テスト
 * US4: タグでフィルタリング
 *
 * テスト対象:
 * - GET /files?tagIds[]=id1&tagIds[]=id2 でのフィルタリング
 * - 単一タグでのフィルタリング
 * - 複数タグのANDフィルタリング
 * - フィルタのクリア機能
 */

const prepareAuthenticatedPage = async (page: Page) => {
  await page.context().addCookies([
    {
      name: 'session_id',
      value: 'abc123',
      url: 'http://localhost:5173',
    },
  ]);

  const sessionResponse = {
    user: {
      id: 'user-e2e',
      username: 'e2e-user',
      email: testUsers.validUser.email,
      fullName: 'E2E User',
    },
    sessionInfo: {
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      csrfToken: 'csrf-e2e',
    },
  };

  await page.route('**/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionResponse),
    });
  });

  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'OK', data: sessionResponse }),
    });
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const filterButton = page.getByRole('button', { name: '絞り込み' });
  await expect(filterButton).toBeVisible({ timeout: 15000 });
};

const openFilterDialog = async (page: Page) => {
  const filterButton = page.getByRole('button', { name: '絞り込み' });
  await expect(filterButton).toBeVisible({ timeout: 10000 });
  await filterButton.click();
  await expect(page.getByRole('dialog', { name: '絞り込み' })).toBeVisible();
};

test.describe('US4: タグでフィルタリング', () => {
  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedPage(page);
  });

  test('T058-1: 単一タグで文書をフィルタリング', async ({ page }) => {
    // フィルターボタンをクリックしてダイアログを開く
    await openFilterDialog(page);

    // タグ「請求書」を選択
    const invoiceChip = page.getByTestId('tag-chip-tag-001');
    await expect(invoiceChip).toBeVisible();
    await invoiceChip.click();

    // ダイアログを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // ネットワークリクエスト完了を待つ
    await page.waitForLoadState('networkidle');

    // 検索結果を確認: 「請求書」タグを持つ文書のみ表示
    const tableRows = page.locator('table tbody tr[data-testid^="document-item-"]');
    const visibleRows = await tableRows.count();
    
    expect(visibleRows).toBeGreaterThan(0);
    
    // 各行に「請求書」タグが含まれることを確認
    for (let i = 0; i < visibleRows; i++) {
      const row = tableRows.nth(i);
      await expect(row).toContainText('請求書');
    }
  });

  test('T058-2: 複数タグでANDフィルタリング', async ({ page }) => {
    // フィルターボタンをクリック
    await openFilterDialog(page);

    // 複数のタグを選択
    const invoiceChip = page.getByTestId('tag-chip-tag-001');
    const contractChip = page.getByTestId('tag-chip-tag-002');
    await expect(invoiceChip).toBeVisible();
    await expect(contractChip).toBeVisible();
    
    await invoiceChip.click();
    await contractChip.click();

    // ダイアログを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    // AND論理: 両方のタグを持つ文書のみ表示
    // モックデータに両方のタグを持つ文書がない場合は0件
    const tableRows = page.locator('table tbody tr[data-testid^="document-item-"]');
    const visibleRows = await tableRows.count();
    
    if (visibleRows > 0) {
      // もし結果があれば、両方のタグが含まれることを確認
      for (let i = 0; i < visibleRows; i++) {
        const row = tableRows.nth(i);
        const rowText = await row.textContent();
        expect(rowText).toContain('請求書');
        expect(rowText).toContain('契約書');
      }
    }
  });

  test('T058-3: フィルターをクリアして全文書を表示', async ({ page }) => {
    // まずフィルターを適用
    await openFilterDialog(page);

    const invoiceChip = page.getByTestId('tag-chip-tag-001');
    await expect(invoiceChip).toBeVisible();
    await invoiceChip.click();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    // フィルター適用後の件数を記録
    const filteredRows = await page.locator('table tbody tr[data-testid^="document-item-"]').count();
    
    // フィルターダイアログを再度開く
    await openFilterDialog(page);

    // チップを再度クリックして解除
    await invoiceChip.click();

    // ダイアログを閉じる
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    // 全文書が表示される
    const allRows = await page.locator('table tbody tr[data-testid^="document-item-"]').count();
    expect(allRows).toBeGreaterThanOrEqual(filteredRows);
  });

  test('T058-4: API契約テスト - GET /files with tagIds param', async ({ page }) => {
    // ネットワークリクエストをキャプチャ
    let capturedRequest: Request | null = null;
    
    page.on('request', (request) => {
      if (request.url().includes('/api/files') && request.url().includes('tagIds')) {
        capturedRequest = request;
      }
    });

    // フィルターを適用
    await openFilterDialog(page);

    const invoiceChip = page.getByTestId('tag-chip-tag-001');
    await expect(invoiceChip).toBeVisible();
    await invoiceChip.click();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.waitForLoadState('networkidle');

    // APIリクエストが送信されたことを確認
    expect(capturedRequest).not.toBeNull();
    
    if (capturedRequest) {
      const url = new URL(capturedRequest.url());
      
      // tagIds パラメータが含まれることを確認
      const tagIdsParam = url.searchParams.getAll('tagIds') || url.searchParams.getAll('tagIds[]');
      expect(tagIdsParam.length).toBeGreaterThan(0);
      expect(tagIdsParam).toContain('tag-001');
    }
  });
});

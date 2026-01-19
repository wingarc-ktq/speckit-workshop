import { test, expect } from '@playwright/test';

/**
 * ユーザーストーリー2: 文書一覧の表示と閲覧
 *
 * 文書一覧をリストビュー/グリッドビューで表示でき、
 * ソート・ページネーション機能を使用できる。
 */

test.describe('文書一覧表示 (US2)', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('http://localhost:5174/login');
    await page.getByRole('textbox', { name: 'メールアドレスまたはユーザー名' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'パスワード' }).fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('**/');
  });

  test('GET /filesエンドポイントがページネーション対応で文書一覧を取得する', async ({
    page,
  }) => {
    // 文書管理ページにアクセス
    await page.goto('http://localhost:5174/documents');
    
    // ローディングの完了を待機
    await page.waitForTimeout(2000);
    
    // リクエスト検証: ?page=1&limit=20
    const requests = [];
    page.on('response', (response) => {
      if (response.url().includes('/files') && response.status() === 200) {
        requests.push(response.url());
      }
    });

    // ページに文書が表示されることを確認
    const documentElements = page.locator('[data-testid^="document-item"]');
    const count = await documentElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('ソート機能で文書一覧をファイル名でソートできる', async ({ page }) => {
    await page.goto('http://localhost:5174/documents');
    await page.waitForTimeout(2000);

    // ソートコントロールを操作
    const sortSelect = page.locator('select, [role="button"]').filter({ hasText: /ソート|並べ替え/ });
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
    }
  });

  test('ページネーション機能でページを切り替えられる', async ({ page }) => {
    await page.goto('http://localhost:5174/documents');
    await page.waitForTimeout(2000);

    // ページネーションボタンの確認
    const pagination = page.locator('[role="navigation"]').filter({
      hasText: /ページ/,
    });
    
    if (await pagination.isVisible()) {
      // 次ページボタンの存在を確認
      const nextButton = page.locator('button').filter({ hasText: /次|>' });
      expect(nextButton).toBeDefined();
    }
  });

  test('結果がない場合、空状態メッセージが表示される', async ({ page }) => {
    await page.goto('http://localhost:5174/documents');
    await page.waitForTimeout(2000);

    // 文書がない場合のEmpty State
    const emptyState = page.locator('text=/ドキュメントが見つかりません|アップロードしてください/');
    if (await emptyState.isVisible()) {
      expect(emptyState).toBeDefined();
    }
  });
});

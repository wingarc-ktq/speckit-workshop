import { test, expect } from '@playwright/test';

test.describe('ファイルアップロード', () => {
  test.beforeEach(async ({ page }) => {
    // ログインしてドキュメント管理ページへアクセス
    await page.goto('http://localhost:5173/login');
    // ログイン処理（テストユーザー）
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    
    // ドキュメント管理ページへ遷移
    await page.goto('http://localhost:5173/documents');
    await page.waitForLoadState('networkidle');
  });

  test('正常なファイルアップロードが成功すること', async ({ page }) => {
    // ファイル選択
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content'),
    });

    // アップロードボタンをクリック
    await page.click('button:has-text("アップロード")');

    // 成功通知が表示されることを確認
    await expect(page.locator('text=ファイルをアップロードしました')).toBeVisible();
  });

  test('ファイルサイズ検証：10MB以上のファイルは拒否されること', async ({ page }) => {
    // 11MBのファイルを作成
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer,
    });

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=ファイルサイズは10MB以下にしてください')).toBeVisible();
  });

  test('非対応フォーマット検証：PDF/DOCX/XLSX/JPG/PNG以外は拒否されること', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    // サポートされていないフォーマット
    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('text content'),
    });

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=サポートされていないファイル形式です')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('ファイルアップロード', () => {
  test.beforeEach(async ({ page }) => {
    // ログインして文書一覧へアクセス
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'メールアドレスまたはユーザー名' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'パスワード' }).fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('**/');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('正常なファイルアップロードが成功すること', async ({ page }) => {
    // アップロードダイアログを開く
    await page.getByRole('button', { name: 'アップロード' }).click();
    const dialog = page.getByRole('dialog', { name: 'ファイルアップロード' });
    await expect(dialog).toBeVisible();

    // ファイル選択
    const fileInput = dialog.locator('input[aria-label="ファイルを選択"]');
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content'),
    });

    // アップロードボタンをクリック
    const uploadButton = dialog.getByRole('button', { name: 'アップロード' });
    await expect(uploadButton).toBeEnabled();
    await uploadButton.click();

    // 成功通知が表示されることを確認
    await expect(page.locator('text=ファイルをアップロードしました')).toBeVisible();
  });

  test('ファイルサイズ検証：10MB以上のファイルは拒否されること', async ({ page }) => {
    await page.getByRole('button', { name: 'アップロード' }).click();
    const dialog = page.getByRole('dialog', { name: 'ファイルアップロード' });
    await expect(dialog).toBeVisible();

    // 11MBのファイルを作成
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    
    const fileInput = dialog.locator('input[aria-label="ファイルを選択"]');
    await fileInput.setInputFiles({
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer,
    });

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=ファイルサイズは10MB以下にしてください')).toBeVisible();
  });

  test('非対応フォーマット検証：PDF/DOCX/XLSX/JPG/PNG以外は拒否されること', async ({ page }) => {
    await page.getByRole('button', { name: 'アップロード' }).click();
    const dialog = page.getByRole('dialog', { name: 'ファイルアップロード' });
    await expect(dialog).toBeVisible();

    const fileInput = dialog.locator('input[aria-label="ファイルを選択"]');
    
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

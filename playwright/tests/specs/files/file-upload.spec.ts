import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { FilesPage } from '../../pages/FilesPage';
import { FileUploadDialog } from '../../pages/dialogs/FileUploadDialog';
import { testUsers } from '../../fixtures/testUsers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('ファイルアップロード', () => {
  let loginPage: LoginPage;
  let filesPage: FilesPage;
  let uploadDialog: FileUploadDialog;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    filesPage = new FilesPage(page);
    uploadDialog = new FileUploadDialog(page);

    // ログイン
    await loginPage.navigate();
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    
    // ファイル一覧ページに遷移
    // ページの基本ロード完了を待ってから要素を確認
    await page.waitForLoadState('load', { timeout: 30000 });
    await filesPage.fileTable.waitFor({ state: 'visible', timeout: 30000 });
  });

  test('新しいファイルをアップロードできること', async () => {
    const initialCount = await filesPage.getFileCount();

    // おたよりを追加ボタンをクリック
    await filesPage.clickUploadButton();

    // アップロードダイアログが表示されること
    await expect(uploadDialog.dialog).toBeVisible();

    // テストファイルのパス
    const testFilePath = path.join(__dirname, '../../fixtures/test-file.pdf');

    // ファイルをアップロード
    await uploadDialog.uploadFile(testFilePath, '重要', 'テスト');

    // アップロード成功を待つ
    await filesPage.page.waitForTimeout(2000);

    // ファイル一覧に追加されること
    const newCount = await filesPage.getFileCount();
    expect(newCount).toBe(initialCount + 1);

    // アップロードしたファイルが表示されること
    const fileNames = await filesPage.getFileNames();
    expect(fileNames.some((name) => name.includes('test-file'))).toBe(true);
  });

  test('カテゴリーとタグを指定してアップロードできること', async () => {

    // おたよりを追加ボタンをクリック
    await filesPage.clickUploadButton();

    // アップロードダイアログが表示されること
    await expect(uploadDialog.dialog).toBeVisible();

    // テストファイルのパス
    const testFilePath = path.join(__dirname, '../../fixtures/test-file.pdf');

    // ファイルを選択
    await uploadDialog.selectFile(testFilePath);

    // カテゴリーを選択
    await uploadDialog.selectCategory('学校');

    // タグを入力
    await uploadDialog.enterTags('テスト,サンプル');

    // アップロード実行
    await uploadDialog.upload();

    // ファイル一覧で確認
    await filesPage.page.waitForTimeout(2000);
    const fileNames = await filesPage.getFileNames();
    expect(fileNames.some((name) => name.includes('test-file'))).toBe(true);
  });

  test('アップロードをキャンセルできること', async () => {
    const initialCount = await filesPage.getFileCount();

    // おたよりを追加ボタンをクリック
    await filesPage.clickUploadButton();

    // アップロードダイアログが表示されること
    await expect(uploadDialog.dialog).toBeVisible();

    // キャンセルボタンをクリック
    await uploadDialog.cancel();

    // ファイル数が変わらないこと
    const currentCount = await filesPage.getFileCount();
    expect(currentCount).toBe(initialCount);
  });

  test('複数のファイルを連続してアップロードできること', async () => {
    const initialCount = await filesPage.getFileCount();
    const uploadCount = 3;

    // 同じファイルを3回アップロード
    for (let i = 0; i < uploadCount; i++) {
      await filesPage.clickUploadButton();
      await expect(uploadDialog.dialog).toBeVisible();
      
      const testFilePath = path.join(__dirname, '../../fixtures/test-file.pdf');
      await uploadDialog.uploadFile(testFilePath);
      
      await filesPage.page.waitForTimeout(1000);
    }

    // すべてのファイルが追加されること
    const newCount = await filesPage.getFileCount();
    expect(newCount).toBe(initialCount + 3);
  });
});

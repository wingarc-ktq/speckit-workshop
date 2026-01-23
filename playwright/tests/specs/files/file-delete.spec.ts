import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { FilesPage } from '../../pages/FilesPage';
import { FileDeleteDialog } from '../../pages/dialogs/FileDeleteDialog';
import { testUsers } from '../../fixtures/testUsers';

test.describe('ファイル削除', () => {
  let loginPage: LoginPage;
  let filesPage: FilesPage;
  let deleteDialog: FileDeleteDialog;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    filesPage = new FilesPage(page);
    deleteDialog = new FileDeleteDialog(page);

    // ログイン
    await loginPage.navigate();
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    
    // ファイル一覧ページに遷移
    // ページの基本ロード完了を待ってから要素を確認
    await page.waitForLoadState('load', { timeout: 30000 });
    await filesPage.fileTable.waitFor({ state: 'visible', timeout: 30000 });
  });

  test.skip('個別ファイルを削除できること', async () => {
    // TODO: 削除機能の実装後に有効化
    
    // 削除対象のファイル名を取得
    const fileNames = await filesPage.getFileNames();
    const targetFile = fileNames[0];
    const initialCount = await filesPage.getFileCount();

    // 削除ボタンをクリック
    await filesPage.clickDeleteButton(targetFile);

    // 削除確認ダイアログが表示されること
    await expect(deleteDialog.dialog).toBeVisible();

    // 確認メッセージが表示されること
    const message = await deleteDialog.getConfirmMessage();
    expect(message).toContain('削除');

    // 削除を確認
    await deleteDialog.confirmDelete();

    // ファイルが一覧から削除されること
    await filesPage.page.waitForTimeout(1000);
    const newCount = await filesPage.getFileCount();
    expect(newCount).toBe(initialCount - 1);

    // 削除されたファイルが一覧に存在しないこと
    const updatedFileNames = await filesPage.getFileNames();
    expect(updatedFileNames).not.toContain(targetFile);
  });

  test.skip('複数ファイルを一括削除できること', async () => {
    // TODO: 一括削除機能の実装後に有効化

    // 削除対象のファイルを選択
    const fileNames = await filesPage.getFileNames();
    const targetFiles = fileNames.slice(0, 3);
    const initialCount = await filesPage.getFileCount();

    // ファイルを選択
    await filesPage.selectFiles(targetFiles);

    // 一括削除ボタンが表示されること
    await expect(filesPage.bulkDeleteButton).toBeVisible();

    // 一括削除ボタンをクリック
    await filesPage.clickBulkDeleteButton();

    // 削除確認ダイアログが表示されること
    await expect(deleteDialog.dialog).toBeVisible();

    // 削除を確認
    await deleteDialog.confirmDelete();

    // ファイルが一覧から削除されること
    await filesPage.page.waitForTimeout(1000);
    const newCount = await filesPage.getFileCount();
    expect(newCount).toBe(initialCount - 3);
  });

  test.skip('削除をキャンセルできること', async () => {
    // TODO: 削除機能の実装後に有効化

    const initialCount = await filesPage.getFileCount();
    const fileNames = await filesPage.getFileNames();
    const targetFile = fileNames[0];

    // 削除ボタンをクリック
    await filesPage.clickDeleteButton(targetFile);

    // 削除確認ダイアログが表示されること
    await expect(deleteDialog.dialog).toBeVisible();

    // キャンセルボタンをクリック
    await deleteDialog.cancel();

    // ファイル数が変わらないこと
    const currentCount = await filesPage.getFileCount();
    expect(currentCount).toBe(initialCount);

    // ファイルが残っていること
    const updatedFileNames = await filesPage.getFileNames();
    expect(updatedFileNames).toContain(targetFile);
  });
});

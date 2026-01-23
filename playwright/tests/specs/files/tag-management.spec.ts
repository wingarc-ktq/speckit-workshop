import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { FilesPage } from '../../pages/FilesPage';
import { TagManagementDialog } from '../../pages/dialogs/TagManagementDialog';
import { testUsers } from '../../fixtures/testUsers';

test.describe('タグ管理', () => {
  let loginPage: LoginPage;
  let filesPage: FilesPage;
  let tagDialog: TagManagementDialog;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    filesPage = new FilesPage(page);
    tagDialog = new TagManagementDialog(page);

    // ログイン
    await loginPage.navigate();
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    
    // ファイル一覧ページに遷移
    // ページの基本ロード完了を待ってから要素を確認
    await page.waitForLoadState('load', { timeout: 30000 });
    await filesPage.fileTable.waitFor({ state: 'visible', timeout: 30000 });

    // タグ管理ダイアログを開く
    await filesPage.clickTagManagementButton();
    await expect(tagDialog.dialog).toBeVisible();
  });

  test.afterEach(async () => {
    // ダイアログが開いている場合は閉じる
    try {
      if (tagDialog && await tagDialog.isVisible()) {
        await tagDialog.close();
      }
    } catch (error) {
      // ダイアログが既に閉じている場合は無視
    }
  });

  test('タグ管理ダイアログが正しく表示されること', async () => {
    // ダイアログが表示されていること
    expect(await tagDialog.isVisible()).toBe(true);

    // タグリストが表示されていること
    const tagCount = await tagDialog.getTagCount();
    expect(tagCount).toBeGreaterThan(0);

    // 新規作成ボタンが表示されていること
    await expect(tagDialog.createButton).toBeVisible();

    // 検索ボックスが表示されていること
    await expect(tagDialog.searchInput).toBeVisible();
  });

  test('タグを検索できること', async () => {
    // タグリストが読み込まれるのを待つ
    await tagDialog.waitForTagListLoaded();

    // 初期のタグ数を取得
    const initialCount = await tagDialog.getTagCount();
    expect(initialCount).toBeGreaterThan(0);

    // 検索を実行
    await tagDialog.searchTag('重要');

    // 検索結果が表示されること（フィルタリングされるまで待つ）
    await tagDialog.page.waitForTimeout(300);
    const filteredCount = await tagDialog.getTagCount();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // 検索結果にタグが含まれること
    const tagNames = await tagDialog.getAllTagNames();
    for (const name of tagNames) {
      expect(name).toContain('重要');
    }
  });

  test('ダイアログを閉じることができること', async () => {
    // 閉じるボタンをクリック
    await tagDialog.close();

    // ダイアログが非表示になること
    await expect(tagDialog.dialog).not.toBeVisible();
  });

  test.skip('新しいタグを作成できること', async () => {
    // TODO: タグ作成ダイアログの実装後に有効化
    await tagDialog.clickCreateButton();
    
    // タグ作成ダイアログが表示されること
    // タグ名を入力すること
    // 保存ボタンをクリックすること
    // タグリストに新しいタグが表示されること
  });

  test.skip('タグを編集できること', async () => {
    // TODO: タグ編集機能の実装後に有効化
    const tagNames = await tagDialog.getAllTagNames();
    const targetTag = tagNames[0];

    // 編集ボタンをクリック
    await tagDialog.clickEditButton(targetTag);

    // 編集ダイアログが表示されること
    // タグ名を変更すること
    // 保存ボタンをクリックすること
    // タグリストが更新されること
  });

  test.skip('タグを削除できること', async () => {
    // TODO: タグ削除機能の実装後に有効化
    const tagNames = await tagDialog.getAllTagNames();
    const targetTag = tagNames[0];
    const initialCount = await tagDialog.getTagCount();

    // 削除ボタンをクリック
    await tagDialog.clickDeleteButton(targetTag);

    // 削除確認ダイアログが表示されること
    // 削除を確認すること
    // タグリストから削除されること
    const newCount = await tagDialog.getTagCount();
    expect(newCount).toBe(initialCount - 1);
  });
});

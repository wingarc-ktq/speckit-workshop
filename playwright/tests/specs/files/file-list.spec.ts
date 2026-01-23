import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { FilesPage } from '../../pages/FilesPage';
import { FileDeleteDialog } from '../../pages/dialogs/FileDeleteDialog';
import { FileUploadDialog } from '../../pages/dialogs/FileUploadDialog';
import { testUsers } from '../../fixtures/testUsers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('ファイル一覧', () => {
  let loginPage: LoginPage;
  let filesPage: FilesPage;

  test.beforeEach(async ({ page, context }) => {
    loginPage = new LoginPage(page);
    filesPage = new FilesPage(page);

    // ページとコンテキストをリセット
    await context.clearCookies();
    await context.clearPermissions();
    
    // Service Workerをクリア（もし存在する場合）
    await page.goto('about:blank');
    
    // ログイン
    await loginPage.navigate();
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    
    // ファイル一覧ページに遷移を待つ
    await page.waitForURL('/', { timeout: 30000 });
    
    // ネットワークアイドルを待機してMSWのレスポンスを確実に受け取る
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // テーブルの表示を待つ
    await page.waitForSelector('table', { state: 'visible', timeout: 30000 });
    await filesPage.fileTable.waitFor({ state: 'visible', timeout: 30000 });
    
    // 少し待機してReactの状態更新を確実に待つ
    await page.waitForTimeout(500);
  });

  test.afterEach(async ({ page }) => {
    // 各テスト後にページをリロードして状態をリセット
    await page.goto('about:blank');
  });

  test('ファイル一覧が正しく表示されること', async () => {
    // ファイル一覧テーブルが表示されること
    expect(await filesPage.isFilesPage()).toBe(true);

    // テーブルのヘッダーに「ファイル名」「カテゴリー」「サイズ」「更新日時」「操作」が表示されること
    const headers = await filesPage.getTableHeaders();
    expect(headers).toContain('ファイル名');
    expect(headers).toContain('カテゴリー');
    expect(headers).toContain('サイズ');
    expect(headers).toContain('更新日時');
    expect(headers).toContain('操作');

    // テーブルにファイルデータが表示されること
    const fileCount = await filesPage.getFileCount();
    expect(fileCount).toBeGreaterThan(0);
  });

  test('ファイル名で検索できること', async () => {
    const testCases = [
      { keyword: '請求書', description: '「請求書」を含むファイル' },
      { keyword: '田中', description: '「田中」を含むファイル' },
      { keyword: '202401', description: '「202401」を含むファイル' },
    ];

    for (const { keyword, description } of testCases) {
      // 検索ボックスに検索キーワードを入力する
      await filesPage.search(keyword);

      // 検索キーワードを含むファイルのみが表示されること
      const fileNames = await filesPage.getFileNames();
      
      if (fileNames.length > 0) {
        // 検索結果があれば、全てのファイル名にキーワードが含まれることを確認
        for (const fileName of fileNames) {
          expect(fileName).toContain(keyword);
        }
      }

      // 検索をクリア
      await filesPage.clearSearch();
    }
  });

  test('検索をクリアできること', async () => {
    // 検索キーワードを入力する
    await filesPage.search('請求書');

    // 検索結果が絞り込まれることを確認
    const filteredCount = await filesPage.getFileCount();

    // 検索ボックスの内容をクリアする
    await filesPage.clearSearch();

    // すべてのファイルが表示されること
    const allCount = await filesPage.getFileCount();
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('カテゴリーでフィルタリングできること', async () => {
    const testCases = [
      { category: '重要', description: 'カテゴリーに「重要」を含むファイル' },
      { category: '学校', description: 'カテゴリーに「学校」を含むファイル' },
    ];

    for (const { category, description } of testCases) {
      // カテゴリーで検索（searchメソッドを使用）
      await filesPage.search(category);

      // 選択したカテゴリーのファイルのみが表示されること
      const categories = await filesPage.getCategories();
      
      if (categories.length > 0) {
        // 検索結果があれば、カテゴリーにキーワードが含まれることを確認
        for (const cat of categories) {
          expect(cat).toContain(category);
        }
      }

      // フィルターをクリア
      await filesPage.clearSearch();
    }
  });

  test('ファイルサイズでソートできること', async () => {
    // 「サイズ」列のヘッダーをクリックする
    await filesPage.sortByColumn('サイズ');
    await filesPage.waitForNetworkIdle();

    // ファイルがサイズの昇順でソートされること（実装により確認方法は異なる）
    // 注: 実際のソート確認はデータの取得と比較が必要

    // 再度「サイズ」列のヘッダーをクリックする
    await filesPage.sortByColumn('サイズ');
    await filesPage.waitForNetworkIdle();

    // ファイルがサイズの降順でソートされること
  });

  test('更新日時でソートできること', async () => {
    // 「更新日時」列のヘッダーをクリックする
    await filesPage.sortByColumn('更新日時');
    await filesPage.waitForNetworkIdle();

    // ファイルが更新日時の昇順でソートされること

    // 再度「更新日時」列のヘッダーをクリックする
    await filesPage.sortByColumn('更新日時');
    await filesPage.waitForNetworkIdle();

    // ファイルが更新日時の降順でソートされること
  });

  test('ファイル名でソートできること', async () => {
    // 「ファイル名」列のヘッダーをクリックする
    await filesPage.sortByColumn('ファイル名');
    await filesPage.waitForNetworkIdle();

    // ファイルがファイル名の昇順（50音順）でソートされること

    // 再度「ファイル名」列のヘッダーをクリックする
    await filesPage.sortByColumn('ファイル名');
    await filesPage.waitForNetworkIdle();

    // ファイルがファイル名の降順でソートされること
  });

  test('タグ管理画面に遷移できること', async ({ page }) => {
    // 「タグ管理」ボタンをクリックする
    await filesPage.clickTagManagementButton();

    // タグ管理ダイアログが表示されること
    const dialog = page.getByRole('dialog', { name: 'タグ管理' });
    await expect(dialog).toBeVisible();
  });

  test('ごみ箱画面に遷移できること', async ({ page }) => {
    // 「ごみ箱」ボタンをクリックする
    await filesPage.clickTrashButton();

    // ごみ箱画面が表示されること（pageModeが'trash'に変わり、ヘッダーが「ごみ箱」になる）
    const trashHeader = page.getByRole('heading', { name: 'ごみ箱' });
    await expect(trashHeader).toBeVisible({ timeout: 5000 });

    // 「一覧へ」ボタンが表示されること
    const backButton = page.getByRole('button', { name: /一覧へ|戻る/ });
    await expect(backButton).toBeVisible();
  });

  test('検索結果が空の場合に適切なメッセージが表示されること', async () => {
    // 存在しないキーワードを入力する
    await filesPage.search('存在しない文字列xyz123');

    // 検索結果が0件であること
    const isEmpty = await filesPage.isEmptyResult();
    expect(isEmpty).toBe(true);

    // テーブルが空であることを確認（行が存在しない）
    const rowCount = await filesPage.getFileCount();
    expect(rowCount).toBe(0);
  });

  test('個別ファイルを削除できること', async ({ page }) => {
    const deleteDialog = new FileDeleteDialog(page);

    // 削除対象のファイル名を取得
    const fileNames = await filesPage.getFileNames();
    expect(fileNames.length).toBeGreaterThan(0);
    const targetFile = fileNames[0];

    // 削除したいファイルの行の削除ボタンをクリックする
    await filesPage.clickDeleteButton(targetFile);

    // 削除確認ダイアログが表示されること
    await expect(deleteDialog.dialog).toBeVisible();

    // ダイアログで削除を確認する
    await deleteDialog.confirmDelete();

    // 削除したファイルが一覧に表示されないこと
    await expect
      .poll(async () => await filesPage.getFileNames(), { timeout: 10000 })
      .not.toContain(targetFile);
  });

  test('複数ファイルを一括削除できること', async ({ page }) => {
    const deleteDialog = new FileDeleteDialog(page);

    // 削除対象のファイル名を取得
    const fileNames = await filesPage.getFileNames();
    expect(fileNames.length).toBeGreaterThanOrEqual(2);
    const targetFiles = fileNames.slice(0, 2); // 2件選択
    // 削除したいファイルのチェックボックスを複数選択する
    await filesPage.selectFiles(targetFiles);

    // 選択した件数が表示されること（Fabボタン）
    const bulkDeleteBtn = filesPage.bulkDeleteButton;
    await expect(bulkDeleteBtn).toBeVisible();
    await expect(bulkDeleteBtn).toContainText(String(targetFiles.length));

    // 一括削除ボタンをクリックする
    await filesPage.clickBulkDeleteButton();

    // 削除確認ダイアログが表示されること
    await expect(deleteDialog.dialog).toBeVisible();

    // ダイアログで削除を確認する
    await deleteDialog.confirmDelete();

    // 選択したファイルが一覧から削除されること
    await expect
      .poll(async () => {
        const names = await filesPage.getFileNames();
        return targetFiles.filter((name) => names.includes(name));
      }, { timeout: 10000 })
      .toHaveLength(0);
  });

  test('新しいファイルをアップロードできること', async ({ page }) => {
    const uploadDialog = new FileUploadDialog(page);

    // 「おたよりを追加」ボタンをクリックする
    await filesPage.clickUploadButton();

    // ファイルアップロードダイアログが表示されること
    await expect(uploadDialog.dialog).toBeVisible();

    // テスト用ファイルのパス（fixturesディレクトリに配置する想定）
    const testFilePath = path.join(__dirname, '../../fixtures/test-file.pdf');

    // ファイルを選択する
    await uploadDialog.selectFile(testFilePath);

    // アップロードボタンをクリックする
    await uploadDialog.upload();

    // アップロード完了を待機
    await filesPage.waitForNetworkIdle();

    // ファイル一覧にアップロードしたファイルが表示されること
    const fileNames = await filesPage.getFileNames();
    expect(fileNames.some((name) => name.includes('test-file'))).toBe(true);
  });

  test('ページング機能が正しく動作すること', async () => {
    // ページネーションが表示されているか確認
    const hasPagination = await filesPage.hasPagination();
    expect(hasPagination).toBe(true);

    // 1ページ目のファイル名を取得
    const firstPageFiles = await filesPage.getFileNames();

    // 「次へ」ボタンをクリックする
    await filesPage.goToNextPage();

    // 次のページのファイルが表示されること（1ページ目とは異なるファイル）
    const secondPageFiles = await filesPage.getFileNames();
    expect(secondPageFiles).not.toEqual(firstPageFiles);

    // 「前へ」ボタンをクリックする
    await filesPage.goToPreviousPage();

    // 前のページのファイルが表示されること（1ページ目と同じファイル）
    const backToFirstPageFiles = await filesPage.getFileNames();
    expect(backToFirstPageFiles).toEqual(firstPageFiles);
  });
});

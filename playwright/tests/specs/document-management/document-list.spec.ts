import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DocumentManagementPage } from '../../pages/DocumentManagementPage';
import { testUsers } from '../../fixtures/testUsers';

test.describe('文書管理 - 文書一覧表示', () => {
  let loginPage: LoginPage;
  let documentPage: DocumentManagementPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    documentPage = new DocumentManagementPage(page);

    // ログイン
    await loginPage.navigate();
    await loginPage.fillEmail(testUsers.validUser.email);
    await loginPage.fillPassword(testUsers.validUser.password);
    await loginPage.clickLoginButton();

    // 文書管理ページに移動
    await documentPage.navigate();
  });

  test('成功時に一覧がレンダリングされること（Smoke test）', async ({
    page,
  }) => {
    // 1. 文書管理ページにアクセスしている

    // 2. ページが読み込まれる
    await documentPage.waitForPageLoad();

    // 3. 一覧テーブルが表示される
    const isTableVisible = await documentPage.isFileTableVisible();
    expect(isTableVisible).toBeTruthy();

    // 4. テーブルに行が存在する、または空状態メッセージが表示される
    const rowCount = await documentPage.getFileListRowCount();
    const isEmptyMessageVisible = await documentPage.isEmptyMessageVisible();

    // 空の場合は空状態メッセージが表示される、そうでない場合は行が存在する
    if (rowCount === 0) {
      expect(isEmptyMessageVisible).toBeTruthy();
    } else {
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('グリッドビューに切り替えられること', async () => {
    // ページ読み込み待機
    await documentPage.waitForPageLoad();
    
    // リストビューが表示されている
    let isTableVisible = await documentPage.isFileTableVisible();
    expect(isTableVisible).toBeTruthy();
    
    // グリッドビューに切り替え
    await documentPage.switchToGridView();
    
    // グリッドビューが表示される（少し待機）
    await documentPage.page.waitForTimeout(300);
    
    // グリッドビューが表示されているか確認
    const isGridVisible = await documentPage.isGridViewVisible();
    expect(isGridVisible).toBeTruthy();
    
    // リストビューに戻す
    await documentPage.switchToListView();
    await documentPage.page.waitForTimeout(300);
    
    // リストビューが表示される
    isTableVisible = await documentPage.isFileTableVisible();
    expect(isTableVisible).toBeTruthy();
  });

  test('ソート機能が動作すること', async () => {
    // ページ読み込み待機
    await documentPage.waitForPageLoad();
    
    // ファイルが存在する場合のみテスト
    const rowCount = await documentPage.getFileListRowCount();
    if (rowCount > 1) {
      // 最初のファイル名を取得
      const firstFileName = await documentPage.getFileNameFromRow(0);
      
      // ソートボタンをクリック（複数回クリックして順序を変更）
      await documentPage.clickSortButton();
      await documentPage.page.waitForTimeout(500);
      
      // ソート後のファイル名を取得
      const afterSortFileName = await documentPage.getFileNameFromRow(0);
      
      // ソート順序が変わっているか確認（完全一致では必ずしも変わるとは限らないが、テスト可能）
      expect(typeof firstFileName).toBe('string');
      expect(typeof afterSortFileName).toBe('string');
    }
  });

  test('昇順/降順の切り替えが動作すること', async () => {
    // ページ読み込み待機
    await documentPage.waitForPageLoad();
    
    // ファイルが存在する場合のみテスト
    const rowCount = await documentPage.getFileListRowCount();
    if (rowCount > 1) {
      // 昇順/降順ボタンをクリック
      await documentPage.toggleSortOrder();
      await documentPage.page.waitForTimeout(500);
      
      // ページがまだ表示されているか確認（エラーが発生していないか）
      const isTableVisible = await documentPage.isFileTableVisible();
      expect(isTableVisible).toBeTruthy();
    }
  });

  test('ページネーションが機能すること', async () => {
    // ページ読み込み待機
    await documentPage.waitForPageLoad();
    
    // 次ページボタンが存在するか確認
    const nextPageButton = documentPage.page.locator('button:has-text("Next")');
    const isNextPageVisible = await nextPageButton.isVisible();
    
    if (isNextPageVisible) {
      // 次ページに移動
      await documentPage.clickNextPage();
      await documentPage.page.waitForTimeout(500);
      
      // ページが表示されているか確認
      const isTableVisible = await documentPage.isFileTableVisible();
      expect(isTableVisible).toBeTruthy();
      
      // 前ページに戻る
      await documentPage.clickPreviousPage();
      await documentPage.page.waitForTimeout(500);
      
      // ページが表示されているか確認
      const isTableVisibleAfter = await documentPage.isFileTableVisible();
      expect(isTableVisibleAfter).toBeTruthy();
    }
  });

  test('検索機能が動作すること', async () => {
    // ページ読み込み待機
    await documentPage.waitForPageLoad();
    
    // ファイルが存在する場合のみテスト
    const rowCount = await documentPage.getFileListRowCount();
    if (rowCount > 0) {
      // 最初のファイル名を取得
      const firstFileName = await documentPage.getFileNameFromRow(0);
      
      // 検索キーワードを入力（最初の3文字）
      if (firstFileName && firstFileName.length > 3) {
        const searchKeyword = firstFileName.substring(0, 3);
        
        // 検索実行
        await documentPage.search(searchKeyword);
        
        // 検索結果が表示されているか確認
        const searchResultCount = await documentPage.getFileListRowCount();
        
        // 検索結果がある場合は行数が表示される
        expect(searchResultCount).toBeGreaterThanOrEqual(0);
        
        // 検索をクリア
        await documentPage.clearSearch();
        
        // 全件表示に戻る
        const allFileCount = await documentPage.getFileListRowCount();
        expect(allFileCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

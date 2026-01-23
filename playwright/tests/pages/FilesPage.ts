import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ファイル一覧ページのPage Object
 */
export class FilesPage extends BasePage {
  readonly url = '/';

  constructor(page: Page) {
    super(page);
  }

  // ========== ページ要素 ==========

  /**
   * 検索入力フィールド
   */
  get searchInput(): Locator {
    return this.page.locator('input[type="search"], input[placeholder*="検索"]');
  }

  /**
   * ファイル一覧テーブル
   */
  get fileTable(): Locator {
    return this.page.locator('table');
  }

  /**
   * テーブルヘッダー
   */
  get tableHeaders(): Locator {
    return this.page.locator('table th');
  }

  /**
   * テーブルのデータ行
   */
  get tableRows(): Locator {
    return this.page.locator('table tbody tr');
  }

  /**
   * おたよりを追加ボタン
   */
  get uploadButton(): Locator {
    return this.page.getByRole('button', { name: 'おたよりを追加' });
  }

  /**
   * タグ管理ボタン
   */
  get tagManagementButton(): Locator {
    return this.page.getByRole('button', { name: 'タグ管理' });
  }

  /**
   * ごみ箱ボタン
   */
  get trashButton(): Locator {
    return this.page.getByRole('button', { name: 'ごみ箱' });
  }

  /**
   * 一括削除ボタン
   */
  get bulkDeleteButton(): Locator {
    return this.page.getByRole('button', { name: /選択した.*件をごみ箱へ/ });
  }

  // ========== ページアクション ==========

  /**
   * ファイル一覧ページが表示されているか確認
   */
  async isFilesPage(): Promise<boolean> {
    await this.fileTable.waitFor({ state: 'visible', timeout: 10000 });
    return await this.fileTable.isVisible();
  }

  /**
   * テーブルヘッダーのテキストを取得
   */
  async getTableHeaders(): Promise<string[]> {
    return await this.tableHeaders.allTextContents();
  }

  /**
   * ファイル数を取得
   */
  async getFileCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * 検索を実行
   */
  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    
    // デバウンス処理とAPIリクエストの完了を待つ
    // アプリ側のデバウンスは300msなので、それより長く待つ
    await this.page.waitForTimeout(500);
    
    // ネットワークリクエストの完了を待つ（検索APIが呼ばれて結果が返ってくる）
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // テーブルまたは空メッセージのいずれかが表示されるまで待つ
    await this.page
      .locator('[data-testid="file-table"], [data-testid="empty-state"]')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * 検索をクリア
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    
    // デバウンス処理とAPIリクエストの完了を待つ
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // テーブルまたは空メッセージのいずれかが表示されるまで待つ
    await this.page
      .locator('[data-testid="file-table"], [data-testid="empty-state"]')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * 特定のファイル行を取得
   */
  getFileRow(fileName: string): Locator {
    return this.page.locator('table tbody tr', {
      has: this.page.locator(`td:has-text("${fileName}")`),
    });
  }

  /**
   * ファイル名のリストを取得
   */
  async getFileNames(): Promise<string[]> {
    // 空状態の場合は空配列を返す
    const isEmpty = await this.page.locator('[data-testid="empty-state"]').isVisible().catch(() => false);
    if (isEmpty) {
      return [];
    }
    
    // テーブルが安定するまで待機
    await this.fileTable.waitFor({ state: 'visible', timeout: 10000 });
    const cells = await this.page
      .locator('table tbody tr td:nth-child(2)')
      .allTextContents();
    return cells.map((text) => text.trim());
  }

  /**
   * カテゴリーのリストを取得
   */
  async getCategories(): Promise<string[]> {
    // 空状態の場合は空配列を返す
    const isEmpty = await this.page.locator('[data-testid="empty-state"]').isVisible().catch(() => false);
    if (isEmpty) {
      return [];
    }
    
    await this.fileTable.waitFor({ state: 'visible', timeout: 10000 });
    const cells = await this.page
      .locator('table tbody tr td:nth-child(3)')
      .allTextContents();
    return cells.map((text) => text.trim());
  }

  /**
   * 特定のファイルの削除ボタンをクリック
   */
  async clickDeleteButton(fileName: string): Promise<void> {
    const row = this.getFileRow(fileName);
    await row.getByRole('button', { name: 'delete' }).click();
  }

  /**
   * 特定のファイルのチェックボックスを選択
   */
  async selectFile(fileName: string): Promise<void> {
    const row = this.getFileRow(fileName);
    await row.locator('input[type="checkbox"]').check();
  }

  /**
   * 複数ファイルを選択
   */
  async selectFiles(fileNames: string[]): Promise<void> {
    for (const fileName of fileNames) {
      await this.selectFile(fileName);
    }
  }

  /**
   * テーブルヘッダーをクリックしてソート
   */
  async sortByColumn(columnName: string): Promise<void> {
    await this.page
      .locator('table th', { hasText: columnName })
      .click();
  }

  /**
   * おたよりを追加ボタンをクリック
   */
  async clickUploadButton(): Promise<void> {
    await this.uploadButton.click();
  }

  /**
   * タグ管理ボタンをクリック
   */
  async clickTagManagementButton(): Promise<void> {
    await this.tagManagementButton.click();
  }

  /**
   * ごみ箱ボタンをクリック
   */
  async clickTrashButton(): Promise<void> {
    await this.trashButton.click();
  }

  /**
   * 一括削除ボタンをクリック
   */
  async clickBulkDeleteButton(): Promise<void> {
    await this.bulkDeleteButton.click();
  }

  /**
   * 検索結果が空であることを確認
   */
  async isEmptyResult(): Promise<boolean> {
    const rowCount = await this.getFileCount();
    return rowCount === 0;
  }

  /**
   * 空の結果メッセージが表示されているか確認
   */
  async hasEmptyMessage(): Promise<boolean> {
    const emptyMessage = this.page.locator('text=/該当するファイルが見つかりません|ファイルがありません/');
    return await emptyMessage.isVisible().catch(() => false);
  }

  /**
   * ページネーションが表示されているか確認
   */
  async hasPagination(): Promise<boolean> {
    const pagination = this.page.locator(
      'nav[aria-label*="pagination" i], .MuiPagination-root, [class*="pagination"]'
    );
    return await pagination.isVisible().catch(() => false);
  }

  /**
   * 次のページに移動
   */
  async goToNextPage(): Promise<void> {
    await this.page
      .getByRole('button', { name: /次へ|次のページ|next page|Go to next page/i })
      .click();
    await this.waitForNetworkIdle();
  }

  /**
   * 前のページに移動
   */
  async goToPreviousPage(): Promise<void> {
    await this.page
      .getByRole('button', { name: /前へ|前のページ|previous page|Go to previous page/i })
      .click();
    await this.waitForNetworkIdle();
  }

  /**
   * 特定のページ番号に移動
   */
  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('button', { name: pageNumber.toString() }).click();
    await this.waitForNetworkIdle();
  }
}

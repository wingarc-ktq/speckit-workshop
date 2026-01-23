import { Page, Locator } from '@playwright/test';

/**
 * ファイルアップロードダイアログのPage Object
 */
export class FileUploadDialog {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ========== ダイアログ要素 ==========

  /**
   * アップロードダイアログ
   */
  get dialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /**
   * ファイル選択入力
   */
  get fileInput(): Locator {
    return this.dialog.locator('input[type="file"]');
  }

  /**
   * カテゴリー選択
   */
  get categorySelect(): Locator {
    return this.dialog.getByRole('combobox', { name: /カテゴリー/ });
  }

  /**
   * タグ入力
   */
  get tagInput(): Locator {
    return this.dialog.getByRole('textbox', { name: /タグ/ });
  }

  /**
   * アップロードボタン
   */
  get uploadButton(): Locator {
    return this.dialog.getByRole('button', { name: /アップロード|追加/ });
  }

  /**
   * キャンセルボタン
   */
  get cancelButton(): Locator {
    return this.dialog.getByRole('button', { name: /キャンセル/ });
  }

  /**
   * 閉じるボタン
   */
  get closeButton(): Locator {
    return this.dialog.getByRole('button', { name: /閉じる/ });
  }

  // ========== ダイアログアクション ==========

  /**
   * ダイアログが表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible();
  }

  /**
   * ファイルを選択
   */
  async selectFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  /**
   * カテゴリーを選択
   */
  async selectCategory(category: string): Promise<void> {
    await this.categorySelect.selectOption(category);
  }

  /**
   * タグを入力
   */
  async enterTags(tags: string): Promise<void> {
    await this.tagInput.fill(tags);
  }

  /**
   * アップロードを実行
   */
  async upload(): Promise<void> {
    await this.uploadButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  /**
   * アップロードをキャンセル
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  /**
   * ダイアログを閉じる
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  /**
   * ファイルをアップロード（一連の操作）
   */
  async uploadFile(filePath: string, category?: string, tags?: string): Promise<void> {
    await this.selectFile(filePath);
    
    if (category) {
      await this.selectCategory(category);
    }
    
    if (tags) {
      await this.enterTags(tags);
    }
    
    await this.upload();
  }
}

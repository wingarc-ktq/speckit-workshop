import { Page, Locator } from '@playwright/test';

/**
 * ファイル削除確認ダイアログのPage Object
 */
export class FileDeleteDialog {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ========== ダイアログ要素 ==========

  /**
   * 削除確認ダイアログ
   */
  get dialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /**
   * 削除ボタン
   */
  get deleteButton(): Locator {
    return this.dialog.getByRole('button', { name: /削除|ごみ箱へ移動|はい|OK/ });
  }

  /**
   * キャンセルボタン
   */
  get cancelButton(): Locator {
    return this.dialog.getByRole('button', { name: /キャンセル|いいえ/ });
  }

  /**
   * 確認メッセージ
   */
  get confirmMessage(): Locator {
    return this.dialog.locator('text=/削除|ごみ箱/');
  }

  // ========== ダイアログアクション ==========

  /**
   * ダイアログが表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible();
  }

  /**
   * 削除を確認
   */
  async confirmDelete(): Promise<void> {
    await this.deleteButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  /**
   * 削除をキャンセル
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  /**
   * 確認メッセージを取得
   */
  async getConfirmMessage(): Promise<string> {
    return (await this.confirmMessage.textContent()) || '';
  }
}

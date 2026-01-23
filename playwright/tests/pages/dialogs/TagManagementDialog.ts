import { Page, Locator } from '@playwright/test';

/**
 * タグ管理ダイアログのPage Object
 */
export class TagManagementDialog {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ========== ダイアログ要素 ==========

  /**
   * ダイアログ本体
   */
  get dialog(): Locator {
    return this.page.getByRole('dialog', { name: 'タグ管理' });
  }

  /**
   * 閉じるボタン
   */
  get closeButton(): Locator {
    return this.dialog.getByRole('button', { name: '閉じる' });
  }

  /**
   * 検索入力
   */
  get searchInput(): Locator {
    return this.dialog.getByRole('textbox', { name: 'タグを検索...' });
  }

  /**
   * 新規作成ボタン
   */
  get createButton(): Locator {
    return this.dialog.getByRole('button', { name: '新規作成' });
  }

  /**
   * タグリスト
   */
  get tagList(): Locator {
    return this.dialog.getByRole('list');
  }

  /**
   * タグアイテム
   */
  get tagItems(): Locator {
    return this.dialog.getByRole('listitem');
  }

  // ========== ダイアログアクション ==========

  /**
   * ダイアログが表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible();
  }

  /**
   * ダイアログを閉じる
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  /**
   * タグリストが読み込まれるのを待つ
   */
  async waitForTagListLoaded(): Promise<void> {
    await this.tagItems.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * タグを検索
   */
  async searchTag(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  /**
   * タグ数を取得
   */
  async getTagCount(): Promise<number> {
    return await this.tagItems.count();
  }

  /**
   * 特定のタグの編集ボタンをクリック
   */
  async clickEditButton(tagName: string): Promise<void> {
    const tagItem = this.page.locator('li', { hasText: tagName });
    await tagItem.getByRole('button', { name: 'edit' }).click();
  }

  /**
   * 特定のタグの削除ボタンをクリック
   */
  async clickDeleteButton(tagName: string): Promise<void> {
    const tagItem = this.page.locator('li', { hasText: tagName });
    await tagItem.getByRole('button', { name: 'delete' }).click();
  }

  /**
   * 新規作成ボタンをクリック
   */
  async clickCreateButton(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * すべてのタグ名を取得
   */
  async getAllTagNames(): Promise<string[]> {
    const items = await this.tagItems.all();
    const names: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      if (text) {
        // タグ名部分を抽出（最初の部分）
        const tagName = text.split('tag-')[0].trim();
        names.push(tagName);
      }
    }
    return names;
  }
}

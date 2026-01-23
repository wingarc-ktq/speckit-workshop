import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ダッシュボードページのPage Object
 */
export class DashboardPage extends BasePage {
  readonly url = '/';

  constructor(page: Page) {
    super(page);
  }

  /**
   * ダッシュボードページが表示されているか確認
   */
  async isDashboardPage() {
    return this.page
      .getByRole('heading', { name: 'ダッシュボード', level: 1 })
      .isVisible();
  }

  /**
   * ダッシュボードの見出しを取得
   */
  async getDashboardHeading() {
    // 文書一覧画面で表示されるアップロードボタンをログイン完了のシグナルとして使用
    return this.page.getByRole('button', { name: 'アップロード' });
  }

  /**
   * サイドバーのダッシュボードリンクが表示されているか確認
   */
  async isSidebarVisible() {
    return this.page.getByRole('link', { name: 'ダッシュボード' }).isVisible();
  }
}

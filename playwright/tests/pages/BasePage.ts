import { Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  abstract readonly url: string;
  private readonly basePath: string;

  constructor(page: Page) {
    this.page = page;
    this.basePath = process.env.BASE_PATH || '';
  }

  // 共通ナビゲーション
  async navigate() {
    await this.page.goto(`${this.basePath}${this.url}`);
  }

  // 共通ユーティリティメソッド
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string = 'screenshot') {
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
    });
  }

  // 共通のエラーハンドリング
  async checkForErrors() {
    const errorMessages = this.page.locator(
      '[role="alert"], .error, .alert-error'
    );
    return await errorMessages.count();
  }

  async getPageTitle() {
    return await this.page.title();
  }

  // ネットワーク監視
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  // 要素の待機
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }
}

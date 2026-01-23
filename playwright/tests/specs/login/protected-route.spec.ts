import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { FilesPage } from '../../pages/FilesPage';
import { testUsers } from '../../fixtures/testUsers';

test.describe('保護されたルート', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let filesPage: FilesPage;

  test.beforeEach(async ({ page, context }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    filesPage = new FilesPage(page);

    // セッションをクリアしてテストを開始
    await context.clearCookies();
  });

  test('保護されたページへの直接アクセスでログインにリダイレクトされること', async ({
    page,
  }) => {
    // 1. セッションをクリアする（beforeEachで実行済み）

    // 2. ダッシュボードページ（/）に直接アクセスする
    await page.goto('/');

    // 3. URLが /login にリダイレクトされること
    await expect(page).toHaveURL('/login');

    // 4. ログインページの見出し「ログイン」が表示されること
    await expect(
      page.getByRole('heading', { name: 'ログイン', level: 1 })
    ).toBeVisible();
  });

  test('リダイレクト後のログインで元のページに戻ること', async ({ page }) => {
    // 1. セッションをクリアする（beforeEachで実行済み）

    // 2. ダッシュボードページ（/）に直接アクセスする
    await page.goto('/');

    // 3. ログインページ（/login）にリダイレクトされること
    await expect(page).toHaveURL('/login');

    // 4. メールアドレスに test@example.com を入力する
    await loginPage.fillEmail(testUsers.validUser.email);

    // 5. パスワードに password123 を入力する
    await loginPage.fillPassword(testUsers.validUser.password);

    // 6. 「ログイン」ボタンをクリックする
    await loginPage.clickLoginButton();

    // 7. ダッシュボードページ（/）に戻ること
    await expect(page).toHaveURL('/');

    // 8. ファイル一覧ページが表示されること（/はファイル一覧ページ）
    await expect(filesPage.fileTable).toBeVisible();
  });
});

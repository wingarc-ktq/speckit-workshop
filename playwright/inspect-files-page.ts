import { chromium } from '@playwright/test';

(async () => {
  console.log('ブラウザを起動しています...');
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'ja-JP',
  });
  const page = await context.newPage();

  try {
    // まずログイン
    console.log('ログインページにアクセスしています...');
    await page.goto('http://localhost:5173/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('ログイン情報を入力しています...');
    await page.getByRole('textbox', { name: 'メールアドレスまたはユーザー名' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'パスワード' }).fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ログイン完了を待つ（ルートページにリダイレクト）
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
    console.log('ログインが完了しました');
    
    console.log('\nhttp://localhost:5173/files にアクセスしています...');
    await page.goto('http://localhost:5173/files', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // ページが読み込まれるまで待つ
    await page.waitForTimeout(3000);
    
    console.log('スクリーンショットを取得しています...');
    const screenshotPath = 'c:\\Users\\User\\OneDrive - 福岡工業大学\\WingArc1st\\speckit-workshop\\playwright\\files-page.png';
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`スクリーンショットを ${screenshotPath} に保存しました`);
    
    // ページ構造を確認
    console.log('\n=== ページ構造の分析 ===');
    
    // ヘッダー・タイトル
    const pageTitle = await page.locator('h1, h2, [role="heading"]').first().textContent().catch(() => null);
    console.log(`ページタイトル: ${pageTitle}`);
    
    // 検索ボックス
    const searchInput = await page.locator('input[type="search"], input[placeholder*="検索"], input[placeholder*="search"]').count();
    console.log(`検索入力フィールド: ${searchInput}個`);
    
    // ボタン類
    const buttons = await page.locator('button').all();
    console.log(`\nボタン一覧 (${buttons.length}個):`);
    for (const btn of buttons.slice(0, 10)) {
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      console.log(`  - ${text?.trim() || ariaLabel || '(テキストなし)'}`);
    }
    
    // テーブルまたはリスト
    const tables = await page.locator('table').count();
    const lists = await page.locator('ul, ol').count();
    console.log(`\nテーブル: ${tables}個`);
    console.log(`リスト: ${lists}個`);
    
    // グリッド表示
    const grids = await page.locator('[role="grid"], .grid, [class*="grid"]').count();
    console.log(`グリッド: ${grids}個`);
    
    // ファイル項目
    const fileItems = await page.locator('[data-testid*="file"], [class*="file-item"], [class*="file-card"]').count();
    console.log(`ファイル項目: ${fileItems}個`);
    
    // データテーブルの内容を確認
    if (tables > 0) {
      console.log('\n=== テーブルの内容 ===');
      const headers = await page.locator('table th').allTextContents();
      console.log('ヘッダー:', headers.join(' | '));
      
      const rows = await page.locator('table tbody tr').count();
      console.log(`データ行数: ${rows}行`);
    }
    
    // 10秒間ブラウザを開いたままにする
    console.log('\n10秒間ブラウザを開いたままにします...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\nブラウザを閉じました');
  }
})();

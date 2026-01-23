import { chromium } from '@playwright/test';

(async () => {
  console.log('ブラウザを起動しています...');
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    console.log('テストレポートにアクセスしています...');
    await page.goto('http://localhost:9323/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(2000);
    
    // レポートの構造を確認
    console.log('\n=== テストレポートの分析 ===\n');
    
    // テスト結果のサマリー
    const passed = await page.locator('text=/passed|合格/i').count();
    const failed = await page.locator('text=/failed|失敗/i').count();
    const skipped = await page.locator('text=/skipped|スキップ/i').count();
    
    console.log(`合格テスト数: ${passed}`);
    console.log(`失敗テスト数: ${failed}`);
    console.log(`スキップテスト数: ${skipped}`);
    
    // ページタイトルを取得
    const title = await page.title();
    console.log(`\nページタイトル: ${title}`);
    
    // テストファイルのリストを取得
    console.log('\n=== テストファイル ===');
    const testFiles = await page.locator('[data-testid="test-file-name"], .test-file-path, a[href*="spec"]').allTextContents();
    const uniqueFiles = [...new Set(testFiles.filter(f => f.trim()))];
    uniqueFiles.slice(0, 10).forEach(file => {
      console.log(`  - ${file}`);
    });
    
    // スクリーンショットを保存
    console.log('\nスクリーンショットを保存しています...');
    await page.screenshot({ 
      path: 'c:\\Users\\User\\OneDrive - 福岡工業大学\\WingArc1st\\speckit-workshop\\playwright\\test-report.png',
      fullPage: true 
    });
    
    console.log('\n30秒間レポートを表示します...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\nブラウザを閉じました');
  }
})();

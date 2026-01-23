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
    console.log('http://localhost:5173 にアクセスしています...');
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // ページが読み込まれるまで少し待つ
    await page.waitForTimeout(2000);
    
    console.log('スクリーンショットを取得しています...');
    const screenshotPath = 'c:\\Users\\User\\OneDrive - 福岡工業大学\\WingArc1st\\speckit-workshop\\playwright\\screenshot.png';
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`スクリーンショットを ${screenshotPath} に保存しました`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('ブラウザを閉じました');
  }
})();

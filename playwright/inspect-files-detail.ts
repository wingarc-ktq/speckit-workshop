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
    // ログイン
    console.log('ログインページにアクセスしています...');
    await page.goto('http://localhost:5173/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.getByRole('textbox', { name: 'メールアドレスまたはユーザー名' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'パスワード' }).fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
    
    // ファイル一覧ページ
    console.log('\nファイル一覧ページにアクセスしています...');
    await page.goto('http://localhost:5173/files', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(2000);
    
    console.log('\n=== 詳細な画面要素の分析 ===\n');
    
    // ヘッダーエリア
    console.log('【ヘッダーエリア】');
    const headerButtons = await page.locator('header button, [role="banner"] button').all();
    for (const btn of headerButtons) {
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      console.log(`  - ボタン: ${text?.trim() || ariaLabel || '(不明)'}`);
    }
    
    // 検索エリア
    console.log('\n【検索エリア】');
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]').first();
    const searchPlaceholder = await searchInput.getAttribute('placeholder').catch(() => '');
    console.log(`  - 検索ボックス: placeholder="${searchPlaceholder}"`);
    
    // フィルター・ソート
    console.log('\n【フィルター・ソート】');
    const filterButtons = await page.locator('button').all();
    const filterTexts = [];
    for (const btn of filterButtons.slice(0, 20)) {
      const text = await btn.textContent();
      if (text && text.trim() && !['delete', 'タグ管理', 'おたよりを追加', 'ごみ箱'].includes(text.trim())) {
        filterTexts.push(text.trim());
      }
    }
    console.log(`  - フィルター/ソートボタン: ${filterTexts.slice(0, 10).join(', ')}`);
    
    // テーブルヘッダー
    console.log('\n【テーブル】');
    const headers = await page.locator('table th').allTextContents();
    console.log(`  - ヘッダー: ${headers.join(' | ')}`);
    
    // データ行のサンプル
    const firstRow = page.locator('table tbody tr').first();
    const firstRowCells = await firstRow.locator('td').allTextContents();
    console.log(`  - 1行目データ: ${firstRowCells.join(' | ')}`);
    
    const rowCount = await page.locator('table tbody tr').count();
    console.log(`  - 総データ行数: ${rowCount}行`);
    
    // 操作ボタン（各行）
    console.log('\n【行操作】');
    const rowButtons = await firstRow.locator('button').all();
    for (const btn of rowButtons) {
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      console.log(`  - 行ボタン: ${text?.trim() || ariaLabel || '(不明)'}`);
    }
    
    // ページネーション
    console.log('\n【ページネーション】');
    const pagination = await page.locator('[role="navigation"], .pagination, [class*="pagination"]').count();
    console.log(`  - ページネーション要素: ${pagination}個`);
    
    // その他のUI要素
    console.log('\n【その他のUI要素】');
    const allButtons = await page.locator('button').allTextContents();
    const uniqueButtons = [...new Set(allButtons.map(b => b.trim()).filter(b => b))];
    console.log(`  - 全ボタン一覧 (重複除去): ${uniqueButtons.slice(0, 15).join(', ')}`);
    
    // カテゴリー情報
    console.log('\n【カテゴリー情報】');
    const categoryValues = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    const uniqueCategories = [...new Set(categoryValues.map(c => c.trim()).filter(c => c))];
    console.log(`  - カテゴリー一覧: ${uniqueCategories.slice(0, 10).join(', ')}`);
    
    // スクリーンショット
    console.log('\nスクリーンショットを取得しています...');
    await page.screenshot({ 
      path: 'c:\\Users\\User\\OneDrive - 福岡工業大学\\WingArc1st\\speckit-workshop\\playwright\\files-page-detail.png',
      fullPage: true 
    });
    
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

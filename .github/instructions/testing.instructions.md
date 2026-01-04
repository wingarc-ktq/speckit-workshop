---
applyTo: '**/*.test.{ts,tsx}'
---

# テストガイドライン

## 🧪 テスト実行コマンド

```bash
# 単体テスト (Vitest)
pnpm test          # ウォッチモード
pnpm test:run      # 1回実行
pnpm test:coverage # カバレッジ付きテスト
pnpm test:related  # 関連テストのみ実行

# E2Eテスト (Playwright)
pnpm test:e2e              # E2Eテスト実行
pnpm test:e2e:install      # Playwrightブラウザインストール (初回のみ)
pnpm test:e2e:debug        # デバッグモード
pnpm test:e2e:ui           # UIモード
pnpm test:e2e:report       # レポート表示
```

## 📝 テストの書き方

### 基本原則

- **人間が理解しやすい記述**: 日本語でテスト名を記述
- **並列実行**: カスタムフック・関数は`test.concurrent`を使用
- **mockは極力使わない**: 実際の実装により近いテストを書く
- **userEvent推奨**: fireEventではなくuserEventを使用（より実際のユーザー操作に近い）

### mockのリセットについて

- `vite.config.ts`の`test.mockReset: true`設定により、各テスト実行前に自動でmockがリセットされます。
- これにより、mockの状態がテスト間で持ち越されることはありません。
- 明示的な`vi.resetAllMocks()`は通常不要です

### グローバル関数の利用

- `describe`、`test`、`it`、`expect`、`vi`などのVitest関数は**グローバルに利用可能**です
- これらの関数を**importする必要はありません**
- `tsconfig.app.json`の`"types": ["vitest/globals"]`設定により型定義が有効です
- `vite.config.ts`の`test.globals: true`設定によりランタイムでも利用可能です

### ❌ 不要なimport（避けるべき）

```typescript
// これらのimportは不要
import { describe, test, it, expect, vi } from 'vitest';
import { beforeEach, afterEach } from 'vitest';
```

### テスト例

```typescript
// ✅ 良い例
test('ユーザーがボタンをクリックした時にモーダルが開くこと', async () => {
  // userEventを使用する場合はasync/awaitが必要
});

test.concurrent('useWindowSizeが正しいウィンドウサイズを返すこと', () => {
  // カスタムフック・関数のテスト（並列実行）
});

// ❌ 悪い例
test('onClick prop calls handler', () => {});
it('should work', () => {}); // itは使わない
```

### テスト構造

```typescript
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TestProviders } from '@/__fixtures__/testWrappers';

describe('MyComponent', () => {
  const renderMyComponent = (props) => {
    return render(
      <TestProviders>
        <MyComponent {...props} />
      </TestProviders>
    );
  };

  beforeEach(() => {
    i18n.changeLanguage('ja');
  });

  describe('多言語リソースの確認', () => {
    beforeEach(() => {
      const r = renderMyComponent({ title: 'テストタイトル' });
    });

    describe('i18n: page.title', () => {
      const text = 'タイトル';
      test(`locale:ja "${text}"が表示される`, async () => {
        await waitFor(() => {
          expect(r.getByText(text)).toBeInTheDocument();
        });
      });
    });
  });

  describe('初期表示', () => {
    test('タイトルが正しく表示されること', () => {
      const r = renderMyComponent({ title: 'テストタイトル' });

      expect(r.getByText('テストタイトル')).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('ボタンをクリックした時にonClickが呼ばれること', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const r = renderMyComponent({ title: 'Test', onClick: handleClick });
      await user.click(r.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });
});
```

### userEventの使用例

```typescript
// ボタンクリック
await user.click(button);

// テキスト入力
await user.type(input, 'Hello World');

// キーボード操作
await user.keyboard('{Enter}');
await user.keyboard('{Escape}');

// ホバー
await user.hover(element);

// フォーカス移動
await user.tab(); // Tab キーでフォーカス移動
```

## 🎭 E2Eテスト (Playwright)

### 基本原則

- **Page Object Model**: ページ操作をクラスに抽象化
- **テスト仕様書**: マークダウンでテスト仕様を記述してから実装
- **data-testid**: テスト用の要素識別には`data-testid`属性を使用
- **独立性**: テスト間で状態を共有しない

### ディレクトリ構造

```
playwright/
├── tests/
│   ├── pages/           # Page Objectクラス
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   ├── fixtures/        # テストフィクスチャ
│   │   └── testUsers.ts
│   └── specs/           # テスト仕様とテストコード
│       └── login/
│           ├── login.md   　　　 # テスト仕様書 (マークダウン)
│           └── login.spec.ts    # テスト実装
```

### Page Objectの例

```typescript
// playwright/tests/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
}
```

### テストの例

```typescript
// playwright/tests/specs/login/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('ログイン', () => {
  test('有効な認証情報でログインできること', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');

    await expect(page).toHaveURL('/dashboard');
  });
});
```

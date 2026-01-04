# UI Prototype E2E Testing

**マークダウン仕様書駆動開発** + **Playwright MCP** でAI支援E2Eテストを実現するプロジェクトです。

## 🎯 プロジェクトの特徴

- **マークダウン仕様書駆動**: 日本語の仕様書を基にテスト自動生成
- **Playwright MCP統合**: 画面情報を取得してPage Object自動生成
- **AI支援開発**: GitHub CopilotでテストコードとPage Objectを効率的に実装

## 🚀 クイックスタート

```bash
# セットアップ
pnpm install

# Playwrightブラウザのインストール
pnpm test:e2e:install

# 環境設定ファイルのコピー
cp .env.example .env

# ローカル環境でテストする場合は
# ui-prototype-e2eで`pnpm dev`を実行

# テスト実行
pnpm test:e2e
```

## 🤖 AI支援によるテスト開発

### 基本的な開発フロー

1. **仕様書作成**: `tests/specs/{機能名}/{機能名}.md`に日本語でテスト仕様を記述
2. **Copilotに依頼**: 下記のサンプルプロンプトでテスト生成を依頼
3. **自動実装**: AIがPlaywright MCPで画面分析→Page Object生成→テスト実装
   - **メインページ**: 画面全体の操作を`tests/pages/{機能名}Page.ts`に実装
   - **ダイアログ**: 再利用可能なダイアログを`tests/pages/dialogs/`に分離

### サンプルプロンプト

```
E2Eテストの仕様書を元にテストを実装したいです。
必要な情報：
- テスト対象のURL: [例: http://localhost:5173/login]
- 仕様書ファイル: [例: tests/specs/login/login.md]
- 実装ファイル: [例: tests/specs/login/login.spec.ts]
手順：
1. まずPlaywright MCPでページにアクセスしてbrowser_snapshotを取得
2. 画面の要素情報を基にPage Object Modelを更新
   - メイン画面の操作: tests/pages/{機能名}Page.ts
   - ダイアログ操作: tests/pages/dialogs/{ダイアログ名}.ts
3. マークダウン仕様書に基づいてテストを実装
```

### 必要な情報

- **テスト対象URL**: MCPで画面分析するページ
- **仕様書パス**: 実装したいマークダウン仕様書
- **出力パス**: 生成するテストファイル
- **Page Objectクラス**: 更新対象のページクラス（存在する場合）

## 📛 命名規則

### ファイル命名

| ファイル種類           | 命名規則             | 例                      |
| ---------------------- | -------------------- | ----------------------- |
| **マークダウン仕様書** | `kebab-case.md`      | `folder-create.md`      |
| **テストファイル**     | `kebab-case.spec.ts` | `folder-create.spec.ts` |
| **Page Object**        | `PascalCase.ts`      | `FolderPage.ts`         |
| **Dialog**             | `PascalCase.ts`      | `FolderCreateDialog.ts` |
| **Fixture**            | `camelCase.ts`       | `testUsers.ts`          |
| **設定ファイル**       | `kebab-case`         | `playwright.config.ts`  |

### コード命名

| 要素          | 命名規則           | 例                          |
| ------------- | ------------------ | --------------------------- |
| **クラス名**  | `PascalCase`       | `FolderPage`, `ErrorDialog` |
| **関数/変数** | `camelCase`        | `createFolder`              |
| **テスト名**  | 日本語             | `フォルダを作成できること`  |
| **定数**      | `UPPER_SNAKE_CASE` | `MAX_FOLDER_NAME`           |

## 📁 プロジェクト構造

```
tests/
├── specs/                           # テストファイル
│   └── {機能名}/                     # 機能ごとにディレクトリ
│       ├── {機能名}.md               # 基本機能の仕様書
│       ├── {機能名}.spec.ts          # 基本機能のテスト
│       ├── {機能名}-{操作}.md         # 特定操作の仕様書
│       └── {機能名}-{操作}.spec.ts    # 特定操作のテスト
├── pages/                           # Page Object Model
│   ├── BasePage.ts                  # ベースページクラス
│   ├── {機能名}Page.ts               # 各機能のページクラス
│   └── dialogs/                     # ダイアログ専用Page Object
│       ├── {機能名}{操作}Dialog.ts    # 特定操作のダイアログ
│       └── ErrorDialog.ts           # エラーダイアログ（共通）
└── fixtures/                        # テストデータ・ユーティリティ
    └── {データ名}.ts                 # テストデータ
playwright-report/                   # テスト実行結果レポート
test-results/                        # テスト実行結果の詳細データ
.github/
├── workflows/
│   └── playwright.yml               # CI/CDパイプライン
└── instructions/
    └── copilot-instructions.md      # AI支援用指示
.vscode/
└── mcp.json                         # MCP設定（VS Code + Copilot統合）
```

## 📝 マークダウン仕様書の書き方

```markdown
# {機能名}

## {テストケース名}（「〜すること」で終わる）

### データ（必要な場合）

| param1 | param2 |
| ------ | ------ |
| value1 | value2 |

### 前提条件（必要な場合）

- テスト実行前に必要な状態や条件を記述
- 例: テスト実行前に同名のフォルダが存在しないこと
- 例: テスト実行前に削除対象のデータが存在すること

### 手順

1. 具体的なアクション
2. 入力・操作
3. 期待される結果の確認

### 事後処理（必要な場合）

- テスト完了後のクリーンアップ処理を記述
- 例: 作成したテストデータを削除する
- 例: 変更した設定を元に戻す
```

### セクションの使い分け

- **データ**: テストで使用する入力値・期待値
- **前提条件**: テスト開始前に必要な状態（beforeEachで実装）
- **手順**: テストの実行ステップ
- **事後処理**: テスト完了後のクリーンアップ（afterEachで実装）

## 🧪 テスト実行

### 初回セットアップ

```bash
# Playwrightブラウザのインストール（初回のみ）
pnpm test:e2e:install
```

### テストコマンド

```bash
# 基本コマンド
pnpm test:e2e              # 全テスト実行
pnpm test:e2e:headed       # ブラウザ表示付き
pnpm test:e2e:ui           # インタラクティブモード
pnpm test:e2e:debug        # デバッグモード
pnpm test:e2e:report       # レポート表示

# ブラウザ別実行
pnpm test:e2e:chromium     # Chromiumのみ
pnpm test:e2e:firefox      # Firefoxのみ
pnpm test:e2e:webkit       # WebKitのみ
pnpm test:e2e:mobile       # モバイルブラウザ
```

## テスト環境

| 環境  | URL                   | Basename | 用途         |
| ----- | --------------------- | -------- | ------------ |
| Local | http://localhost:5173 | なし     | 開発時テスト |

## 🔧 トラブルシューティング

**要素が見つからない場合**

```typescript
// MCP確認済みの要素を使用
await page.getByTestId('submit-button');
await page.getByRole('button', { name: 'Submit' });
```

**テストが不安定な場合**

```bash
# リトライ回数を増やす
pnpm test --retries=3
```

## 📚 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

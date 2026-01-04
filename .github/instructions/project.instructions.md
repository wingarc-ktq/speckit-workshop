---
applyTo: '**/*.{ts,tsx,js,jsx}'
---

# プロジェクト概要

## 📋 技術スタック

- React 19 + TypeScript + Vite + Material-UI (MUI)
- アーキテクチャ: Clean Architecture + Domain Driven Design
- 状態管理: TanStack Query (React Query)
- ルーティング: React Router v7
- API: OpenAPI 3.1 + Orval (コード自動生成)
- テスト: Vitest + React Testing Library + Playwright (E2E)
- モック: MSW (Mock Service Worker)
- 国際化: react-i18next
- パッケージマネージャー: pnpm

## 📁 アーキテクチャ

### ディレクトリ構造

- `domain/`: ビジネスロジック・ドメインモデル
- `adapters/`: 外部API・データアクセス
- `app/`: アプリケーション設定・プロバイダー
- `i18n/`: 国際化（翻訳設定・言語ファイル）
- `presentations/`: UI層（コンポーネント・ページ・レイアウト）

### 分離指針

- **Presentational**: UIのみ、propsに依存
- **Container**: データ取得・状態管理
- **適切な責任分離**: 1コンポーネント1責任

## 🔍 開発時の確認コマンド

```bash
# 開発サーバー起動
pnpm dev           # Vite開発サーバー起動 (http://localhost:5173)

# コード品質チェック
pnpm lint          # ESLintチェック (警告0必須)
pnpm format:fix    # Prettierによるコードフォーマット
pnpm type-check    # TypeScriptの型チェック

# テスト実行
pnpm test:related  # 関連テスト実行
pnpm test:coverage # カバレッジ付きテスト
pnpm test:e2e      # E2Eテスト (Playwright)

# APIコード生成
pnpm gen:api       # OpenAPIスキーマからコード生成
```

## ✅ チェックリスト

- [ ] コンポーネントに適切な型定義がある
- [ ] テスト記述が人間が読みやすい形式（日本語）
- [ ] MUIコンポーネントを個別インポートしている
- [ ] カスタムフックにuseプレフィックスがついている
- [ ] ファイル構造がアーキテクチャに従っている

# Implementation Plan: 文書管理システム

**Branch**: `002-document-management-sogorei` | **Date**: 2025-01-14 | **Spec**: [specs/002-document-management-sogorei/spec.md](specs/002-document-management-sogorei/spec.md)
**Input**: Feature specification from `/specs/002-document-management-sogorei/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

チームで文書を共有・整理するシンプルな文書管理システムのフロントエンド実装。ユーザーは直感的なUIで文書をアップロード・検索・フィルタリングできます。既存の001-user-auth認証基盤を再利用し、React + Material-UI で MVP機能（P1: アップロード、一覧表示、キーワード検索）に絞って実装します。バックエンド API は OpenAPI 3.0 仕様に従い、Orval による自動生成コード を使用。 E2E テストは Playwright で記述し、コンポーネント・ユーティリティテストは Vitest で実装します。

## Technical Context

**Language/Version**: TypeScript 5.6 + React 19 (Node.js v22)  
**Primary Dependencies**: React Router v7, Material-UI v6, TanStack Query v5, Axios, MSW, React-i18next, Orval  
**Storage**: N/A（バックエンド側で実装）  
**Testing**: Vitest + React Testing Library（ユニット・コンポーネント）、Playwright（E2E）、MSW（API モッキング）  
**Target Platform**: Web ブラウザ（デスクトップ・タブレット対応）  
**Project Type**: モノリシック Web フロントエンド  
**Performance Goals**: ファイル一覧表示 2秒以内、キーワード検索 1秒以内（100件データ）  
**Constraints**: ファイルサイズ上限 10MB、同時アップロード 20ファイル、ページネーション 20件/ページ  
**Scale/Scope**: MVP 3画面（一覧・アップロード・詳細）、 100件ファイル対応、 50 同時ユーザー想定

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **TypeScript Strict Mode**: 既存プロジェクトで tsconfig.json に `strict: true` が設定済み。本機能でも厳密型チェック を適用。

✅ **Component Architecture**: React 関数コンポーネント + Hooks パターン を採用。Material-UI コンポーネントをベースに実装。

✅ **Material-UI First**: 既存プロジェクトで MUI v6 を採用。ボタン・ダイアログ・リスト・チップ・フィールド等の標準コンポーネント を使用。カスタム UI は必要に応じて `sx` prop で styling。

✅ **Test-Driven Development**: 
- ユニットテスト: Vitest + React Testing Library（ユーティリティ・フック・コンポーネント）
- E2E テスト: Playwright（ユーザーストーリー単位、data-testid 属性で要素特定）
- カバレッジ目標: 80% 以上（クリティカルパス）

✅ **API-First with OpenAPI**: 既存の OpenAPI 3.0 スペック (`schema/files/openapi.yaml`) を使用。Orval による自動生成コード で API クライアント・MSW ハンドラーを生成。API 仕様変更は OpenAPI ファイルを先に更新。

✅ **Clean Architecture**:
- Domain: ビジネスロジック・エラー型（`src/domain/`）
- Adapters: API クライアント・リポジトリ（`src/adapters/`）
- Application: ルーティング・プロバイダー（`src/app/`）
- Presentation: コンポーネント・ページ・レイアウト（`src/presentations/`）

✅ **Accessibility & Responsive Design**: WCAG 2.1 Level AA 準拠。MUI の responsive Grid・Flexbox を活用。デスクトップ（1920x1080+）・タブレット（768x1024+）対応。

**GATE RESULT**: ✅ PASS - すべての Constitution ルール に準拠。本プロジェクトで違反・例外なし。

## Project Structure

## Project Structure

### Documentation (this feature)

```text
specs/002-document-management-sogorei/
├── plan.md                    # This file (実装プラン概要)
├── spec.md                    # 仕様書（要件・ユーザーストーリー）
├── research.md                # Phase 0 - 技術研究結果
├── data-model.md              # Phase 1 - エンティティ・データモデル
├── quickstart.md              # Phase 1 - セットアップ・実装ガイド
├── contracts/
│   └── api-rest.md            # Phase 1 - REST API 仕様
├── tasks.md                   # Phase 2 - タスク分解（未作成）
└── checklists/
    └── requirements.md        # 要件チェックリスト
```

### Source Code (repository root)

```text
src/
├── domain/                    # Domain Layer - ビジネスロジック
│   ├── models/
│   │   ├── document/
│   │   │   ├── Document.ts    # Document エンティティ型
│   │   │   └── DocumentError.ts
│   │   ├── tag/
│   │   │   └── Tag.ts        # Tag エンティティ型
│   │   └── search/
│   │       └── SearchCondition.ts
│   └── errors/
│       ├── DocumentException.ts
│       └── FileUploadException.ts
│
├── adapters/                  # Adapters Layer - API・リポジトリ
│   ├── generated/
│   │   └── files.ts           # Orval 自動生成（OpenAPI）
│   ├── mocks/
│   │   └── handlers/
│   │       └── fileHandlers.ts  # MSW ハンドラー
│   └── repositories/
│       ├── DocumentRepository.ts
│       ├── TagRepository.ts
│       └── index.ts
│
├── app/                       # Application Layer
│   ├── router/
│   │   └── routes.tsx         # 文書管理ルート追加
│   └── providers/
│       ├── QueryProvider/
│       ├── RepositoryProvider/
│       └── (既存プロバイダー)
│
└── presentations/             # Presentation Layer - UI
    ├── components/
    │   ├── files/
    │   │   ├── FileUploadArea.tsx
    │   │   ├── FileList.tsx
    │   │   ├── FileGridView.tsx
    │   │   ├── FileDetailsModal.tsx
    │   │   ├── PDFViewer.tsx
    │   │   └── __tests__/
    │   ├── tags/
    │   │   ├── TagChip.tsx
    │   │   ├── TagSelector.tsx
    │   │   └── TagManagement.tsx
    │   └── search/
    │       └── SearchBar.tsx
    ├── hooks/
    │   ├── queries/
    │   │   ├── useDocuments.ts
    │   │   └── useTags.ts
    │   └── mutations/
    │       ├── useFileUpload.ts
    │       ├── useFileDelete.ts
    │       └── useTagOperations.ts
    ├── pages/
    │   ├── DocumentManagementPage.tsx
    │   └── __tests__/
    └── layouts/
        └── (既存のレイアウト)

tests/
├── playwright/
│   ├── fixtures/
│   │   └── documentFixtures.ts
│   ├── pages/
│   │   └── DocumentManagementPage.ts
│   └── specs/
│       ├── document-management/
│       │   ├── upload.spec.ts
│       │   ├── search.spec.ts
│       │   └── delete.spec.ts
│       └── ...
```

**Structure Decision**: 
既存の Clean Architecture パターン（Domain → Adapters → Application → Presentation）を踏襲。単一 Web フロントエンド プロジェクトで、モノリシック構成。

---

## Implementation Timeline（推定）

### Phase 1: 基本機能（Day 2 - 2h）

| Task | 説明 | Est. | Owner |
|------|------|------|-------|
| 1.1 | Domain Model 定義 | 20m | Dev |
| 1.2 | API クライアント生成（Orval） | 10m | Dev |
| 1.3 | DocumentRepository 実装 | 15m | Dev |
| 1.4 | TanStack Query Hooks | 15m | Dev |
| 1.5 | FileUploadArea コンポーネント | 25m | Dev |
| 1.6 | FileList コンポーネント | 20m | Dev |
| 1.7 | SearchBar 実装 | 15m | Dev |

**Deliverable**: MVP 画面プロトタイプ、API 統合完了

### Phase 2: 詳細機能・テスト（Day 2-3 - 4h）

| Task | 説明 | Est. |
|------|------|------|
| 2.1 | ファイル詳細モーダル + PDF プレビュー | 30m |
| 2.2 | グリッドビュー実装 | 20m |
| 2.3 | タグ管理ページ（Admin）| 25m |
| 2.4 | ゴミ箱・復元機能 | 20m |
| 2.5 | ユニットテスト（80%+） | 45m |
| 2.6 | E2E テスト（Playwright）| 40m |

**Deliverable**: 完全な MVP 機能実装、テストカバレッジ 80% 以上

### Phase 3: ポーランド・デプロイ準備（Day 3-4 - 2h）

| Task | 説明 | Est. |
|------|------|------|
| 3.1 | アクセシビリティ確認（WCAG 2.1 AA） | 30m |
| 3.2 | レスポンシブテスト（デスクトップ・タブレット） | 20m |
| 3.3 | パフォーマンス最適化（Lighthouse） | 30m |
| 3.4 | バグ修正・QA | 20m |
| 3.5 | ドキュメント整備 | 20m |

**Deliverable**: 本番デプロイ可能な品質

---

## Dependencies & Tech Stack

### Frontend Runtime

| Dependency | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI フレームワーク |
| TypeScript | 5.6+ | 型安全 |
| Material-UI (MUI) | v6+ | コンポーネント |
| TanStack Query | v5+ | サーバー状態管理 |
| React Router | v7+ | ルーティング |
| Axios | Latest | HTTP クライアント |
| React Hook Form | v7+ | フォーム管理 |
| Zod | v3+ | スキーマ検証 |
| react-i18next | Latest | 国際化 |
| **react-pdf** | 8.0.0 | PDF プレビュー |
| **react-dropzone** | 14.2.0 | D&D アップロード |

### Development

| Tool | Version | Purpose |
|------|---------|---------|
| Vite | 5+ | ビルドツール |
| Vitest | Latest | ユニットテスト |
| React Testing Library | Latest | コンポーネントテスト |
| Playwright | Latest | E2E テスト |
| MSW | Latest | API モッキング |
| Orval | Latest | OpenAPI コード生成 |
| ESLint | Latest | Linting |
| Prettier | Latest | Code Format |

---

## Complexity Tracking

> Constitution Check で違反・例外はなし（✅ PASS）

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| PDF プレビュー レンダリング遅延 | High | Suspense + Skeleton でローディング表示、仮想スクロール検討 |
| 大量ファイルのパフォーマンス | Medium | TanStack Query の無限スクロール、ページネーション実装 |
| ファイルアップロード キャンセル | Low | AbortController で対応済み |
| 複数ユーザー同時操作 | Low | 楽観的ロック（Last Write Wins）で対応 |

---

## Success Criteria（Acceptance）

✅ **Functional**:
- ファイルアップロード成功率 99%+
- 検索レスポンス < 1 秒（100件データ）
- PDF プレビュー表示 < 2 秒

✅ **Quality**:
- テストカバレッジ 80% 以上
- ESLint ゼロエラー
- TypeScript Strict 準拠

✅ **UX**:
- ユーザー操作の 5 分以内にタスク完了（初回）
- アクセシビリティ WCAG 2.1 Level AA 準拠
- レスポンシブ対応（デスクトップ・タブレット）

---

## Next Steps

✅ **Phase 0 & Phase 1 完成**:
- research.md （技術研究）
- data-model.md （エンティティ定義）
- contracts/api-rest.md （API 仕様）
- quickstart.md （セットアップガイド）

👉 **Phase 2 へ**:
1. `speckit.tasks` でタスク分解 → tasks.md 生成
2. `speckit.implement` でコンポーネント実装開始
3. Day 2 実装着手

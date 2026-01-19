# Implementation Plan: 文書管理システム

**Branch**: `002-document-management-Kaede` | **Date**: 2025-01-14 | **Spec**: specs/002-document-management-Kaede/spec.md
**Input**: Feature specification from `/specs/002-document-management-Kaede/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

文書管理システムのMVP機能を実装。ユーザーが文書をアップロード・分類・検索できるシンプルな管理システム。P1機能（アップロード、一覧表示、検索）を土台にP2（タグ管理・詳細表示）、P3（メタデータ編集・削除／ゴミ箱）も段階的に実装、Material-UIベースのレスポンシブUIとOpenAPI定義済みAPIを使用。
本フェーズでは、User Story 1〜8 を対象とし、文書のライフサイクル（作成・閲覧・編集・削除・復元）を一通り扱える状態を目指す。

## Scope

### In Scope
- User Story 1〜3（P1）: アップロード、一覧表示、検索
- User Story 4〜6（P2）: タグフィルタ、詳細表示、タグ管理
- User Story 7〜8（P3）: メタデータ編集、削除・ゴミ箱・復元

### Out of Scope
- User Story 9（検索条件の保存）
- 文書のバージョン管理
- 権限管理（ユーザー別アクセス制御）

## Phase Breakdown

### Phase 1 (P1)
- File upload
- Document list (list/grid)
- Keyword search

### Phase 2 (P2)
- Tag filtering
- Document detail view
- Tag management (create / edit / delete)

### Phase 3 (P3)
- Document metadata edit
- Soft delete (move to trash)
- Restore from trash
- Permanent delete (UI only)


## Technical Context

**Language/Version**: TypeScript (React 19 with TypeScript strict mode)  
**Primary Dependencies**: React 19, Material-UI v6+, TanStack Query, Axios (generated from OpenAPI), react-i18next  
**Storage**: バックエンド側ファイルストレージ (AWS S3等、フロントエンドではOpenAPI経由)  
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E)  
**Target Platform**: Web browser (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)  
**Project Type**: Web application (frontend only, APIは既存)  
**Performance Goals**: アップロード10秒以内 (5MBファイル), 検索1秒以内 (100件文書), 一覧表示2秒以内  
**Constraints**: WCAG 2.1 AA準拠, レスポンシブ (desktop/tablet), 50人同時アクセス, 100件文書管理  
**Scale/Scope**: 50 concurrent users, 100 documents, 1TB total storage

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ TypeScript Strict Mode: TypeScript strict modeを使用  
✅ Component Architecture: Functional components with hooksを使用  
✅ Material-UI First: Material-UIをUIライブラリとして使用  
✅ Test-Driven Development: Vitest, Playwrightを使用したテストを実施  
✅ API-First with OpenAPI: OpenAPI定義済みAPIを使用、Orvalでコード生成  
✅ Clean Architecture: Domain/Adapters/Presentation層の分離  
✅ Accessibility & Responsive Design: WCAG 2.1 AA準拠、レスポンシブ対応  

**Gate Status**: PASS - すべての原則が遵守される

## Project Structure

### Documentation (this feature)

```text
specs/002-document-management-Kaede/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── models/
│   │   ├── files/
│   │   └── tags/
│   ├── errors/
│   └── utils/
├── adapters/
│   ├── generated/
│   │   ├── files.ts    # Orval generated API client
│   │   └── tags.ts
│   └── repositories/
│       ├── files/
│       └── tags/
├── presentations/
│   ├── components/
│   │   ├── files/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── FileList.tsx
│   │   │   └── FileSearch.tsx
│   │   │   └── FileActions.tsx   # edit / delete / restore
│   │   └── tags/
│   ├── pages/
│   │   ├── DocumentManagementPage.tsx
│   │   └── FileDetailPage.tsx
│   │   └── TrashPage.tsx
│   ├── hooks/
│   │   ├── queries/
│   │   └── mutations/
│   └── ui/
├── app/
│   ├── providers/
│   └── router/
└── i18n/
    └── locales/

playwright/
├── tests/
│   └── specs/
│       └── document-management/
│           ├── document-management.md
│           └── document-management.spec.ts
└── pages/
    └── DocumentManagementPage.ts
```

**Structure Decision**: Web application (frontend only) を選択。既存の src/ 構造に Clean Architecture に従って domain/adapters/presentations 層を追加。API は既存の OpenAPI 定義を使用し、Orval で生成されたクライアントを使用。テストは既存の Vitest/Playwright 構造に統合。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

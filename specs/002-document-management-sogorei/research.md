# Research: 文書管理システム MVP

**Date**: 2025-01-14  
**Phase**: Phase 0 - Technical Research  
**Status**: In Progress

## Research Questions & Answers

### 1. ファイルプレビュー機能の実装戦略

**Question**: PDF・画像ファイルをブラウザ内でプレビューするベストプラクティスは何か？

**Decision**: `react-pdf` (PDF.js ベース) + ネイティブ `<img>` 要素の組み合わせ

**Rationale**:
- PDF プレビュー: `react-pdf` は PDF.js をラップし、ブラウザ互換性が高い。Mozilla 公式メンテナンス
- 画像プレビュー: `<img>` タグで十分（CORS対応が必要な場合は Blob URL を使用）
- 代替検討: `pdfjs-dist` （低レベル）は複雑、`pdf-viewer-library` は保守性が不十分
- Figmaファイルから見た要件: 詳細画面にサムネイル + フルサイズプレビュー切り替え

**Dependencies to Add**: 
```json
"react-pdf": "^8.0.0",
"pdfjs-dist": "^4.0.0"
```

**Implementation Notes**:
- `<Suspense>` で PDF ロード中の UI を管理
- MUI Skeleton コンポーネントでローディング状態を表示
- エラーハンドリング: ファイル破損・不正形式の場合は代替メッセージを表示

---

### 2. ドラッグ&ドロップの実装パターン

**Question**: Material-UI を使いながら、ネイティブ HTML5 ドラッグ&ドロップ vs ライブラリ (react-dropzone) どちらが最適か？

**Decision**: `react-dropzone` + Material-UI カスタムスタイリング

**Rationale**:
- HTML5 ドラッグ&ドロップの基本実装は簡潔だが、バリデーション（ファイルサイズ・形式）が複雑に
- `react-dropzone`: バリデーション・複数ファイル処理が組み込まれている、React Hooks 対応
- Material-UI との統合: `sx` prop で Material Design スタイルを適用、Backdrop で hover 状態を表現
- 代替検討: `react-beautiful-dnd` （DnD 用で、フォームアップロードには過度）

**Dependencies to Add**:
```json
"react-dropzone": "^14.2.0"
```

**Implementation Notes**:
- アップロードエリア: MUI Paper コンポーネント with Box, Center, TextField
- ドラッグ状態: `useDropzone` の `getRootProps()` で `onDragEnter/Over/Leave` 制御
- ファイル検証: `onDrop` コールバックで `File API` より事前チェック

---

### 3. 大量ファイル一覧のバーチャル化

**Question**: 100+ 件のファイルを効率的にレンダリングするには？

**Decision**: `TanStack Virtual` (React Virtual) + TanStack Query

**Rationale**:
- DOM ノード数を制限（仮想スクロール）して、大量ファイル列挙時のパフォーマンス低下を防止
- TanStack Query で無限スクロール・ページネーション両方に対応可能
- MUI List/Table と組み合わせる場合: `virtuoso` より `@tanstack/react-virtual` が推奨（軽量、TypeScript サポート充実）
- 実装戦略: ページネーション実装が仕様にあるため、初期段階では 20 件固定で十分。将来的に無限スクロール対応時に `react-virtual` を導入

**Dependencies**: 
```json
"@tanstack/react-virtual": "^3.0.0",
"@tanstack/react-query": "^5.0.0"
```

**Implementation Notes** (MVP):
- ページネーション: `<Pagination>` MUI コンポーネント で 20 件/ページ
- 今後の拡張: 無限スクロール導入時に仮想化を検討

---

### 4. フォーム検証とエラーハンドリング

**Question**: React フォーム検証ライブラリのベストチョイスは？

**Decision**: `React Hook Form` + `Zod` + MUI Error Components

**Rationale**:
- `React Hook Form`: パフォーマンス最適（非制御コンポーネント）、MUI との相性良好
- `Zod`: TypeScript ネイティブ、ランタイム型検証、多言語エラーメッセージ対応（i18n と統合可能）
- 既存プロジェクト: 001-user-auth で同じパターン使用済み → 一貫性維持
- 代替検討: Formik （再レンダリング多い）, Yup （Zod より型安全性低い）

**Dependencies** (既存):
```json
"react-hook-form": "^7.48.0",
"zod": "^3.22.0"
```

**Implementation Notes**:
- ファイルアップロードフォーム: `useForm` + `Controller` で MUI TextField を制御
- タグ選択: `useFieldArray` で動的フィールド管理
- i18n: `react-i18next` で多言語エラーメッセージを定義

---

### 5. タグ・チップのカラーマッピング

**Question**: タグの色設定をどう管理するか（DB カラム名 vs フロント定義）？

**Decision**: バックエンド仕様に合わせ、タグ Entity に `color` フィールド (HEX or セマンティック名) を含める

**Rationale**:
- OpenAPI スペックで `Tag` スキーマに `color: string` プロパティを定義
- フロント側: カラー値の検証 + Chip コンポーネント へのマッピング
- Material-UI Chip: `color` prop は `"default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"` に限定されるため、HEX → Semantic への変換テーブルが必要

**Implementation Pattern**:
```typescript
// src/domain/models/tag/Tag.ts
type TagColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';

interface Tag {
  id: string;
  name: string;
  color: TagColor;  // セマンティック名を使用
}

// src/presentations/components/tags/TagChip.tsx
const colorMap: Record<string, string> = {
  primary: '#1976d2',
  error: '#d32f2f',
  success: '#388e3c',
  warning: '#f57c00',
  info: '#0288d1',
  secondary: '#7b1fa2',
};
```

**Implementation Notes**:
- OpenAPI スキーマで `color: string` として定義し、enum 値を制約
- バリデーション: Zod で許可色のみに制限

---

### 6. 検索・フィルタの状態管理

**Question**: 検索条件（キーワード、タグフィルタ、日付範囲）をどこに保持するか？

**Decision**: TanStack Query `useQuery` の QueryKey + URL Query Params + React Context の組み合わせ

**Rationale**:
- **Server State** (ファイル一覧): TanStack Query の `useQuery` で管理
- **Query String**: URL に検索条件を反映 → シェアリング・ブックマーク対応
- **Client State** (フォーム入力): `React Hook Form` で一時保持 → クエリ実行時に Query Params へ変換
- **Saved Searches**: LocalStorage または Context に保存（ローカル設定）、サーバー側に Persist の仕様がある場合は API 経由

**Implementation Pattern**:
```typescript
// useFileSearch.ts hook
const useFileSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const search = searchParams.get('search') || '';
  const tagIds = searchParams.getAll('tagIds') || [];
  const page = parseInt(searchParams.get('page') || '1');
  
  const { data: files } = useQuery({
    queryKey: ['files', { search, tagIds, page }],
    queryFn: ({ signal }) => getFiles({ search, tagIds, page }, signal),
  });

  return { files, search, tagIds, page, setSearchParams };
};
```

**Implementation Notes**:
- React Router v7 の `useSearchParams` で URL 同期
- TanStack Query の `enabled` で条件付き fetch
- 保存済み検索: Context または IndexedDB で管理

---

### 7. ファイルアップロード進捗表示

**Question**: マルチファイルアップロード時の個別進捗表示をどう実装するか？

**Decision**: `XMLHttpRequest.upload` イベント + Context で進捗共有

**Rationale**:
- Axios は FormData アップロードで `onUploadProgress` コールバック対応
- 複数ファイル: 各ファイルごとに `upload.abort()` 可能にするため、ファイル ID をキーにした進捗 Map を Context に保持
- MUI LinearProgress で個別進捗バーを表示

**Implementation Pattern**:
```typescript
// useFileUpload.ts hook
interface UploadProgress {
  [fileId: string]: { loaded: number; total: number };
}

const uploadFile = async (file: File) => {
  const fileId = crypto.randomUUID();
  const formData = new FormData();
  formData.append('file', file);

  await axios.post('/api/v1/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      setProgress(prev => ({
        ...prev,
        [fileId]: {
          loaded: progressEvent.loaded,
          total: progressEvent.total || 0,
        },
      }));
    },
  });
};
```

**Implementation Notes**:
- エラー時の再試行: ファイルごとに retry ロジック を実装
- キャンセル: AbortController で処理中アップロードをキャンセル可能に

---

### 8. 国際化（i18n）の戻り値型

**Question**: Zod エラーメッセージを国際化する方法は？

**Decision**: react-i18next + Zod の `refine` + カスタムメッセージ関数

**Rationale**:
- Zod `refine()` は非同期検証に対応
- i18next の `t()` を検証関数内で使用して、多言語エラーメッセージを返却
- 既存プロジェクト: `src/i18n/zodLocale.ts` で Zod メッセージをカスタマイズ済み

**Implementation Pattern**:
```typescript
// src/i18n/zodLocale.ts (既存)
import { z } from 'zod';
import i18n from '@/i18n/index';

const zodLocaleJa: ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case 'too_big':
      return {
        message: i18n.t('validation:fileSizeTooLarge', {
          max: '10MB',
        }),
      };
    // ...
  }
};

z.setErrorMap(zodLocaleJa);
```

**Implementation Notes**:
- Zod スキーマ: `ts` ファイルでグローバル定義 → コンポーネント から `import`
- UI 側: MUI `FormHelperText` でエラー表示

---

### 9. 権限・アクセス制御の設計

**Question**: 文書管理システムで権限（認可）をどう扱うか？

**Decision**: 仕様の "全ユーザーが全文書を閲覧・編集可能" ルールに従い、MVP ではシンプル化

**Rationale**:
- 仕様: "全ユーザーが同じチームとして扱われる"  → 個別権限チェック不要
- フロント側: ログインユーザー の `role` (admin / user) のみ参照
  - Admin: タグ管理・ユーザー管理メニュー表示
  - User: ファイル操作のみ
- バックエンド側: API レベルの権限チェック（フロント側は信頼性チェック、本体はサーバー実装）

**Implementation Pattern**:
```typescript
// src/domain/models/user/User.ts
type UserRole = 'admin' | 'user';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// src/presentations/pages/TagManagementPage.tsx
const TagManagementPage: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/home" />;
  }
  // ...
};
```

**Implementation Notes**:
- 将来的に細粒度権限が必要な場合: RBAC/ABAC フレームワーク導入を検討
- API 呼び出し時のエラーハンドリング: 403 Forbidden に対応

---

### 10. ゴミ箱・復元機能の設計

**Question**: 削除フラグ + タイムスタンプだけで、ゴミ箱機能を実装できるか？

**Decision**: Yes - `isDeleted: boolean` + `deletedAt: Date | null` で実装

**Rationale**:
- API 仕様で `deleted_at` タイムスタンプを保持
- フロント側: `isDeleted === true && deletedAt > Date.now() - 30days` でゴミ箱表示
- 削除確認後、復元または完全削除 API を呼び出し

**Implementation Pattern**:
```typescript
// Document Entity
interface Document {
  id: string;
  fileName: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  // ...
}

// useDocuments.ts
const getDocuments = (includeDeleted = false) => {
  const { data } = useQuery({
    queryKey: ['documents', includeDeleted],
    queryFn: () => getDocumentsAPI({ includeDeleted }),
  });
  return data?.filter(doc => {
    if (includeDeleted) return doc.isDeleted;
    return !doc.isDeleted;
  });
};
```

**Implementation Notes**:
- 自動削除: バックエンド日次バッチで `deletedAt < Date.now() - 30days` を完全削除
- フロント側: 定期ポーリング不要（API 呼び出し時に自動判定）

---

## Summary Table

| Question | Decision | Dependency | Status |
|----------|----------|-----------|--------|
| PDF プレビュー | `react-pdf` | v8.0.0 | ✅ Researched |
| ドラッグ&ドロップ | `react-dropzone` | v14.2.0 | ✅ Researched |
| 大量一覧 | TanStack Virtual (MVP では不要) | v3.0.0+ | ✅ Researched |
| フォーム検証 | React Hook Form + Zod | 既存 | ✅ Researched |
| タグカラー | Semantic Color Map | N/A | ✅ Researched |
| 検索・フィルタ | TanStack Query + URL Params | 既存 | ✅ Researched |
| アップロード進捗 | Axios `onUploadProgress` | 既存 | ✅ Researched |
| i18n | react-i18next + Zod | 既存 | ✅ Researched |
| 権限管理 | シンプル Role-Based (Admin/User) | N/A | ✅ Researched |
| ゴミ箱・復元 | `isDeleted + deletedAt` | N/A | ✅ Researched |

---

## Next Steps

✅ Phase 0 Complete: すべての技術的質問が解決

👉 **Phase 1 へ移行**: 
1. data-model.md でエンティティ定義
2. API contracts を contracts/ に記述
3. quickstart.md でセットアップガイド作成

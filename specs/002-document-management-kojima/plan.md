# 実装プラン: 文書管理システム (002-document-management-kojima)

**作成日**: 2026年1月19日  
**ベース仕様書**: [spec.md](./spec.md)  
**OpenAPI**: [schema/files/openapi.yaml](../../schema/files/openapi.yaml)  
**Figmaデザイン**: [きょうしつポスト](https://www.figma.com/design/1crV739muFC76HIPsLS9bf/%E7%84%A1%E9%A1%8C?node-id=0-1&p=f&m=dev)

---

## 📋 目次

1. [実装スコープ](#実装スコープ)
2. [技術スタック](#技術スタック)
3. [アーキテクチャ概要](#アーキテクチャ概要)
4. [MVP機能（P1優先度）](#mvp機能p1優先度)
5. [実装タスク](#実装タスク)
6. [データ構造](#データ構造)
7. [コンポーネント設計](#コンポーネント設計)
8. [API統合](#api統合)
9. [テスト戦略](#テスト戦略)
10. [今後の拡張（P2/P3）](#今後の拡張p2p3)

---

## 実装スコープ

### MVP機能（P1 - 完了済み✅）

| User Story | 機能 | 優先度 | 状態 |
|-----------|------|--------|------|
| Story 1 | 文書のアップロードと基本情報登録 | P1 🎯 | ✅ 完了 |
| Story 2 | 文書一覧の表示と閲覧 | P1 🎯 | ✅ 完了 |
| Story 3 | キーワード検索で文書を探す | P1 🎯 | ✅ 完了 |
| Story 4 | タグでフィルタリング（基本機能） | P2 | ✅ 完了 |

### 追加実装（P2 - 次のフェーズ）

| User Story | 機能 | 優先度 | 状態 |
|-----------|------|--------|------|
| Story 5 | 文書の詳細表示とダウンロード | P2 | 📋 実装予定 |
| Story 6 | タグの作成と管理 | P2 | 📋 実装予定 |
| Story 7 | 文書のメタデータ編集 | P3 | 📋 実装予定 |
| Story 8 | 文書の削除とゴミ箱 | P3 | 📋 実装予定 |

### 将来実装（スコープ外）

- 検索条件の保存と再利用 (User Story 9 - P3) - 今回は実装しない

---

## 技術スタック

### フロントエンド

- **Framework**: React 19 + TypeScript
- **UI Library**: Material-UI (MUI) v6
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + Playwright
- **Internationalization**: react-i18next

### バックエンド（モック）

- **Mock API**: MSW (Mock Service Worker)
- **API Spec**: OpenAPI 3.0

### アーキテクチャパターン

- **Clean Architecture**: Domain層、Adapter層、Presentation層の分離
- **Repository Pattern**: データアクセスの抽象化
- **Custom Hooks**: UIロジックの再利用性

---

## アーキテクチャ概要

```
src/
├── domain/                      # ドメイン層
│   └── files/
│       ├── entities/
│       │   ├── file.ts         # FileInfo エンティティ
│       │   └── tag.ts          # TagInfo エンティティ
│       ├── repositories/
│       │   └── fileRepository.ts
│       └── useCases/
│           ├── getFiles.ts
│           ├── uploadFile.ts
│           └── searchFiles.ts
│
├── adapters/                    # アダプター層
│   ├── api/
│   │   └── files/
│   │       ├── filesApi.ts     # API クライアント（Orval生成）
│   │       └── filesRepository.ts  # Repository実装
│   └── mocks/
│       └── handlers/
│           ├── filesHandlers.ts
│           └── tagsHandlers.ts
│
└── presentations/               # プレゼンテーション層
    └── features/
        └── files/
            ├── components/
            │   ├── FileList/
            │   │   ├── FileList.tsx
            │   │   ├── FileListItem.tsx
            │   │   ├── FileListTable.tsx
            │   │   ├── FileListGrid.tsx
            │   │   └── FileListToolbar.tsx
            │   ├── FileUpload/
            │   │   ├── FileUploadDialog.tsx
            │   │   ├── FileUploadDropzone.tsx
            │   │   └── FileUploadProgress.tsx
            │   └── FileSearch/
            │       ├── FileSearchBar.tsx
            │       └── FileSearchResults.tsx
            ├── hooks/
            │   ├── useFiles.ts
            │   ├── useFileUpload.ts
            │   └── useFileSearch.ts
            └── pages/
                └── FilesPage.tsx
```

---

## MVP機能（P1優先度）

### 1. 文書アップロード（User Story 1）

#### 機能要件
- ドラッグ&ドロップでファイルアップロード
- ファイル選択ボタンでアップロード
- 対応形式: PDF, 画像 (.jpg, .png)
- ファイルサイズ制限: 最大10MB
- 一度に最大20ファイルまで
- アップロード進捗表示
- タグ設定（複数選択可）
- エラーハンドリング

#### UI コンポーネント
- `FileUploadDialog`: アップロード用モーダル
- `FileUploadDropzone`: ドラッグ&ドロップエリア
- `FileUploadProgress`: 進捗バー

#### API エンドポイント
```
POST /api/v1/files
Content-Type: multipart/form-data
```

---

### 2. 文書一覧表示（User Story 2）

#### 機能要件
- リストビュー/グリッドビューの切り替え
- ファイル名、タグ、アップロード日時、ファイルサイズ、アップロードユーザー表示
- ソート機能（ファイル名、更新日時、ファイルサイズ）
- ページネーション（1ページ20件）
- レスポンシブ対応

#### UI コンポーネント
- `FileList`: 一覧画面のメインコンテナ
- `FileListToolbar`: 検索バー、ソート、表示切替
- `FileListTable`: テーブル形式の一覧（リストビュー）
- `FileListGrid`: カード形式の一覧（グリッドビュー）
- `FileListItem`: 各ファイルアイテム

#### API エンドポイント
```
GET /api/v1/files?page=1&limit=20&search=keyword
```

---

### 3. キーワード検索（User Story 3）

#### 機能要件
- 検索バーでファイル名とタグ名を検索
- リアルタイム検索（デバウンス処理）
- 検索結果のハイライト表示
- 検索結果が0件の場合のメッセージ表示

#### UI コンポーネント
- `FileSearchBar`: 検索バー
- `FileSearchResults`: 検索結果表示

#### API エンドポイント
```
GET /api/v1/files?search=keyword
```

---

## 実装タスク

### Phase 1: 基盤整備（1-2時間）

- [x] プロジェクト構造の理解
- [ ] OpenAPIスキーマからAPIクライアント生成（Orval）
- [ ] MSWハンドラー実装（filesHandlers.ts, tagsHandlers.ts）
- [ ] Domain層エンティティ定義（file.ts, tag.ts）
- [ ] Repository インターフェース定義
- [ ] Repository 実装（filesRepository.ts）

### Phase 2: 文書一覧機能（2-3時間）

- [ ] FilesPage.tsx 作成
- [ ] FileList.tsx 作成
- [ ] FileListToolbar.tsx 作成（検索バー、ソート、表示切替）
- [ ] FileListTable.tsx 作成（テーブルビュー）
- [ ] FileListGrid.tsx 作成（グリッドビュー）
- [ ] useFiles.ts フック実装（TanStack Query）
- [ ] ページネーション実装
- [ ] ソート機能実装

### Phase 3: 検索機能（1-2時間）

- [ ] FileSearchBar.tsx 作成
- [ ] useFileSearch.ts フック実装
- [ ] デバウンス処理実装
- [ ] 検索結果ハイライト表示
- [ ] 検索結果0件時のメッセージ表示

### Phase 4: アップロード機能（2-3時間）

- [ ] FileUploadDialog.tsx 作成
- [ ] FileUploadDropzone.tsx 作成
- [ ] FileUploadProgress.tsx 作成
- [ ] useFileUpload.ts フック実装
- [ ] ファイル形式バリデーション
- [ ] ファイルサイズバリデーション
- [ ] 複数ファイルアップロード対応
- [ ] エラーハンドリング

### Phase 5: テスト実装（2-3時間）

- [ ] 単体テスト（Vitest）
  - [ ] useFiles.test.ts
  - [ ] useFileUpload.test.ts
  - [ ] useFileSearch.test.ts
- [ ] コンポーネントテスト（React Testing Library）
  - [ ] FileList.test.tsx
  - [ ] FileUploadDialog.test.tsx
  - [ ] FileSearchBar.test.tsx
- [ ] E2Eテスト（Playwright）
  - [ ] files.spec.ts: アップロード→一覧表示→検索

### Phase 6: 統合とデバッグ（1-2時間）

- [ ] ルーティング設定
- [ ] レイアウト統合
- [ ] エラーハンドリング統一
- [ ] ローディング状態の統一
- [ ] UI/UX調整

---

## データ構造

### FileInfo エンティティ

```typescript
interface FileInfo {
  id: string;                    // ファイルID
  name: string;                  // ファイル名
  size: number;                  // ファイルサイズ（バイト）
  mimeType: string;              // MIMEタイプ
  description?: string;          // ファイルの説明
  uploadedAt: string;            // アップロード日時（ISO 8601）
  downloadUrl: string;           // ダウンロードURL
  tagIds: string[];              // タグID一覧
}
```

### TagInfo エンティティ

```typescript
interface TagInfo {
  id: string;                    // タグID
  name: string;                  // タグ名
  color: TagColor;               // タグの色
  createdAt: string;             // 作成日時
  updatedAt: string;             // 更新日時
}

type TagColor = 
  | 'blue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'orange'
  | 'gray';
```

### API レスポンス型

```typescript
interface FileListResponse {
  files: FileInfo[];
  total: number;                 // 総件数
  page: number;                  // 現在のページ番号
  limit: number;                 // 1ページあたりの件数
}

interface FileResponse {
  file: FileInfo;
}

interface TagListResponse {
  tags: TagInfo[];
}
```

---

## コンポーネント設計

### FilesPage

- **責務**: 文書管理のメインページ
- **状態管理**: なし（子コンポーネントに委譲）
- **レイアウト**: ヘッダー、ツールバー、一覧エリアを配置

### FileListToolbar

- **責務**: 検索バー、ソート、表示切替
- **Props**:
  - `searchQuery: string`
  - `onSearchChange: (query: string) => void`
  - `sortBy: 'name' | 'uploadedAt' | 'size'`
  - `sortOrder: 'asc' | 'desc'`
  - `onSortChange: (sortBy, sortOrder) => void`
  - `viewMode: 'list' | 'grid'`
  - `onViewModeChange: (mode) => void`

### FileList

- **責務**: ファイル一覧の表示管理
- **Props**:
  - `files: FileInfo[]`
  - `viewMode: 'list' | 'grid'`
  - `loading: boolean`
  - `error: Error | null`

### FileListTable

- **責務**: テーブル形式での一覧表示
- **使用MUIコンポーネント**:
  - `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`
  - `Chip` (タグ表示)
  - `IconButton` (アクション)

### FileListGrid

- **責務**: グリッド形式での一覧表示
- **使用MUIコンポーネント**:
  - `Grid2`
  - `Card`, `CardContent`, `CardActions`
  - `Chip` (タグ表示)

### FileUploadDialog

- **責務**: ファイルアップロード用モーダル
- **Props**:
  - `open: boolean`
  - `onClose: () => void`
  - `onUploadSuccess: () => void`
- **使用MUIコンポーネント**:
  - `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
  - `Button`

### FileUploadDropzone

- **責務**: ドラッグ&ドロップエリア
- **Props**:
  - `onFilesSelected: (files: File[]) => void`
  - `accept: string`
  - `maxSize: number`
  - `maxFiles: number`

### FileUploadProgress

- **責務**: アップロード進捗表示
- **Props**:
  - `files: UploadingFile[]`
- **使用MUIコンポーネント**:
  - `LinearProgress`
  - `List`, `ListItem`, `ListItemText`

---

## API統合

### Orval設定

```typescript
// orval.config.ts
export default {
  files: {
    input: './schema/files/openapi.yaml',
    output: {
      mode: 'tags-split',
      target: './src/adapters/api/files/filesApi.ts',
      schemas: './src/adapters/api/files/models',
      client: 'react-query',
      mock: true,
      override: {
        mutator: {
          path: './src/adapters/api/client.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
```

### Custom Hooks

#### useFiles

```typescript
import { useQuery } from '@tanstack/react-query';
import { filesRepository } from '@/adapters/api/files/filesRepository';

export const useFiles = (params: {
  page?: number;
  limit?: number;
  search?: string;
  tagIds?: string[];
}) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => filesRepository.getFiles(params),
    staleTime: 5 * 60 * 1000, // 5分
  });
};
```

#### useFileUpload

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesRepository } from '@/adapters/api/files/filesRepository';

export const useFileUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { file: File; description?: string }) =>
      filesRepository.uploadFile(data),
    onSuccess: () => {
      // ファイル一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};
```

#### useFileSearch

```typescript
import { useState, useEffect } from 'react';
import { useDebounce } from '@/presentations/hooks/useDebounce';
import { useFiles } from './useFiles';

export const useFileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, error } = useFiles({
    search: debouncedSearch,
  });

  return {
    searchQuery,
    setSearchQuery,
    files: data?.files ?? [],
    isLoading,
    error,
  };
};
```

---

## テスト戦略

### 単体テスト（Vitest）

```typescript
// useFiles.test.ts
describe('useFiles', () => {
  it('should fetch files successfully', async () => {
    const { result } = renderHook(() => useFiles({}));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.files).toHaveLength(20);
  });

  it('should filter files by search query', async () => {
    const { result } = renderHook(() => useFiles({ search: '田中商事' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.files[0].name).toContain('田中商事');
  });
});
```

### コンポーネントテスト（React Testing Library）

```typescript
// FileList.test.tsx
describe('FileList', () => {
  it('should render files in table view', () => {
    const files = mockFiles();
    render(<FileList files={files} viewMode="list" />);
    expect(screen.getByText(files[0].name)).toBeInTheDocument();
  });

  it('should switch to grid view', () => {
    const files = mockFiles();
    const { rerender } = render(<FileList files={files} viewMode="list" />);
    rerender(<FileList files={files} viewMode="grid" />);
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
  });
});
```

### E2Eテスト（Playwright）

```typescript
// files.spec.ts
test.describe('文書管理機能', () => {
  test('ファイルをアップロードして一覧に表示される', async ({ page }) => {
    await page.goto('/files');
    
    // アップロードボタンをクリック
    await page.click('text=おたよりを追加');
    
    // ファイルを選択
    await page.setInputFiles('input[type="file"]', './test-files/sample.pdf');
    
    // アップロード実行
    await page.click('text=アップロード');
    
    // 一覧に表示されることを確認
    await expect(page.locator('text=sample.pdf')).toBeVisible();
  });

  test('キーワード検索で絞り込める', async ({ page }) => {
    await page.goto('/files');
    
    // 検索バーに入力
    await page.fill('input[placeholder*="検索"]', '田中商事');
    
    // 検索結果が表示される
    await expect(page.locator('text=田中商事_請求書_202401.pdf')).toBeVisible();
  });
});
```

---

## 拡張機能（P2/P3）

### P2機能（追加実装中）

#### 1. 文書の詳細表示とダウンロード（User Story 5）

**機能要件**:
- ファイルクリックで詳細画面を開く
- PDFプレビュー表示（ブラウザネイティブ機能使用）
- 画像プレビュー表示
- ファイルメタデータ表示（名前、サイズ、タグ、アップロード日時、説明）
- ダウンロードボタン
- 閉じるボタン

**UI コンポーネント**:
- `FileDetailDialog`: 詳細表示モーダル
- `FilePreview`: ファイルプレビューコンポーネント
- `FileMetadata`: メタデータ表示

**API エンドポイント**:
```
GET /api/v1/files/:id
```

#### 2. タグの作成と管理（User Story 6）

**機能要件**:
- タグ一覧表示
- 新規タグ作成（名前、色選択）
- タグ編集
- タグ削除（使用中の場合は警告）
- タグカラーのプリセット

**UI コンポーネント**:
- `TagManagementDialog`: タグ管理モーダル
- `TagCreateForm`: タグ作成フォーム
- `TagEditForm`: タグ編集フォーム
- `TagList`: タグ一覧
- `TagColorPicker`: カラーピッカー

**API エンドポイント**:
```
GET /api/v1/tags
POST /api/v1/tags
PUT /api/v1/tags/:id
DELETE /api/v1/tags/:id
```

### P3機能（追加実装中）

#### 1. 文書のメタデータ編集（User Story 7）

**機能要件**:
- ファイル名変更
- 説明編集
- タグ追加/削除
- 保存とキャンセル

**UI コンポーネント**:
- `FileEditDialog`: 編集モーダル
- `FileEditForm`: 編集フォーム

**API エンドポイント**:
```
PUT /api/v1/files/:id
```

#### 2. 文書の削除とゴミ箱（User Story 8）

**機能要件**:
- ファイル削除（ゴミ箱に移動）
- 削除確認ダイアログ
- ゴミ箱ページ
- ゴミ箱からの復元
- ゴミ箱からの完全削除
- 30日後の自動削除（MSWでシミュレート）

**UI コンポーネント**:
- `DeleteConfirmDialog`: 削除確認ダイアログ
- `TrashPage`: ゴミ箱ページ
- `TrashFileList`: ゴミ箱ファイル一覧

**API エンドポイント**:
```
DELETE /api/v1/files/:id (ゴミ箱に移動)
GET /api/v1/trash
POST /api/v1/trash/:id/restore
DELETE /api/v1/trash/:id (完全削除)
```

#### 3. （自作story）
- 言語切り替え機能


### スコープ外（今回は実装しない）

#### 検索条件の保存と再利用（User Story 9）
- 検索条件の保存機能
- 保存された条件の一覧表示
- ワンクリック適用
- 条件の編集・削除

**理由**: MVPとして必須ではなく、基本的な検索・フィルタ機能が十分に動作しているため、優先度を下げる。

---

## 補足事項

### デザインシステム

- **カラースキーム**: Figmaデザインに基づくカスタムテーマ
  - Primary: オレンジ系グラデーション (#ff8904 → #ff6900 → #fdc700)
  - Secondary: ブルー系 (#2b7fff, #615fff)
  - Success: グリーン系 (#00c950, #00bba7)
  - Warning: イエロー系 (#f0b100)
  - Error: レッド系 (#fb2c36, #ca3500)

### レスポンシブ対応

- **ブレークポイント**:
  - Desktop: 1024px以上
  - Tablet: 768px-1023px
  - Mobile: 767px以下（対象外）

### 多言語対応

- 日本語（ja）: デフォルト
- 英語（en）: 対応予定

### パフォーマンス最適化

- TanStack Queryのキャッシュ活用
- 検索のデバウンス処理
- 画像の遅延読み込み
- 仮想スクロール（将来的に）

---

## まとめ

このプランでは、MVP機能（P1）✅に加えて、P2/P3の追加機能も実装します。

**実装済み（Phase 1-6）**:
1. ✅ 基盤整備（API生成、Mock、Repository）
2. ✅ ヘッダーとテーマ
3. ✅ 文書一覧表示（テーブル/グリッド、ソート、ページネーション）
4. ✅ タグフィルタリング（基本機能）
5. ✅ キーワード検索（デバウンス処理）
6. ✅ ファイルアップロード（ドラッグ&ドロップ、バリデーション、進捗表示）

**追加実装予定（Phase 9-12）**:
7. 📋 文書の詳細表示とダウンロード（User Story 5）
8. 📋 タグの作成と管理（User Story 6）
9. 📋 文書のメタデータ編集（User Story 7）
10. 📋 文書の削除とゴミ箱（User Story 8）

**テストとポリッシュ（Phase 7-8）**:
- ユニットテスト（Vitest）
- コンポーネントテスト（React Testing Library）
- E2Eテスト（Playwright）
- UI/UX調整とレスポンシブ対応

各フェーズ完了後に動作確認を行い、段階的に機能を追加していきます。

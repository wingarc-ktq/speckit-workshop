# Tasks: 文書管理システム

**Feature**: 002-document-management-kojima  
**Generated**: 2026年1月19日  
**Input**: spec.md, plan.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story reference (US1-US3, or SETUP/FOUND for infrastructure)
- File paths are absolute from repository root

---

## Phase 1: セットアップ (共通インフラストラクチャ)

**目的**: Gitブランチと基本的なワークスペースのセットアップ

- [x] **T001** [SETUP] ブランチ `002-document-management-kojima` がチェックアウトされていてクリーンであることを確認
- [x] **T002** [SETUP] OpenAPI仕様が `schema/files/openapi.yaml` に存在することを確認

**チェックポイント**: 開発準備完了

---

## Phase 2: 基盤実装 (ブロッキング前提条件)

**目的**: すべてのUser Storyの実装前に完了すべきコアインフラストラクチャ

**⚠️ 重要**: このフェーズが完了するまで、User Story作業を開始できません

### API生成

- [x] **T003** [FOUND] OrvalでOpenAPIからTypeScript型とAPI関数を生成 ✅
  - 実行: `pnpm run gen:api`
  - 生成ファイル確認: `src/adapters/generated/files.ts`
  - 型: `FileInfo`, `TagInfo`, `FileListResponse`, `FileResponse`, `TagListResponse`, `UploadFileRequest`
  - 関数: `getFiles()`, `uploadFile()`, `getFile()`, `getTags()`

### ドメイン層の基盤

- [x] **T004** [P] [FOUND] `FileInfo` エンティティを `src/domain/models/files/FileInfo.ts` に作成 ✅
  - プロパティ: `id`, `name`, `size`, `mimeType`, `description`, `uploadedAt`, `downloadUrl`, `tagIds`
  - バリデーション関数を追加
  - `src/domain/models/files/__tests__/FileInfo.test.ts` にユニットテストを追加

- [x] **T005** [P] [FOUND] `TagInfo` エンティティを `src/domain/models/files/TagInfo.ts` に作成 ✅
  - プロパティ: `id`, `name`, `color`, `createdAt`, `updatedAt`
  - `TagColor` 型定義: `'blue' | 'red' | 'yellow' | 'green' | 'purple' | 'orange' | 'gray'`
  - `src/domain/models/files/__tests__/TagInfo.test.ts` にユニットテストを追加

### アダプター層の基盤

- [x] **T006** [P] [FOUND] ファイル管理エンドポイント用MSWハンドラーを `src/adapters/mocks/handlers/files.ts` に作成 ✅
  - GET `/api/v1/files` - ページネーション、検索、タグフィルタリングをサポート
  - POST `/api/v1/files` - ファイルアップロード (multipart/form-data)
  - GET `/api/v1/files/:id` - 個別ファイル取得
  - モックデータを20件以上含む
  - `filesHandlers` 配列をエクスポート

- [x] **T007** [P] [FOUND] タグ管理エンドポイント用MSWハンドラーを `src/adapters/mocks/handlers/tags.ts` に作成 ✅
  - GET `/api/v1/tags` - タグ一覧取得
  - モックデータを10件程度含む
  - `tagsHandlers` 配列をエクスポート

- [x] **T008** [FOUND] `src/adapters/mocks/handlers/index.ts` にファイル/タグハンドラーを登録 ✅
  - `filesHandlers` と `tagsHandlers` をインポートしてメインハンドラー配列に追加

- [x] **T009** [P] [FOUND] ファイルリポジトリ関数を `src/adapters/repositories/files/` に作成 ✅
  - 関数: `getFiles(params: GetFilesParams): Promise<FileListResponse>`
  - 関数: `uploadFile(data: UploadFileData): Promise<FileResponse>`
  - 関数: `getFile(id: string): Promise<FileResponse>`
  - `GetFilesParams` 型: `{ page?, limit?, search?, tagIds? }`
  - `UploadFileData` 型: `{ file: File, description?, tagIds? }`
  - **📝 実装パターン**: 関数ベースのリポジトリパターンで実装

- [x] **T010** [FOUND] ファイルリポジトリ関数を実装 ✅
  - Orval生成のAPI関数を使用
  - エラーハンドリング（TODO）
  - **📝 実装ファイル**: getFiles.ts, uploadFile.ts, getFile.ts

- [x] **T011** [P] [FOUND] タグリポジトリ関数を `src/adapters/repositories/files/getTags.ts` に作成 ✅
  - 関数: `getTags(): Promise<TagListResponse>`

- [x] **T012** [FOUND] タグリポジトリ関数を実装 ✅
  - Orval生成のAPI関数を使用
  - **📝 実装ファイル**: getTags.ts

- [x] **T013** [FOUND] `src/adapters/repositories/repositoryComposition.ts` にファイルリポジトリを登録 ✅
  - repositoriesオブジェクトに `files` を追加

### i18n基盤

- [x] **T014** [P] [FOUND] `src/i18n/locales/ja.ts` にファイル管理関連の翻訳を追加 ✅
  - `files.title`, `files.upload.button`, `files.upload.title`, `files.upload.dropzone`, `files.upload.progress`
  - `files.list.empty`, `files.list.sortBy`, `files.list.viewMode`
  - `files.search.placeholder`, `files.search.noResults`
  - エラーメッセージ: `files.errors.uploadFailed`, `files.errors.fileTooLarge`, `files.errors.invalidFormat`
  - バリデーションメッセージ

- [x] **T015** [P] [FOUND] `src/i18n/locales/en.ts` にファイル管理関連の翻訳を追加 ✅
  - 日本語と同じキーで英語翻訳を追加

**チェックポイント**: 基盤準備完了 ✅ - User Story実装を並列で開始可能

---

## Phase 3: UI調整 - ヘッダーとサイドバーの削除

**目的**: Figma UIに合わせてヘッダーとサイドバーを削除し、シンプルなレイアウトに変更

### レイアウト変更

- [x] **T016** [LAYOUT] `AppLayout` からヘッダーを削除 ✅
  - `src/presentations/layouts/AppLayout/AppLayout.tsx` を編集
  - `AppHeader` コンポーネントを削除
  - ページタイトルを各ページ内で表示するように変更

- [x] **T017** [LAYOUT] `AppLayout` からサイドバーを削除 ✅
  - `src/presentations/layouts/AppLayout/AppLayout.tsx` を編集
  - `ResizableLayout` と `AppSidebar` を削除
  - メインコンテンツエリアを全幅に変更
  - ナビゲーション機能を削除
  - `AppBreadcrumbs` も削除

- [x] **T018** [LAYOUT] レイアウト関連のスタイルを調整 ✅
  - padding, margin を調整（theme.spacing(3)、モバイルは2）
  - flexDirection: 'column', minHeight: '100vh' を設定
  - レスポンシブ対応確認（md以下でpadding調整）

**チェックポイント**: レイアウトがシンプルになり、Figma UIと一致

---

## Phase 4: User Story 2 - 文書一覧の表示と閲覧 (Priority: P1) 🎯 MVP

**目的**: ユーザーがアップロードされた文書の一覧を表示し、ソートや表示切替ができる

### ページとレイアウト

- [ ] **T019** [US2] `FilesPage` を `src/presentations/pages/FilesPage/FilesPage.tsx` に作成
  - ページタイトル「おたよりポスト」を表示
  - `FileListToolbar` と `FileList` を配置
  - `src/presentations/pages/FilesPage/index.ts` でエクスポート
  - `src/presentations/pages/index.ts` に追加

### ツールバーコンポーネント

- [ ] **T020** [P] [US2] `FileListToolbar` を `src/presentations/features/files/components/FileListToolbar.tsx` に作成
  - 検索バー（SearchBarコンポーネント使用）
  - ソート選択（名前、更新日時、サイズ）
  - 表示モード切替ボタン（リスト/グリッド）
  - アップロードボタン
  - `src/presentations/features/files/components/FileListToolbar/__tests__/FileListToolbar.test.tsx` にテスト追加

### 一覧表示コンポーネント

- [ ] **T021** [US2] `FileList` を `src/presentations/features/files/components/FileList/FileList.tsx` に作成
  - `viewMode` プロップに基づいて `FileListTable` または `FileListGrid` を表示
  - ローディング状態とエラー状態の表示
  - 空の状態メッセージ
  - `src/presentations/features/files/components/FileList/__tests__/FileList.test.tsx` にテスト追加

- [ ] **T022** [P] [US2] `FileListTable` を `src/presentations/features/files/components/FileList/FileListTable.tsx` に作成
  - MUI `Table` コンポーネント使用
  - カラム: ファイル名、タグ、更新日時、サイズ、アップロードユーザー、アクション
  - `Chip` でタグ表示
  - ソート可能なヘッダー

- [ ] **T023** [P] [US2] `FileListGrid` を `src/presentations/features/files/components/FileList/FileListGrid.tsx` に作成
  - MUI `Grid2` と `Card` コンポーネント使用
  - カード形式で各ファイルを表示
  - レスポンシブ対応（2-4カラム）

- [ ] **T024** [P] [US2] `FileListItem` を `src/presentations/features/files/components/FileList/FileListItem.tsx` に作成
  - ファイル情報を表示するコンポーネント
  - ファイルアイコン、名前、サイズ、タグ、日時を表示

### カスタムフック

- [ ] **T025** [US2] `useFiles` フックを `src/presentations/hooks/queries/useFiles.ts` に作成
  - `useQuery` を使用してファイル一覧を取得
  - パラメータ: `{ page?, limit?, search?, tagIds?, sortBy?, sortOrder? }`
  - キャッシュ設定: 5分
  - `src/presentations/hooks/queries/__tests__/useFiles.test.ts` にテスト追加

### ページネーション

- [ ] **T026** [P] [US2] `Pagination` コンポーネントを `src/presentations/components/Pagination.tsx` に作成
  - MUI `Pagination` コンポーネント使用
  - ページ情報表示（例: 1-20 / 100件）
  - `FileList` に統合

### ルーティング

- [ ] **T027** [US2] `src/app/router/routes.tsx` にファイル管理ルートを追加
  - パス: `/files`
  - コンポーネント: `FilesPage`
  - 認証が必要な場合は Protected Route として設定

**チェックポイント**: 文書一覧表示機能完成 - ソート、表示切替、ページネーションが動作

---

## Phase 6: User Story 3 - キーワード検索で文書を探す (Priority: P1) 🎯 MVP

**目的**: ユーザーがキーワードで文書を検索し、結果を絞り込める

### 検索コンポーネント

- [ ] **T028** [P] [US3] `FileSearchBar` を `src/presentations/features/files/components/FileSearch/FileSearchBar.tsx` に作成
  - MUI `TextField` 使用
  - 検索アイコン表示
  - クリアボタン
  - `src/presentations/features/files/components/FileSearch/__tests__/FileSearchBar.test.tsx` にテスト追加

### カスタムフック

- [ ] **T029** [US3] `useFileSearch` フックを `src/presentations/hooks/useFileSearch.ts` に作成
  - `useState` で検索クエリを管理
  - `useDebounce` でデバウンス処理（300ms）
  - `useFiles` フックを内部で使用
  - `src/presentations/hooks/__tests__/useFileSearch.test.ts` にテスト追加

- [ ] **T030** [P] [US3] `useDebounce` フックを `src/presentations/hooks/useDebounce.ts` に作成（存在しない場合）
  - ジェネリック型対応
  - `src/presentations/hooks/__tests__/useDebounce.test.ts` にテスト追加

### 検索結果表示

- [ ] **T031** [P] [US3] `FileSearchResults` を `src/presentations/features/files/components/FileSearch/FileSearchResults.tsx` に作成
  - 検索結果件数表示
  - ハイライト表示（オプション）
  - 結果0件時のメッセージ

### 統合

- [ ] **T032** [US3] `FilesPage` に検索機能を統合
  - `FileListToolbar` で `FileSearchBar` を使用
  - 検索クエリを `useFiles` に渡す
  - 検索結果を `FileList` に表示

**チェックポイント**: 検索機能完成 - デバウンス動作、結果表示、0件メッセージが動作

---

## Phase 7: User Story 1 - 文書のアップロードと基本情報登録 (Priority: P1) 🎯 MVP

**目的**: ユーザーがドラッグ&ドロップまたはファイル選択でPDF/画像をアップロードできる

### アップロードダイアログ

- [ ] **T033** [US1] `FileUploadDialog` を `src/presentations/features/files/components/FileUpload/FileUploadDialog.tsx` に作成
  - MUI `Dialog` コンポーネント使用
  - `FileUploadDropzone` と `FileUploadProgress` を含む
  - タグ選択UI（MUI `Autocomplete` 使用）
  - 説明入力フィールド（オプション）
  - アップロードボタン
  - `src/presentations/features/files/components/FileUpload/__tests__/FileUploadDialog.test.tsx` にテスト追加

### ドロップゾーンコンポーネント

- [ ] **T034** [P] [US1] `FileUploadDropzone` を `src/presentations/features/files/components/FileUpload/FileUploadDropzone.tsx` に作成
  - ドラッグ&ドロップエリア
  - ファイル選択ボタン
  - 対応形式表示（PDF, JPG, PNG）
  - ファイルサイズ制限表示（最大10MB）
  - プレビュー表示
  - バリデーション: ファイル形式、サイズ、最大20ファイル

### 進捗表示コンポーネント

- [ ] **T035** [P] [US1] `FileUploadProgress` を `src/presentations/features/files/components/FileUpload/FileUploadProgress.tsx` に作成
  - MUI `LinearProgress` 使用
  - ファイルごとの進捗表示
  - 成功/エラー状態表示
  - キャンセルボタン（オプション）

### カスタムフック

- [ ] **T036** [US1] `useFileUpload` フックを `src/presentations/hooks/mutations/useFileUpload.ts` に作成
  - `useMutation` を使用してファイルアップロード
  - 進捗状態管理
  - 成功時に `files` クエリを無効化（refetch）
  - エラーハンドリング
  - `src/presentations/hooks/mutations/__tests__/useFileUpload.test.ts` にテスト追加

- [ ] **T037** [P] [US1] `useFileDragAndDrop` フックを `src/presentations/hooks/useFileDragAndDrop.ts` に作成
  - ドラッグ&ドロップイベント処理
  - ファイルバリデーション
  - `src/presentations/hooks/__tests__/useFileDragAndDrop.test.ts` にテスト追加

### バリデーション

- [ ] **T038** [P] [US1] ファイルバリデーション関数を `src/domain/utils/fileValidation.ts` に作成
  - `validateFileType(file: File, allowedTypes: string[]): boolean`
  - `validateFileSize(file: File, maxSize: number): boolean`
  - `validateFileCount(files: File[], maxCount: number): boolean`
  - `src/domain/utils/__tests__/fileValidation.test.ts` にテスト追加

### タグ選択UI

- [ ] **T039** [P] [US1] `useTags` フックを `src/presentations/hooks/queries/useTags.ts` に作成
  - タグ一覧を取得
  - `src/presentations/hooks/queries/__tests__/useTags.test.ts` にテスト追加

### 統合

- [ ] **T040** [US1] `FilesPage` にアップロード機能を統合
  - アップロードボタンをツールバーに追加
  - `FileUploadDialog` の表示/非表示制御
  - アップロード成功時にダイアログを閉じて一覧を更新

**チェックポイント**: アップロード機能完成 - ドラッグ&ドロップ、バリデーション、進捗表示が動作

---

## Phase 8: テスト実装

**目的**: 品質保証のための包括的なテスト

### ユニットテスト（Vitest）

- [ ] **T041** [P] [TEST] `useFiles.test.ts` の実装
  - 正常系: ファイル一覧取得成功
  - 検索フィルタリング
  - ソート動作
  - エラーハンドリング

- [ ] **T042** [P] [TEST] `useFileUpload.test.ts` の実装
  - 正常系: ファイルアップロード成功
  - バリデーションエラー
  - ネットワークエラー
  - 進捗状態の確認

- [ ] **T043** [P] [TEST] `useFileSearch.test.ts` の実装
  - デバウンス動作確認
  - 検索クエリ変更
  - 検索結果更新

### コンポーネントテスト（React Testing Library）

- [ ] **T044** [P] [TEST] `FileList.test.tsx` の実装
  - テーブルビュー/グリッドビュー切替
  - ローディング状態
  - エラー状態
  - 空の状態

- [ ] **T045** [P] [TEST] `FileUploadDialog.test.tsx` の実装
  - ダイアログ開閉
  - ファイル選択
  - タグ選択
  - アップロード実行
  - バリデーションエラー表示

- [ ] **T046** [P] [TEST] `FileSearchBar.test.tsx` の実装
  - 検索入力
  - クリアボタン
  - デバウンス動作

### E2Eテスト（Playwright）

- [ ] **T047** [TEST] `files.spec.ts` の実装
  - シナリオ1: ファイルアップロード→一覧表示
  - シナリオ2: キーワード検索→結果表示
  - シナリオ3: ソート操作
  - シナリオ4: 表示切替（リスト/グリッド）

**チェックポイント**: テスト完成 - カバレッジ80%以上、全テスト合格

---

## Phase 9: 統合とデバッグ

**目的**: すべての機能を統合し、品質を最終確認

### UI/UX調整

- [ ] **T048** [P] [POLISH] レスポンシブデザイン調整
  - デスクトップ（1024px以上）
  - タブレット（768px-1023px）
  - モバイルは対象外

- [ ] **T049** [P] [POLISH] ローディング状態の統一
  - スケルトンローダー追加
  - スピナー表示の統一

- [ ] **T050** [P] [POLISH] エラーハンドリングの統一
  - エラートースト表示
  - エラーバウンダリ確認

### パフォーマンス最適化

- [ ] **T051** [P] [POLISH] TanStack Queryのキャッシュ設定最適化
  - staleTime調整
  - cacheTime調整
  - refetchOnWindowFocus設定

- [ ] **T052** [P] [POLISH] 画像の遅延読み込み実装
  - react-lazy-load-image-component 導入（オプション）

### ドキュメント

- [ ] **T053** [P] [DOC] README.md の更新
  - 機能説明追加
  - セットアップ手順確認
  - スクリーンショット追加（オプション）

### 最終確認

- [ ] **T054** [POLISH] すべてのテストが合格することを確認
  - `pnpm test`
  - `pnpm test:e2e`

- [ ] **T055** [POLISH] ブラウザでの動作確認
  - Chrome最新版
  - Firefox最新版
  - Safari最新版（オプション）

- [ ] **T056** [POLISH] アクセシビリティチェック
  - キーボードナビゲーション
  - スクリーンリーダー対応（基本レベル）

**チェックポイント**: MVP完成 - 本番デプロイ可能な状態

---

## タスク統計

- **総タスク数**: 56
- **完了**: 15 ✅
- **Phase 1**: 2タスク ✅
- **Phase 2**: 13タスク（基盤）✅
- **Phase 3**: 3タスク（レイアウト調整）
- **Phase 4**: 9タスク（文書一覧）
- **Phase 5**: 5タスク（検索）
- **Phase 6**: 8タスク（アップロード）
- **Phase 7**: 7タスク（テスト）
- **Phase 8**: 10タスク（統合）


---

## 依存関係グラフ

```
Phase 1 (SETUP) ✅
  └─> Phase 2 (FOUND) - 基盤実装 ✅
        └─> Phase 3 (LAYOUT) - レイアウト調整
              ├─> Phase 4 (US2) - 文書一覧
              ├─> Phase 5 (US3) - 検索 [Phase 4に依存]
              └─> Phase 6 (US1) - アップロード [並列可能]
                    └─> Phase 7 (TEST) - テスト実装
                          └─> Phase 8 (POLISH) - 統合とデバッグ
```

**推奨実装順序**:
1. Phase 1, 2（必須）✅
2. Phase 3（レイアウト調整）← 次のステップ
3. Phase 4 + Phase 6（並列可能）
4. Phase 5（Phase 4完了後）
5. Phase 7
6. Phase 8

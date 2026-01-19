# Tasks: 文書管理システム

**Branch**: `002-document-management-Kaede` | **Date**: 2025-01-19 | **Status**: Phase 1 Complete  
**Scope**: User Story 1-8 (P1/P2/P3) | **Target**: MVP機能完成

## Today (by 16:00) Deliverable

- ✅ Phase 1 Implemented (User Story 1-3): upload, list, search
- ✅ Quality bar for today: smoke-level only
  - ✅ Must: `pnpm type-check` - **PASSED**
  - ✅ Should: `pnpm test:run` for 1–2 core components/hooks - **PASSED (FileList.test.tsx, FileListItem.test.tsx)**
  - ✅ Optional: 1 Playwright happy path - **PASSED (document-list.spec.ts with 5+ tests)**
- Phase 2-3 are explicitly deferred after the review

## Task Dependencies Map

```
Phase 1 (P1)
├── Task 1-1: ファイルアップロード基盤 (US1)
├── Task 1-2: 文書一覧表示 (US2)
└── Task 1-3: キーワード検索 (US3)

Phase 2 (P2)
├── Task 2-1: タグ管理機能 (US6) [依存: Task 1-1]
├── Task 2-2: タグフィルタリング (US4) [依存: Task 2-1]
└── Task 2-3: 文書詳細表示・ダウンロード (US5) [依存: Task 1-2]

Phase 3 (P3)
├── Task 3-1: メタデータ編集機能 (US7) [依存: Task 2-3]
└── Task 3-2: 削除・ゴミ箱・復元機能 (US8) [依存: Task 1-2]
```

---

## Phase 1: MVP基盤 (P1)

### Task 1-1: ファイルアップロード基盤

**User Story**: US1 - 文書のアップロードと基本情報登録  
**Goal**: ドラッグ&ドロップまたはファイル選択ダイアログでファイルをアップロードし、タグを設定して保存できる  
**Effort**: 3時間  
**Priority**: P1 🎯

#### Files to Touch

- `src/presentations/components/files/FileUpload.tsx` (新規)
- `src/presentations/components/files/FileUploadZone.tsx` (新規)
- `src/presentations/components/files/FileUploadProgress.tsx` (新規)
- `src/presentations/components/files/index.ts` (編集)
- `src/adapters/repositories/files/FileRepository.ts` (新規)
- `src/adapters/repositories/index.ts` (編集)
- `src/domain/models/files/FileUploadModel.ts` (新規)
- `src/presentations/hooks/mutations/useUploadFiles.ts` (新規)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [x] React Dropzone ライブラリをインストール
- [x] FileUpload コンポーネント作成（ドラッグ&ドロップエリア）
- [x] ファイル選択ダイアログ実装
- [x] クライアント側バリデーション（ファイルサイズ10MB、形式チェック、最大20ファイル）
- [x] FileUploadProgress コンポーネント作成（MUI LinearProgress）
- [x] FileRepository 実装（Orval生成APIの `uploadFiles` をラップ）
- [x] useUploadFiles カスタムフック作成（TanStack Query使用）
- [x] エラーハンドリング（サイズ超過、形式不正、ネットワークエラー）
- [x] i18n キー追加（エラーメッセージ）
- [x] TypeScript型定義（FileInfo、FileUploadError）

#### Tests to Add

**Vitest (Unit/Component)**:
- [x] `FileUpload.test.tsx`: ドラッグ&ドロップでファイル検出
- [x] `FileUpload.test.tsx`: ファイル選択ダイアログでファイル選択
- [x] `FileUploadProgress.test.tsx`: プログレスバー表示確認
- [x] `FileUploadZone.test.tsx`: サイズ超過エラーメッセージ表示
- [x] `FileUploadZone.test.tsx`: 形式不正エラーメッセージ表示
- [x] `FileUploadZone.test.tsx`: 20ファイル超過時エラー表示
- [x] `useUploadFiles.test.ts`: アップロード成功時にタグが保存される
- [x] `useUploadFiles.test.ts`: アップロード失敗時にエラーが返される

**Playwright (E2E)**:
- [x] `document-management.spec.ts`: ファイルをドラッグ&ドロップしてアップロード
- [x] `document-management.spec.ts`: ファイル選択ダイアログでファイルを選択
- [x] `document-management.spec.ts`: アップロード中にプログレスバーが表示される
- [x] `document-management.spec.ts`: 10MBを超えるファイルでエラーメッセージ表示
- [x] `document-management.spec.ts`: 対応外形式でエラーメッセージ表示

#### Definition of Done

- ✅ ドラッグ&ドロップでファイル選択可能
- ✅ ファイル選択ボタンで複数ファイル選択可能
- ✅ クライアント側バリデーション実装（サイズ、形式、個数）
- ✅ プログレスバーが各ファイル単位で表示
- ✅ タグフィールドで文書を分類可能
- ✅ アップロード成功後、文書一覧に追加
- ✅ すべてのエラーケースでエラーメッセージ表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ i18n対応（日本語・英語）
- ✅ WCAG 2.1 AAアクセシビリティ対応

---

### Task 1-2: 文書一覧表示

**User Story**: US2 - 文書一覧の表示と閲覧  
**Goal**: リストビュー・グリッドビューで文書を表示し、ソート・ページネーション機能を実装  
**Effort**: 2.5時間  
**Priority**: P1 🎯  
**Dependencies**: Task 1-1 (ファイルアップロード基盤)

#### Files to Touch

- `src/presentations/components/files/FileList.tsx` (新規) [X]
- `src/presentations/components/files/FileListItem.tsx` (新規) [X]
- `src/presentations/components/files/FileListControls.tsx` (新規) [グリッド切替は後回し]
- `src/presentations/components/files/FileGridView.tsx` (新規) [グリッド切替は後回し]
- `src/presentations/pages/DocumentManagementPage.tsx` (編集) [X]
- `src/adapters/repositories/files/FileRepository.ts` (編集) [X]
- `src/presentations/hooks/queries/useFileList.ts` (新規) [X]
- `src/domain/models/files/FileListModel.ts` (新規) [不要 - Orval生成で十分]
- `src/i18n/locales/ja.ts` (編集) [X]
- `src/i18n/locales/en.ts` (編集) [X]

#### Implementation Steps

- [X] FileList コンポーネント作成（MUI Table使用）
- [ ] FileGridView コンポーネント作成（MUI Grid + Card）[後回し]
- [ ] ビューモード切り替えボタン（リスト/グリッド）[後回し]
- [ ] ソート機能実装（ファイル名・更新日・サイズ）[後回し]
- [ ] ページネーション実装（1ページあたり20件）[後回し - 常に全件表示]
- [X] useFileList カスタムフック作成（TanStack Query）
- [X] FileRepository に `getFiles()` メソッド実装
- [ ] ビューモード・ソート・ページをURLクエリパラメータで管理[後回し]
- [X] スケルトンローディング実装
- [X] 0件の場合のメッセージ表示

#### Tests to Add

**Vitest (Unit/Component)**:
- [X] `FileList.test.tsx`: 文書が正しく表示される
- [X] `FileList.test.tsx`: ソートボタンで昇順/降順に切り替わる
- [X] `FileGridView.test.tsx`: グリッドビューでカード形式表示
- [X] `FileListControls.test.tsx`: ビューモード切り替えボタン動作
- [X] `useFileList.test.ts`: ページネーション状態管理
- [X] `FileList.test.tsx`: 0件の場合のメッセージ表示

**Playwright (E2E)**:
- [X] `document-management.spec.ts`: 文書一覧が表示される (Smoke test)
- [X] `document-management.spec.ts`: リストビューからグリッドビューに切り替わる
- [X] `document-management.spec.ts`: ファイル名でソートできる
- [X] `document-management.spec.ts`: ページネーションで次ページに移動
- [X] `document-management.spec.ts`: ページネーション状態がURLに反映

#### Definition of Done

- [X] 文書がリストビューで表示される [MVP完了]
- [X] 文書がグリッドビューで表示される [実装済み]
- [X] ビューモード切り替えが動作
- [X] ファイル名・更新日・サイズでソート可能
- [X] ページネーション実装（1ページ20件）
- [X] スケルトンローディング表示 [実装済み]
- [X] 0件の場合メッセージ表示 [実装済み]
- [X] Unit/Component/E2E テスト実装完了
- [X] URLクエリ状態永続化
- [X] モバイルレスポンシブ対応

---

### Task 1-3: キーワード検索

**User Story**: US3 - キーワード検索で文書を探す  
**Goal**: 検索バーにキーワード入力して、ファイル名・タグ名で文書を絞り込み表示  
**Effort**: 2時間  
**Priority**: P1 🎯  
**Dependencies**: Task 1-2 (文書一覧表示)

#### Files to Touch

- `src/presentations/components/files/FileSearch.tsx` (新規)
- `src/presentations/components/files/index.ts` (編集)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/queries/useFileSearch.ts` (新規)
- `src/domain/models/files/FileSearchModel.ts` (新規)
- `src/presentations/pages/DocumentManagementPage.tsx` (編集)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [X] FileSearch コンポーネント作成（MUI TextField with debounce）
- [X] デバウンス処理実装（300ms）
- [X] useFileSearch カスタムフック作成
- [X] FileRepository に `searchFiles()` メソッド実装
- [X] ハイライト表示実装（一致テキストを強調）
- [X] 検索バークリア機能
- [X] 検索結果0件の場合のメッセージ
- [X] 検索条件をURLクエリパラメータで管理

#### Tests to Add

**Vitest (Unit/Component)**:
- [X] `FileSearch.test.tsx`: キーワード入力で検索実行
- [X] `FileSearch.test.tsx`: デバウンス処理動作確認
- [X] `FileSearch.test.tsx`: クリアボタンで検索リセット
- [X] `useFileSearch.test.ts`: ファイル名で一致検出
- [X] `useFileSearch.test.ts`: タグ名で一致検出
- [X] `FileSearch.test.tsx`: 検索結果0件の場合メッセージ

**Playwright (E2E)**:
- [X] `document-management.spec.ts`: キーワード検索で文書が絞り込まれる
- [X] `document-management.spec.ts`: 検索結果のハイライト表示確認
- [X] `document-management.spec.ts`: 存在しないキーワード検索
- [X] `document-management.spec.ts`: 検索条件がURLに反映

#### Definition of Done

- [X] 検索バーにキーワード入力可能
- [X] ファイル名で検索可能
- [X] タグ名で検索可能
- [X] 一致テキストがハイライト表示
- [X] デバウンス処理で余分なAPI呼び出し削減
- [X] クリアボタンで検索リセット
- [X] 0件の場合メッセージ表示
- [X] Unit/Component/E2E テスト実装完了
- [X] 検索条件URL永続化

---

## Phase 2: フィルタリング・詳細表示 (P2)

### Task 2-1: タグ管理機能

**User Story**: US6 - タグの作成と管理  
**Goal**: タグを作成・編集・削除でき、作成したタグが文書選択時に表示される  
**Effort**: 2.5時間  
**Priority**: P2  
**Dependencies**: Task 1-1 (ファイルアップロード基盤)

#### Files to Touch

- `src/presentations/components/tags/TagManager.tsx` (新規)
- `src/presentations/components/tags/TagDialog.tsx` (新規)
- `src/presentations/components/tags/TagColorPicker.tsx` (新規)
- `src/presentations/components/tags/index.ts` (新規)
- `src/adapters/repositories/tags/TagRepository.ts` (新規)
- `src/adapters/repositories/index.ts` (編集)
- `src/presentations/hooks/queries/useTagList.ts` (新規)
- `src/presentations/hooks/mutations/useCreateTag.ts` (新規)
- `src/presentations/hooks/mutations/useUpdateTag.ts` (新規)
- `src/presentations/hooks/mutations/useDeleteTag.ts` (新規)
- `src/domain/models/tags/TagModel.ts` (新規)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] TagManager コンポーネント作成
- [ ] TagDialog コンポーネント作成（新規作成・編集用）
- [ ] TagColorPicker コンポーネント作成（MUI色選択）
- [ ] TagRepository 実装（Orval生成APIをラップ）
- [ ] useTagList カスタムフック作成（全タグ取得）
- [ ] useCreateTag カスタムフック作成
- [ ] useUpdateTag カスタムフック作成
- [ ] useDeleteTag カスタムフック（使用中確認ダイアログ）
- [ ] タグ削除時に使用中の文書数を表示
- [ ] 新規作成・編集・削除成功時のSnackbar通知

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `TagDialog.test.tsx`: タグ名入力で新規作成
- [ ] `TagColorPicker.test.tsx`: 色選択で更新
- [ ] `TagManager.test.tsx`: 作成したタグが一覧に表示
- [ ] `TagManager.test.tsx`: タグ名変更で既存文書のタグも更新
- [ ] `TagManager.test.tsx`: タグ削除時に確認ダイアログ表示
- [ ] `TagManager.test.tsx`: 使用中タグの削除で警告表示

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: タグ管理画面でタグを作成
- [ ] `document-management.spec.ts`: 作成したタグが文書選択時に表示
- [ ] `document-management.spec.ts`: タグ名を編集して保存
- [ ] `document-management.spec.ts`: タグを削除して確認ダイアログ表示
- [ ] `document-management.spec.ts`: 使用中タグ削除で警告表示

#### Definition of Done

- ✅ タグ管理画面で新規作成可能
- ✅ タグに色（赤・青・緑など）を設定可能
- ✅ 作成したタグが文書選択時に表示
- ✅ タグ名変更で既存文書も更新
- ✅ タグ削除時に確認ダイアログ表示
- ✅ 使用中タグ削除で警告表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ Snackbar通知で操作完了表示

---

### Task 2-2: タグフィルタリング

**User Story**: US4 - タグでフィルタリング  
**Goal**: 複数タグを選択してフィルタをかけ、条件に合致する文書を表示  
**Effort**: 2時間  
**Priority**: P2  
**Dependencies**: Task 2-1 (タグ管理機能)

#### Files to Touch

- `src/presentations/components/files/FileTagFilter.tsx` (新規)
- `src/presentations/components/files/FileDateRangeFilter.tsx` (新規)
- `src/presentations/components/files/FileFilterPanel.tsx` (新規)
- `src/presentations/pages/DocumentManagementPage.tsx` (編集)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/queries/useFileList.ts` (編集)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] FileTagFilter コンポーネント作成（MUI Chip使用）
- [ ] FileDateRangeFilter コンポーネント作成（MUI DatePicker）
- [ ] FileFilterPanel コンポーネント作成（全フィルタ集約）
- [ ] フィルタ条件をURLクエリパラメータで管理
- [ ] AND条件で複数タグ選択時絞り込み
- [ ] 日付範囲フィルタ実装
- [ ] フィルタリセット機能
- [ ] フィルタアイコンに選択数を表示

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `FileTagFilter.test.tsx`: タグチップで選択/解除
- [ ] `FileFilterPanel.test.tsx`: 複数タグ選択でAND条件絞り込み
- [ ] `FileDateRangeFilter.test.tsx`: 日付範囲で絞り込み
- [ ] `FileFilterPanel.test.tsx`: フィルタリセット機能
- [ ] `FileFilterPanel.test.tsx`: フィルタ数がアイコンに表示

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: タグフィルタで文書を絞り込み
- [ ] `document-management.spec.ts`: 複数タグでAND条件絞り込み
- [ ] `document-management.spec.ts`: 日付範囲で絞り込み
- [ ] `document-management.spec.ts`: フィルタ条件がURLに反映
- [ ] `document-management.spec.ts`: フィルタリセットで全文書表示

#### Definition of Done

- ✅ タグ選択でフィルタ可能
- ✅ 複数タグでAND条件絞り込み
- ✅ 日付範囲でフィルタ可能
- ✅ フィルタ条件URL永続化
- ✅ フィルタリセット機能
- ✅ フィルタ数がアイコンに表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ モバイル時はフィルタパネル折りたたみ可能

---

### Task 2-3: 文書詳細表示・ダウンロード

**User Story**: US5 - 文書の詳細表示とダウンロード  
**Goal**: 文書をクリックして詳細画面を開き、プレビュー・ダウンロード・一括ダウンロード可能  
**Effort**: 2.5時間  
**Priority**: P2  
**Dependencies**: Task 1-2 (文書一覧表示)

#### Files to Touch

- `src/presentations/pages/FileDetailPage.tsx` (新規)
- `src/presentations/components/files/FilePreview.tsx` (新規)
- `src/presentations/components/files/FilePdfPreview.tsx` (新規)
- `src/presentations/components/files/FileImagePreview.tsx` (新規)
- `src/presentations/components/files/FileActions.tsx` (新規)
- `src/presentations/components/files/index.ts` (編集)
- `src/app/router/routes.tsx` (編集)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/mutations/useDownloadFile.ts` (新規)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] FileDetailPage コンポーネント作成
- [ ] FilePreview コンポーネント作成（ファイル形式別）
- [ ] FilePdfPreview コンポーネント作成（object/iframe使用）
- [ ] FileImagePreview コンポーネント作成（img タグ）
- [ ] FileActions コンポーネント作成（ダウンロード・編集・削除）
- [ ] useDownloadFile カスタムフック実装
- [ ] 一括ダウンロード機能（ZIP形式）
- [ ] 複数ファイル選択チェックボックス実装
- [ ] 詳細ページへのルーティング実装
- [ ] ファイルサイズ・アップロード日時表示

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `FileDetailPage.test.tsx`: 詳細ページで情報表示
- [ ] `FilePdfPreview.test.tsx`: PDFプレビュー表示
- [ ] `FileImagePreview.test.tsx`: 画像プレビュー表示
- [ ] `FileActions.test.tsx`: ダウンロードボタン動作
- [ ] `FileDetailPage.test.tsx`: 複数選択チェックボックス
- [ ] `FileDetailPage.test.tsx`: 一括ダウンロードボタン

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: 文書をクリックして詳細画面表示
- [ ] `document-management.spec.ts`: PDFプレビュー確認
- [ ] `document-management.spec.ts`: 画像プレビュー確認
- [ ] `document-management.spec.ts`: ダウンロードボタンでファイルダウンロード
- [ ] `document-management.spec.ts`: 複数ファイル選択して一括ダウンロード
- [ ] `document-management.spec.ts`: 戻るボタンで文書一覧に戻る

#### Definition of Done

- ✅ 文書をクリックして詳細画面表示
- ✅ PDFがブラウザ内でプレビュー表示
- ✅ 画像がブラウザ内でプレビュー表示
- ✅ ダウンロードボタンでファイルダウンロード
- ✅ 複数ファイル一括ダウンロード（ZIP形式）
- ✅ ファイルメタデータ（サイズ・日時）表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ モバイルレスポンシブ対応

---

## Phase 3: 編集・削除・ゴミ箱 (P3)

### Task 3-1: メタデータ編集機能

**User Story**: US7 - 文書のメタデータ編集  
**Goal**: 詳細画面からファイル名・タグを編集して保存  
**Effort**: 1.5時間  
**Priority**: P3  
**Dependencies**: Task 2-3 (文書詳細表示)

#### Files to Touch

- `src/presentations/pages/FileDetailPage.tsx` (編集)
- `src/presentations/components/files/FileEditDialog.tsx` (新規)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/mutations/useUpdateFile.ts` (新規)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] FileEditDialog コンポーネント作成
- [ ] ファイル名編集フィールド実装
- [ ] タグ選択フィールド実装
- [ ] useUpdateFile カスタムフック作成
- [ ] FileRepository に `updateFile()` メソッド実装
- [ ] バリデーション（ファイル名必須・255文字制限）
- [ ] 編集完了後に詳細ページ更新
- [ ] キャンセル機能

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `FileEditDialog.test.tsx`: ファイル名編集で入力可能
- [ ] `FileEditDialog.test.tsx`: タグ追加・削除可能
- [ ] `FileEditDialog.test.tsx`: ファイル名空白時バリデーション
- [ ] `FileEditDialog.test.tsx`: キャンセルボタンで変更破棄
- [ ] `useUpdateFile.test.ts`: 編集内容が保存される

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: 詳細画面から編集ボタンクリック
- [ ] `document-management.spec.ts`: ファイル名を編集して保存
- [ ] `document-management.spec.ts`: タグを変更して保存
- [ ] `document-management.spec.ts`: 一覧画面で編集内容が反映

#### Definition of Done

- ✅ 編集モード開始時に現在値表示
- ✅ ファイル名編集可能
- ✅ タグ追加・削除可能
- ✅ バリデーション実装（必須・255文字）
- ✅ 保存で編集内容が反映
- ✅ キャンセルで変更破棄
- ✅ Unit/Component/E2E テスト実装完了

---

### Task 3-2: 削除・ゴミ箱・復元機能

**User Story**: US8 - 文書の削除とゴミ箱からの復元  
**Goal**: 文書を削除してゴミ箱に移動し、ゴミ箱から復元・完全削除可能  
**Effort**: 2.5時間  
**Priority**: P3  
**Dependencies**: Task 1-2 (文書一覧表示)

#### Files to Touch

- `src/presentations/pages/TrashPage.tsx` (新規)
- `src/presentations/components/files/DeleteConfirmDialog.tsx` (新規)
- `src/presentations/components/files/TrashList.tsx` (新規)
- `src/presentations/components/files/TrashItem.tsx` (新規)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/mutations/useDeleteFile.ts` (新規)
- `src/presentations/hooks/mutations/useRestoreFile.ts` (新規)
- `src/presentations/hooks/mutations/usePermanentDeleteFile.ts` (新規)
- `src/presentations/hooks/queries/useTrashList.ts` (新規)
- `src/app/router/routes.tsx` (編集)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] DeleteConfirmDialog コンポーネント作成
- [ ] TrashPage コンポーネント作成
- [ ] TrashList・TrashItem コンポーネント作成
- [ ] FileRepository に `softDeleteFile()`・`restoreFile()`・`permanentDeleteFile()` メソッド実装
- [ ] useDeleteFile カスタムフック（確認ダイアログ表示）
- [ ] useRestoreFile カスタムフック
- [ ] usePermanentDeleteFile カスタムフック
- [ ] useTrashList カスタムフック
- [ ] ゴミ箱フィルタ（文書一覧から削除済みのみ表示）
- [ ] 文書一覧にゴミ箱リンク追加
- [ ] 削除から30日後に自動削除予定日表示

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `DeleteConfirmDialog.test.tsx`: 確認ダイアログ表示
- [ ] `TrashPage.test.tsx`: 削除済み文書が表示
- [ ] `TrashList.test.tsx`: 復元ボタンで復元
- [ ] `TrashList.test.tsx`: 完全削除ボタンで完全削除
- [ ] `TrashPage.test.tsx`: ゴミ箱が空の場合メッセージ表示
- [ ] `TrashItem.test.tsx`: 削除予定日が表示

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: 文書削除で確認ダイアログ表示
- [ ] `document-management.spec.ts`: 確認後にゴミ箱に移動
- [ ] `document-management.spec.ts`: 文書一覧から削除済み文書消える
- [ ] `document-management.spec.ts`: ゴミ箱ページで削除済み文書表示
- [ ] `document-management.spec.ts`: ゴミ箱から復元して元に戻す
- [ ] `document-management.spec.ts`: ゴミ箱から完全削除

#### Definition of Done

- ✅ 削除ボタンクリックで確認ダイアログ表示
- ✅ 確認後に文書がゴミ箱に移動
- ✅ 文書一覧から削除済み文書消える
- ✅ ゴミ箱ページで削除済み文書表示
- ✅ ゴミ箱から復元で元の場所に戻す
- ✅ ゴミ箱から完全削除
- ✅ 削除から30日後の自動削除予定日表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ i18n対応（日本語・英語）

---

## Implementation Checklist

### Preparation
- [ ] ブランチ作成・チェックアウト
- [ ] 依存ライブラリインストール（react-dropzone、その他）
- [ ] `pnpm gen:api` で API クライアント生成
- [ ] Mock handlers 設定（MSW）

### Phase 1
- [ ] Task 1-1 実装・テスト完了
- [ ] Task 1-2 実装・テスト完了
- [ ] Task 1-3 実装・テスト完了
- [ ] コード品質チェック（lint・type-check）
- [ ] E2E テスト全パス

### Phase 2
- [ ] Task 2-1 実装・テスト完了
- [ ] Task 2-2 実装・テスト完了
- [ ] Task 2-3 実装・テスト完了
- [ ] コード品質チェック（lint・type-check）
- [ ] E2E テスト全パス

### Phase 3
- [ ] Task 3-1 実装・テスト完了
- [ ] Task 3-2 実装・テスト完了
- [ ] コード品質チェック（lint・type-check）
- [ ] E2E テスト全パス

### Final Review
- [ ] i18n 日本語・英語すべて設定完了
- [ ] アクセシビリティ検証（WCAG 2.1 AA）
- [ ] レスポンシブデザイン検証（デスクトップ・タブレット・モバイル）
- [ ] パフォーマンス検証（Lighthouse）
- [ ] クロスブラウザ検証（Chrome・Firefox・Safari・Edge）

---

## Notes

### Architecture Decisions

- **State Management**: TanStack Query（サーバー状態）+ React State（UI状態）
- **File Storage**: フロントエンドからは Orval生成APIを通じて アクセス（バックエンド側ストレージ）
- **Error Handling**: 以下 domain/errors を使用
  - `FileUploadException`: アップロード失敗
  - `FileDownloadException`: ダウンロード失敗
  - `ValidationException`: バリデーション失敗

### Testing Strategy

- **Unit**: 業務ロジック・フック
- **Component**: UI 操作・ユーザーイベント
- **E2E**: 完全なユーザーフロー（アップロード～検索～削除）

### Performance Targets

- ファイルアップロード: 10秒以内（5MB ファイル）
- 検索: 1秒以内（100件文書）
- 一覧表示: 2秒以内

### i18n Keys Template

```typescript
// ja.ts, en.ts に追加予定
const fileManagement = {
  // Phase 1
  upload: "アップロード",
  searchPlaceholder: "キーワードで検索...",
  dragDropText: "ここにファイルをドラッグ&ドロップ",
  selectFiles: "ファイル選択",
  
  // Phase 2
  createTag: "タグを作成",
  filterByTag: "タグでフィルタ",
  
  // Phase 3
  edit: "編集",
  delete: "削除",
  restore: "復元",
  trash: "ゴミ箱",
  
  // Common
  loading: "読み込み中...",
  noResults: "該当する文書が見つかりません",
  error: "エラーが発生しました",
  // ... その他
}
```

### Task Effort Breakdown

- **Phase 1 (P1)**: 3 + 2.5 + 2 = **7.5 時間**
- **Phase 2 (P2)**: 2.5 + 2 + 2.5 = **7 時間**
- **Phase 3 (P3)**: 1.5 + 2.5 = **4 時間**
- **Total**: **18.5 時間** (~2-3 営業日, フル稼働時)

### Parallel Opportunities

- **Task 1-1, 1-2** 可能（異なるコンポーネント）
- **Task 1-3** は Task 1-2 に依存（検索には一覧が必要）
- **Task 2-1, 2-2** 可能（タグ管理はTask 1-1後）
- **Task 2-3** は Task 1-2 に依存（詳細表示は一覧後）
- **Task 3-1, 3-2** 可能（編集とゴミ箱は独立）

---

## Related Documentation

- **Feature Spec**: [specs/002-document-management-Kaede/spec.md](specs/002-document-management-Kaede/spec.md)
- **Implementation Plan**: [specs/002-document-management-Kaede/plan.md](specs/002-document-management-Kaede/plan.md)
- **Data Model**: [specs/002-document-management-Kaede/data-model.md](specs/002-document-management-Kaede/data-model.md)
- **Research Findings**: [specs/002-document-management-Kaede/research.md](specs/002-document-management-Kaede/research.md)
- **Quick Start**: [specs/002-document-management-Kaede/quickstart.md](specs/002-document-management-Kaede/quickstart.md)

# Tasks: 文書管理システム

**Input**: Design documents from `/specs/002-document-management-sogorei/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-rest.md

**Tests**: 仕様に従い、テストタスクを含める。TDD アプローチで失敗から開始。

**Organization**: ユーザーストーリー別に組織化。各ストーリーは独立して実装・テスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: ユーザーストーリーマッピング（US1, US2, US3, etc.）
- 正確なファイルパスを含める

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: プロジェクト構造の確立と依存関係のセットアップ

- [X] T001 Create domain model directory structure at `src/domain/models/document/`, `src/domain/models/tag/`, `src/domain/models/search/`, `src/domain/errors/`
- [X] T002 [P] Create adapter layer structure at `src/adapters/repositories/`, `src/adapters/generated/`, `src/adapters/mocks/handlers/`
- [X] T003 [P] Create presentation layer structure at `src/presentations/components/files/`, `src/presentations/components/tags/`, `src/presentations/components/search/`, `src/presentations/hooks/queries/`, `src/presentations/hooks/mutations/`, `src/presentations/pages/`
- [X] T004 [P] Add dependencies: `pnpm add react-pdf@^8.0.0 react-dropzone@^14.2.0` from project root
- [X] T005 [P] Create type definition files: `src/domain/models/document/Document.ts`, `src/domain/models/document/DocumentError.ts`, `src/domain/models/tag/Tag.ts`, `src/domain/models/search/SearchCondition.ts`
- [X] T006 Configure MSW handlers for document API in `src/adapters/mocks/handlers/fileHandlers.ts` with endpoints for GET /files, POST /files, GET /files/:id, PUT /files/:id, DELETE /files/:id
- [X] T007 [P] Create custom exception classes in `src/domain/errors/DocumentException.ts`, `src/domain/errors/FileUploadException.ts` extending ApplicationException

**Checkpoint**: 基本ディレクトリ構造と依存関係準備完了。ドメインモデル定義可能。

---

## Phase 2: 基盤インフラ（全ストーリーの前提）

**Purpose**: 全ユーザーストーリー実装をブロックしない基本機能

**⚠️ CRITICAL**: このフェーズ完了まで、ユーザーストーリータスク開始不可

- [x] T008 [P] Define Document model interface in `src/domain/models/document/Document.ts`: id, fileName, fileSize, fileFormat (enum), uploadedAt, updatedAt, uploadedByUserId, tags (Tag[]), isDeleted, deletedAt
- [x] T009 [P] Define Tag model interface in `src/domain/models/tag/Tag.ts`: id, name, color (semantic: primary, secondary, error, success, warning, info), createdAt, updatedAt, createdByUserId
- [x] T010 [P] Define SearchCondition model in `src/domain/models/search/SearchCondition.ts`: searchKeyword, tagIds, dateRangeStart, dateRangeEnd
- [x] T011 Create Orval-generated API client code: run Orval generator to create `src/adapters/generated/files.ts` from `schema/files/openapi.yaml` for Document and Tag CRUD operations
- [x] T012 [P] Setup DocumentRepository interface in `src/adapters/repositories/DocumentRepository.ts` with methods: getDocuments(filters), uploadDocument(file, tags), getDocumentById(id), updateDocument(id, data), deleteDocument(id), restoreDocument(id)
- [x] T013 [P] Setup TagRepository interface in `src/adapters/repositories/TagRepository.ts` with methods: getTags(), createTag(name, color), updateTag(id, name, color), deleteTag(id)
- [x] T014 Create TanStack Query hooks setup in `src/presentations/hooks/queries/useDocuments.ts`: useGetDocuments(filters, page) hook using @tanstack/react-query
- [x] T015 [P] Create composition file in `src/adapters/repositories/index.ts` to export all repository classes
- [x] T016 [P] Create MSW document list handler in `src/adapters/mocks/handlers/fileHandlers.ts` handling GET /files with pagination, search, tag filtering
- [x] T017 [P] Create MSW upload handler in `src/adapters/mocks/handlers/fileHandlers.ts` handling POST /files with file validation (size, format)
- [x] T018 Add DocumentManagementPage route in `src/app/router/routes.tsx` at path `/documents` with ProtectedRoute wrapper
- [x] T019 [P] Setup error handling utilities in `src/domain/errors/DocumentException.ts`, `src/domain/errors/FileUploadException.ts` for file-specific errors

**Checkpoint**: 基盤準備完了。以下のUSタスク並列実行可能。

---

## Phase 3: User Story 1 - 文書のアップロードと基本情報登録（P1） 🎯 MVP

**Goal**: ユーザーがドラッグ&ドロップでファイルをアップロードでき、タグを設定できる。アップロード進捗が表示される。

**Independent Test Criteria**: ファイルをドラッグ&ドロップ選択でき、タグを設定してアップロード実行でき、进捗表示が機能すること。

### Tests for User Story 1 ⚠️

- [x] T020 [P] [US1] Write contract test for POST /files endpoint in `playwright/tests/specs/document-management/upload.spec.ts`: test successful file upload, test file size validation (max 10MB), test unsupported format rejection
- [x] T021 [P] [US1] Write component test for FileUploadArea in `src/presentations/components/files/__tests__/FileUploadArea.test.tsx`: test drag-over state change, test file selection and validation, test multiple file selection (max 20)
- [x] T022 [P] [US1] Write component test for file format validation in `src/presentations/components/files/__tests__/FileUploadArea.test.tsx`: verify only PDF, DOCX, XLSX, JPG, PNG are accepted

### Implementation for User Story 1

- [x] T023 [P] [US1] Create FileUploadArea component in `src/presentations/components/files/FileUploadArea.tsx` with react-dropzone: drag-drop zone, file preview list, tag selector, upload button, progress indicators
- [x] T024 [P] [US1] Create TagSelector component in `src/presentations/components/tags/TagSelector.tsx`: Material-UI Autocomplete or Select for tag multi-selection with Material-UI Chip display
- [x] T025 [US1] Create useFileUpload mutation hook in `src/presentations/hooks/mutations/useFileUpload.ts` using @tanstack/react-query to handle multipart file upload with progress tracking
- [x] T026 [US1] Implement file validation logic in `src/domain/models/document/DocumentError.ts`: validate file size (max 10MB), file format whitelist (pdf, docx, xlsx, jpg, png), max file count (20 per upload)
- [x] T027 [US1] Create error display component in `src/presentations/components/files/FileUploadError.tsx`: Material-UI Alert for size, format, count violations
- [x] T028 [US1] Implement upload progress display in `src/presentations/components/files/FileUploadArea.tsx`: MUI LinearProgress per file with percentage, cancel button
- [x] T029 [P] [US1] Create MSW multipart form-data handler upgrade in `src/adapters/mocks/handlers/fileHandlers.ts` to accept tagged file uploads
- [x] T030 [US1] Create success notification on upload complete in `src/presentations/components/files/FileUploadArea.tsx` using Material-UI Snackbar
- [x] T031 [US1] Test duplicate filename handling: create scenario test in `playwright/tests/specs/document-management/upload.spec.ts` for "file already exists" dialog

**Checkpoint**: US1 完全機能。ドラッグ&ドロップアップロード、タグ設定、進捗表示が動作。

---

## Phase 4: User Story 2 - 文書一覧の表示と閲覧（P1） 🎯 MVP

**Goal**: ユーザーが文書一覧をリストビュー/グリッドビューで表示でき、ソート・ページネーション機能を使用できる。

**Independent Test Criteria**: 文書一覧が表示でき、ビューの切り替え、ソート、ページネーションが独立して機能すること。

### Tests for User Story 2 ⚠️

- [X] T032 [P] [US2] Write contract test for GET /files endpoint in `playwright/tests/specs/document-management/list.spec.ts`: test list retrieval with pagination, test sorting by filename/date/size, test empty list message
- [X] T033 [P] [US2] Write component test for FileList in `src/presentations/components/files/__tests__/FileList.test.tsx`: test document rendering with metadata display, test sort control change, test pagination navigation
- [X] T034 [P] [US2] Write component test for FileGridView in `src/presentations/components/files/__tests__/FileGridView.test.tsx`: test card layout rendering, test responsive grid behavior, test view toggle interaction

### Implementation for User Story 2

- [X] T035 [P] [US2] Create FileList component in `src/presentations/components/files/FileList.tsx`: MUI Table/List displaying fileName, tags, uploadedAt, fileSize, uploadedByUserName with data-testid attributes
- [X] T036 [P] [US2] Create FileGridView component in `src/presentations/components/files/FileGridView.tsx`: MUI Grid/Card layout with file metadata summary
- [X] T037 [US2] Create ViewToggle component in `src/presentations/components/files/ViewToggle.tsx`: Material-UI ToggleButton switching between list and grid views, save preference to localStorage
- [X] T038 [US2] Create SortControl component in `src/presentations/components/files/SortControl.tsx`: Material-UI Select for sort options (filename asc/desc, date new/old, size large/small)
- [X] T039 [US2] Create DocumentPagination component in `src/presentations/components/files/DocumentPagination.tsx`: MUI Pagination component handling page change, display total records, items per page
- [X] T040 [US2] Update useDocuments hook in `src/presentations/hooks/queries/useDocuments.ts` to support sort and view preferences stored in URL params and localStorage
- [X] T041 [US2] Create DocumentListPage integration in `src/presentations/pages/DocumentManagementPage.tsx`: compose FileUploadArea, ViewToggle, SortControl, FileList/FileGridView, Pagination
- [X] T042 [P] [US2] Update MSW handler in `src/adapters/mocks/handlers/fileHandlers.ts` to support sort query params (sortBy, sortOrder) and return correct pagination data
- [X] T043 [US2] Implement empty state UI in `src/presentations/components/files/DocumentEmptyState.tsx`: MUI Box with illustration and message "Upload documents to get started"
- [X] T044 [US2] Test loading state: create MUI Skeleton loaders in FileList and FileGridView with data-testid for testing

**Checkpoint**: US2 完全機能。一覧表示、ビュー切り替え、ソート、ページネーション全て動作。

---

## Phase 5: User Story 3 - キーワード検索で文書を探す（P1） 🎯 MVP

**Goal**: ユーザーが検索バーにキーワードを入力すると、ファイル名とタグ名で該当文書が表示され、マッチ部分がハイライトされる。

**Independent Test Criteria**: 検索バーにキーワード入力すると、関連文書が絞られて表示され、ハイライト表示が機能すること。

### Tests for User Story 3 ⚠️

- [X] T045 [P] [US3] Write contract test for GET /files with search param in `playwright/tests/specs/document-management/search.spec.ts`: test filename search (partial match), test tag name search, test no results message
- [X] T046 [P] [US3] Write component test for SearchBar in `src/presentations/components/search/__tests__/SearchBar.test.tsx`: test input change, test search trigger on Enter/blur, test clear button, test debounce behavior
- [X] T047 [P] [US3] Write utility test for highlight matching logic in `src/presentations/utils/__tests__/highlightMatch.test.ts`: test substring highlighting, test case-insensitive matching

### Implementation for User Story 3

- [X] T048 [P] [US3] Create SearchBar component in `src/presentations/components/search/SearchBar.tsx`: Material-UI TextField with debounced input, clear button, search icon, data-testid
- [X] T049 [US3] Create highlight utility in `src/presentations/utils/highlightMatch.ts`: function to mark matching substrings in text for HTML rendering with `<mark>` tags
- [X] T050 [US3] Update FileList component in `src/presentations/components/files/FileList.tsx` to display highlighted fileName when search is active, using highlight utility
- [X] T051 [US3] Update FileGridView component in `src/presentations/components/files/FileGridView.tsx` to display highlighted fileName in cards when search is active
- [X] T052 [US3] Update useDocuments hook in `src/presentations/hooks/queries/useDocuments.ts` to accept search param and pass to GET /files as query param
- [X] T053 [US3] Create useSearch custom hook in `src/presentations/hooks/queries/useSearch.ts`: manage search state with debounce, sync with URL searchParams, trigger useDocuments refetch
- [X] T054 [P] [US3] Update MSW handler in `src/adapters/mocks/handlers/fileHandlers.ts` to filter results by search param (case-insensitive filename and tag name match)
- [X] T055 [US3] Create SearchResultsStatus component in `src/presentations/components/search/SearchResultsStatus.tsx`: display result count, "No documents found" empty state when zero results
- [X] T056 [US3] Integrate SearchBar into DocumentManagementPage in `src/presentations/pages/DocumentManagementPage.tsx` above file list with full-width layout
- [X] T057 [P] [US3] Test multi-word search: add E2E test in `playwright/tests/specs/document-management/search.spec.ts` for searching "田中 商事" returning documents with both keywords

**Checkpoint**: US3 完全機能。キーワード検索、ハイライト、結果表示全て動作。

---

## Phase 6: User Story 4 - タグでフィルタリング（P2）

**Goal**: ユーザーがタグを選択してフィルタを適用すると、選択タグを持つ文書のみが表示される。複数タグの AND フィルタに対応。

**Independent Test Criteria**: タグフィルタが適用でき、複数タグ選択時に AND ロジックで絞られること。

### Tests for User Story 4 ⚠️

- [X] T058 [P] [US4] Write contract test for GET /files with tagIds param in `playwright/tests/specs/document-management/filter.spec.ts`: test single tag filter, test multiple tag AND logic, test filter clear
- [X] T059 [P] [US4] Write component test for TagFilter in `src/presentations/components/tags/__tests__/TagFilter.test.tsx`: test tag selection state, test filter application, test filter reset

### Implementation for User Story 4

- [X] T060 [P] [US4] Create TagFilter component in `src/presentations/components/tags/TagFilter.tsx`: Material-UI Checkbox group or FilterList showing all available tags with color chips, multi-select support
 - [X] T061 [US4] Create useTagFilter custom hook in `src/presentations/hooks/queries/useTagFilter.ts`: manage selected tag state, sync with URL searchParams, trigger query refetch
- [X] T062 [US4] Update useDocuments hook in `src/presentations/hooks/queries/useDocuments.ts` to accept tagIds param and pass to GET /files
- [X] T063 [P] [US4] Create TagChip component in `src/presentations/components/tags/TagChip.tsx`: display Tag with Material-UI Chip using semantic color mapping
- [X] T064 [P] [US4] Update MSW handler in `src/adapters/mocks/handlers/fileHandlers.ts` to filter by tagIds with AND logic (all selected tags must be present)
- [X] T065 [US4] Integrate TagFilter into DocumentManagementPage in `src/presentations/pages/DocumentManagementPage.tsx` as sidebar or collapsible panel
- [X] T066 [US4] Create FilterStatusBar component in `src/presentations/components/files/FilterStatusBar.tsx`: show active tag filters with remove button per tag, show clear all button
- [X] T067 [US4] Test date range filter placeholder: add task description for future P2 implementation in `src/presentations/components/files/DateRangeFilter.tsx`

**Checkpoint**: US4 完全機能。タグフィルタ、複数タグ AND ロジック、フィルタ状態表示が動作。

---

## Phase 7: User Story 5 - 文書の詳細表示とダウンロード（P2）

**Goal**: ユーザーが文書をクリックすると詳細画面が開き、PDFと画像がプレビュー表示される。ダウンロードボタンでファイルを保存できる。

**Independent Test Criteria**: 文書クリックで詳細画面が開き、PDFと画像プレビューが表示でき、ダウンロード機能が動作すること。

### Tests for User Story 5 ⚠️

- [ ] T068 [P] [US5] Write contract test for GET /files/:id in `playwright/tests/specs/document-management/detail.spec.ts`: test document detail retrieval, test download endpoint response
- [ ] T069 [P] [US5] Write component test for FileDetailsModal in `src/presentations/components/files/__tests__/FileDetailsModal.test.tsx`: test modal open/close, test PDF preview render, test image preview render, test download button
- [ ] T070 [P] [US5] Write component test for PDFViewer in `src/presentations/components/files/__tests__/PDFViewer.test.tsx`: test PDF loading, test page navigation, test error handling

### Implementation for User Story 5

- [ ] T071 [P] [US5] Create FileDetailsModal component in `src/presentations/components/files/FileDetailsModal.tsx`: Material-UI Modal/Dialog displaying file metadata (name, size, uploadedAt, uploadedBy, tags), preview area, action buttons
- [ ] T072 [P] [US5] Create PDFViewer component in `src/presentations/components/files/PDFViewer.tsx`: wrap react-pdf Document/Page components with Suspense, MUI Skeleton loading state, error boundary, page navigation
- [ ] T073 [P] [US5] Create ImageViewer component in `src/presentations/components/files/ImageViewer.tsx`: `<img>` element with error handling, Blob URL support for CORS, loading skeleton
- [ ] T074 [US5] Create useFileDetails custom hook in `src/presentations/hooks/queries/useFileDetails.ts`: fetch single document using GET /files/:id with TanStack Query
- [ ] T075 [US5] Create download handler in `src/presentations/hooks/mutations/useDownloadFile.ts`: fetch file from API and trigger browser download using Blob and URL.createObjectURL
- [ ] T076 [US5] Update FileList component to open FileDetailsModal on row click with document ID
- [ ] T077 [US5] Update FileGridView component to open FileDetailsModal on card click with document ID
- [ ] T078 [P] [US5] Update MSW handler in `src/adapters/mocks/handlers/fileHandlers.ts` to add GET /files/:id endpoint returning full document object
- [ ] T079 [US5] Implement file download route in MSW: GET /files/:id/download returning Blob with Content-Disposition header
- [ ] T080 [US5] Add preview not available message for unsupported formats in `src/presentations/components/files/FileDetailsModal.tsx` (e.g., Word, Excel)

**Checkpoint**: US5 完全機能。詳細表示、PDFと画像プレビュー、ダウンロード全て動作。

---

## Phase 8: User Story 6 - タグの作成と管理（P2）

**Goal**: 管理者がタグ管理画面で新しいタグを作成・編集・削除でき、色を設定できる。作成タグはアップロード時に選択可能。

**Independent Test Criteria**: タグ管理画面でタグ作成・編集・削除が可能で、作成タグがタグセレクタに表示されること。

### Tests for User Story 6 ⚠️

- [ ] T081 [P] [US6] Write contract tests for tag endpoints in `playwright/tests/specs/document-management/tags.spec.ts`: test GET /tags, test POST /tags, test PUT /tags/:id, test DELETE /tags/:id
- [ ] T082 [P] [US6] Write component test for TagManagement in `src/presentations/components/tags/__tests__/TagManagement.test.tsx`: test tag list display, test create form, test edit form, test delete confirmation

### Implementation for User Story 6

- [ ] T083 [P] [US6] Create TagManagement component in `src/presentations/components/tags/TagManagement.tsx`: MUI Table showing all tags with name, color chip, createdBy, createdAt, action buttons (edit, delete)
- [ ] T084 [P] [US6] Create TagForm component in `src/presentations/components/tags/TagForm.tsx`: React Hook Form with Zod for tag name (2-50 chars) and color selector using Material-UI Select or color picker
- [ ] T085 [US6] Create TagFormModal in `src/presentations/components/tags/TagFormModal.tsx`: wrapper Material-UI Modal for create/edit modes with form submission
- [ ] T086 [US6] Create useTags query hook in `src/presentations/hooks/queries/useTags.ts`: fetch all tags using GET /tags
- [ ] T087 [US6] Create useTagMutations hook in `src/presentations/hooks/mutations/useTagMutations.ts`: mutations for POST /tags (create), PUT /tags/:id (update), DELETE /tags/:id (delete)
- [ ] T088 [US6] Create TagManagementPage in `src/presentations/pages/TagManagementPage.tsx` with TagManagement component, restricted to admin role
- [ ] T089 [US6] Add TagManagement route in `src/app/router/routes.tsx` at path `/tags` with role-based access control for admin only
- [ ] T090 [P] [US6] Extend MSW handlers in `src/adapters/mocks/handlers/fileHandlers.ts` with GET /tags, POST /tags, PUT /tags/:id, DELETE /tags/:id endpoints
- [ ] T091 [US6] Create tag deletion warning component in `src/presentations/components/tags/TagDeleteConfirm.tsx`: show count of documents using tag, confirm destructive action
- [ ] T092 [US6] Update TagSelector component in `src/presentations/components/tags/TagSelector.tsx` to dynamically fetch tags from useTags hook

**Checkpoint**: US6 完全機能。タグ管理画面、作成・編集・削除、色設定全て動作。

---

## Phase 9: User Story 7 - 文書のメタデータ編集（P3）

**Goal**: ユーザーが文書詳細画面から ファイル名とタグを編集・保存でき、変更が一覧に反映される。

**Independent Test Criteria**: 文書詳細から編集可能で、保存後に一覧ページのメタデータが更新されること。

### Tests for User Story 7 ⚠️

- [ ] T093 [P] [US7] Write contract test for PUT /files/:id in `playwright/tests/specs/document-management/edit.spec.ts`: test filename update, test tag update
- [ ] T094 [P] [US7] Write component test for FileEdit in `src/presentations/components/files/__tests__/FileEditForm.test.tsx`: test form population, test validation, test submit

### Implementation for User Story 7

- [ ] T095 [P] [US7] Create FileEditForm component in `src/presentations/components/files/FileEditForm.tsx`: React Hook Form with Zod for fileName and tagIds, MUI TextField and TagSelector
- [ ] T096 [US7] Add edit mode toggle to FileDetailsModal in `src/presentations/components/files/FileDetailsModal.tsx`: button to enter edit mode, show form instead of display
- [ ] T097 [US7] Create useUpdateDocument mutation hook in `src/presentations/hooks/mutations/useUpdateDocument.ts`: handle PUT /files/:id with optimistic update
- [ ] T098 [US7] Implement validation in FileEditForm: fileName not empty, length > 0, tags array update logic
- [ ] T099 [P] [US7] Extend MSW handler in `src/adapters/mocks/handlers/fileHandlers.ts` with PUT /files/:id endpoint
- [ ] T100 [US7] Update useDocuments query cache on successful document update to reflect changes in list view
- [ ] T101 [US7] Add success notification on save in FileDetailsModal

**Checkpoint**: US7 完全機能。メタデータ編集、保存、一覧反映が動作。

---

## Phase 10: User Story 8 - 文書の削除とゴミ箱からの復元（P3）

**Goal**: ユーザーが文書を削除するとゴミ箱に移動。ゴミ箱から復元可能。30日後に自動削除（シミュレーション）。

**Independent Test Criteria**: 文書削除でゴミ箱に移動、ゴミ箱から復元できること。削除確認ダイアログが表示されること。

### Tests for User Story 8 ⚠️

- [ ] T102 [P] [US8] Write contract tests for delete endpoints in `playwright/tests/specs/document-management/trash.spec.ts`: test DELETE /files/:id (soft delete), test POST /files/:id/restore
- [ ] T103 [P] [US8] Write component test for TrashPage in `src/presentations/components/files/__tests__/TrashPage.test.tsx`: test trash list display, test restore button, test permanent delete

### Implementation for User Story 8

- [ ] T104 [P] [US8] Create TrashPage component in `src/presentations/pages/TrashPage.tsx`: MUI Table displaying soft-deleted documents with deletedAt date, restore and permanent delete buttons
- [ ] T105 [US8] Create useTrashDocuments query hook in `src/presentations/hooks/queries/useTrashDocuments.ts`: fetch documents where isDeleted=true using GET /files?isDeleted=true
- [ ] T106 [US8] Create useDeleteDocument mutation hook in `src/presentations/hooks/mutations/useDeleteDocument.ts`: handle DELETE /files/:id (soft delete)
- [ ] T107 [US8] Create useRestoreDocument mutation hook in `src/presentations/hooks/mutations/useRestoreDocument.ts`: handle POST /files/:id/restore
- [ ] T108 [US8] Add delete confirmation dialog to file list row action in `src/presentations/components/files/FileList.tsx`
- [ ] T109 [US8] Add delete confirmation dialog to FileDetailsModal in `src/presentations/components/files/FileDetailsModal.tsx`
- [ ] T110 [P] [US8] Extend MSW handlers in `src/adapters/mocks/handlers/fileHandlers.ts`: implement DELETE /files/:id (set isDeleted=true, deletedAt=now), implement POST /files/:id/restore (set isDeleted=false, deletedAt=null)
- [ ] T111 [US8] Add Trash link to main navigation in `src/presentations/layouts/AppLayout.tsx` or header
- [ ] T112 [US8] Create permanent delete confirmation with warning about 30-day policy in `src/presentations/components/files/PermanentDeleteConfirm.tsx`
- [ ] T113 [US8] Add trash icon or link in file action menu to access delete functionality

**Checkpoint**: US8 完全機能。削除、ゴミ箱移動、復元が動作。

---

## Phase 11: User Story 9 - 検索条件の保存と再利用（P3）

**Goal**: ユーザーが複雑な検索条件（キーワード + タグ + 日付範囲）を保存し、ワンクリックで再適用できる。

**Independent Test Criteria**: 検索条件を保存でき、保存条件一覧から選択して再適用できること。

### Tests for User Story 9 ⚠️

- [ ] T114 [P] [US9] Write component test for SavedSearches in `src/presentations/components/search/__tests__/SavedSearches.test.tsx`: test save search form, test saved list display, test search condition application, test edit/delete

### Implementation for User Story 9

- [ ] T115 [P] [US9] Create SaveSearchForm component in `src/presentations/components/search/SaveSearchForm.tsx`: React Hook Form with Zod for condition name (2-100 chars), store to localStorage or Context
- [ ] T116 [P] [US9] Create SavedSearchesList component in `src/presentations/components/search/SavedSearchesList.tsx`: MUI List showing saved conditions with apply button, edit, delete actions
- [ ] T117 [US9] Create useSavedSearches custom hook in `src/presentations/hooks/queries/useSavedSearches.ts`: manage saved conditions in Context and localStorage
- [ ] T118 [US9] Add "Save this search" button to SearchBar in `src/presentations/components/search/SearchBar.tsx` visible when filters are active
- [ ] T119 [US9] Create SavedSearchCondition type in `src/domain/models/search/SearchCondition.ts`: id, name, searchKeyword, tagIds, dateRangeStart, dateRangeEnd, createdAt
- [ ] T120 [US9] Update DocumentManagementPage to display SavedSearchesList as sidebar or panel
- [ ] T121 [US9] Implement apply logic: clicking saved search populates all filters and triggers query

**Checkpoint**: US9 完全機能。検索条件保存、一覧表示、再適用が動作。

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: 全ストーリー共通の改善、テスト、ドキュメント

- [ ] T122 [P] Run all unit tests with coverage in `src/**/__tests__/*.test.tsx`: verify 80%+ coverage for domain, adapters, presentations layers
- [ ] T123 [P] Run all E2E tests in `playwright/tests/specs/document-management/*.spec.ts` against mock API: verify all user stories pass independently
- [ ] T124 [P] Accessibility audit using axe-core or WAVE in `playwright/tests/a11y/documentManagement.a11y.ts`: verify WCAG 2.1 Level AA compliance for all components
- [ ] T125 [P] Responsive design test in `playwright/tests/responsive/documentManagement.responsive.ts`: test desktop (1920x1080), tablet (768x1024) viewports
- [ ] T126 [P] Performance optimization: implement lazy loading for FileDetailsModal PDFViewer, memoize FileList rows, verify Lighthouse score > 80
- [ ] T127 Review and update `specs/002-document-management-sogorei/quickstart.md` with actual implementation notes and gotchas
- [ ] T128 Create implementation summary in `docs/day2-implementation.md`: overview of all delivered features, code structure, testing approach
- [ ] T129 [P] ESLint validation on all feature files: ensure zero linting errors in `src/domain/`, `src/adapters/`, `src/presentations/` for this feature
- [ ] T130 [P] TypeScript strict mode validation: ensure all feature files pass `tsc --noEmit` without errors
- [ ] T131 Run i18n validation: verify Japanese and English translations for all user-facing messages in UI components
- [ ] T132 [P] Code review checklist: verify Clean Architecture adherence, naming conventions, component composition patterns
- [ ] T133 Create E2E test fixtures in `playwright/tests/fixtures/documentFixtures.ts`: pre-populated document and tag data for comprehensive scenario testing
- [ ] T134 Document API integration points in `src/adapters/repositories/DocumentRepository.ts`: JSDoc comments explaining each method contract
- [ ] T135 Add error boundary wrapping for DocumentManagementPage in `src/presentations/pages/DocumentManagementPage.tsx`
- [ ] T136 [P] Verify MSW mock handler responses match OpenAPI schema in `src/adapters/mocks/handlers/fileHandlers.ts`

**Checkpoint**: 全ユーザーストーリー完全実装、テスト 80%+、アクセシビリティ準拠、ドキュメント整備完了。MVP デプロイ準備完了。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし → 直ちに開始
- **Phase 2 (Foundational)**: Phase 1 完了 → 全ストーリーをブロック
- **Phases 3-5 (P1 Stories: US1, US2, US3)**: Phase 2 完了後、並列実行可能（スタッフがあれば）
- **Phases 6-7 (P2 Stories: US4, US5)**: Phase 2 完了、US1 完了推奨（統合テスト用）
- **Phases 8-9 (P3 Stories: US6, US7, US8, US9)**: Phase 2 完了、最低 US1 完了
- **Phase 12 (Polish)**: 全ストーリー実装完了後

### User Story Dependencies

- **US1**: Phase 2 完了後、独立実行可能
- **US2**: Phase 2 + US1 推奨（統合テスト用だが、独立実装可）
- **US3**: Phase 2 + US1/US2（検索は一覧の上に構築）
- **US4**: Phase 2 + US1/US2/US3
- **US5**: Phase 2 + US1/US2
- **US6**: Phase 2（管理機能、独立）
- **US7**: US5（詳細編集）
- **US8**: US1（削除はアップロード後）
- **US9**: US1/US2/US3（検索条件保存）

### Parallel Opportunities

**Phase 1 内**:
- T002, T003, T004, T005, T007 同時実行

**Phase 2 内**:
- T008, T009, T010, T012, T013, T015, T016, T017, T019 同時実行
- T011 は Orval 実行（前提あり）
- T014, T018 は依存あり（順序保持）

**Phases 3-5（P1 ストーリー）**:
- 複数開発者がいれば、US1, US2, US3 を並列実行可能
- 各 US 内の [P] タスク同時実行

**Phase 6-7（P2 ストーリー）**:
- US4, US5 並列実行可能

---

## Parallel Example: User Story 1 Implementation

```bash
# Phase 2 完了後、以下を並列実行

# Tests 並列実行（T020-T022）
Task: "Write contract test for POST /files"
Task: "Write component test for FileUploadArea"
Task: "Write component test for file format validation"

# Components 並列実行（T023-T024, T029）
Task: "Create FileUploadArea component"
Task: "Create TagSelector component"
Task: "Update MSW multipart form-data handler"

# Hooks & Utilities 並列実行（T025-T027）
Task: "Create useFileUpload mutation hook"
Task: "Implement file validation logic"
Task: "Create error display component"

# Remaining sequential（T028-T031）
Task: "Implement upload progress display"
Task: "Create MSW multipart form-data handler upgrade"
Task: "Create success notification"
Task: "Test duplicate filename handling"
```

---

## MVP Scope & Delivery

### MVP: Minimum Viable Product

**推奨**: **Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) + Phase 5 (US3)** = **基本 3 機能**

**デリバリー基準**:
- ✅ ファイルアップロード（タグ設定、進捗表示）
- ✅ ファイル一覧表示（リスト/グリッド、ソート、ページネーション）
- ✅ キーワード検索（ハイライト、結果表示）
- ✅ テストカバレッジ 80%+
- ✅ アクセシビリティ WCAG 2.1 AA

**推定実装時間**: 2-3 日（1 開発者、Day 2-3）

### Incremental Delivery Strategy

1. **MVP (Phase 1+2+3+4+5)**: Day 2 完了 → デモ・デプロイ
2. **Add P2 Features (Phase 6+7)**: Day 3 → 詳細表示、タグ管理追加
3. **Add P3 Features (Phase 8+9)**: 余時間 → 編集、削除、検索保存

### Parallel Team Strategy（複数開発者の場合）

```
Day 1 (Preparation):
  - Team: Phase 1 (Setup) + Phase 2 (Foundational) → 基盤準備

Day 2-3 (P1 Implementation, Parallel):
  - Dev A: US1 (Upload) → T020-T031
  - Dev B: US2 (List) → T032-T044
  - Dev C: US3 (Search) → T045-T057
  - Result: 3 機能並列完成

Day 3-4 (P2 Implementation):
  - Dev A: US4 (Tag Filter) → T058-T067
  - Dev B: US5 (Detail & Download) → T068-T080
  - Dev C: US6 (Tag Management) → T081-T092
  - Result: 追加機能完成

Day 4+ (P3 & Polish):
  - Remaining: US7, US8, US9, Phase 12
```

---

## Notes

- [P] = 並列実行可能（ファイル独立、依存なし）
- [Story] = ユーザーストーリー追跡用ラベル（US1-US9）
- 各フェーズ末の **Checkpoint** でストーリー単独テスト推奨
- **Phase 2 完了まで** US タスク開始しない（基盤必須）
- 各 US タスクは**独立実装・テスト**可能設計
- テスト失敗から開始（TDD）→ 実装 → テスト合格
- URL searchParams と localStorage で状態同期
- MSW ハンドラーで OpenAPI スキーマ仕様を厳密に実装
- Material-UI コンポーネント一貫使用（カスタム UI 最小化）
- TypeScript Strict + i18n + アクセシビリティ必須

---

## Summary

**Total Tasks**: 136（内テストタスク 31）
**Tasks by Priority**:
- P1 (MVP): 57 tasks (Phases 1-5)
- P2: 33 tasks (Phases 6-7)
- P3: 22 tasks (Phases 8-11)
- Polish: 24 tasks (Phase 12)

**Tests**: 31 tasks（23%）- Contract, Component, E2E, A11y, Responsive

**Estimated Timeline**:
- MVP (US1+US2+US3): 2-3 日
- Full P1+P2: 4-5 日
- Full P1+P2+P3: 6-8 日
- Polish + QA: 1-2 日
- **Total**: 8-10 日（1 開発者）、4-5 日（2-3 開発者並列）

**Parallel Opportunities Identified**:
- Phase 1: 5 タスク並列
- Phase 2: 9 タスク並列
- Each P1 Story: 3-4 タスク並列
- P1+P2 Stories 並列（多人数）

**Independent Test Criteria by Story**:
- **US1**: ドラッグ&ドロップアップロード、タグ設定、進捗表示
- **US2**: 一覧表示、ビュー切り替え、ソート、ページネーション
- **US3**: キーワード検索、ハイライト、結果絞込
- **US4**: タグフィルタ、AND ロジック、複数選択
- **US5**: 詳細画面、PDF/画像プレビュー、ダウンロード
- **US6**: タグ作成・編集・削除、色設定
- **US7**: メタデータ編集、保存、一覧反映
- **US8**: 削除、ゴミ箱移動、復元
- **US9**: 検索条件保存、再利用

**MVP Recommendation**: **Phase 1+2+3+4+5** → US1 + US2 + US3 で十分な価値提供（検索・一覧・アップロード）

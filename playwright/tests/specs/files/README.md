# ファイル管理機能 E2Eテスト

## テストファイル構成

```
specs/files/
├── file-list.md              # 仕様書
├── file-list.spec.ts         # 一覧・検索・ソート・削除・アップロード（16テスト）
├── file-upload.spec.ts       # アップロード（4テスト）
├── file-delete.spec.ts       # 削除（3テスト: すべてスキップ）
└── tag-management.spec.ts    # タグ管理（6テスト: 3スキップ）
```

## Page Objects

```
pages/
├── FilesPage.ts                           # ファイル一覧ページ
└── dialogs/
    ├── TagManagementDialog.ts             # タグ管理ダイアログ
    ├── FileUploadDialog.ts                # アップロードダイアログ
    └── FileDeleteDialog.ts                # 削除確認ダイアログ
```

## 実行方法

### 全テスト実行
```bash
pnpm test:e2e:chromium playwright/tests/specs/files/
```

### 個別実行
```bash
# ファイル一覧のみ
pnpm test:e2e:chromium playwright/tests/specs/files/file-list.spec.ts

# タグ管理のみ
pnpm test:e2e:chromium playwright/tests/specs/files/tag-management.spec.ts

# アップロードのみ
pnpm test:e2e:chromium playwright/tests/specs/files/file-upload.spec.ts

# 削除のみ
pnpm test:e2e:chromium playwright/tests/specs/files/file-delete.spec.ts
```

## テスト結果サマリー

| テストファイル | 実行可能 | スキップ | 合計 |
|----------------|----------|----------|------|
| file-list.spec.ts | 16 | 0 | 16 |
| file-upload.spec.ts | 4 | 0 | 4 |
| tag-management.spec.ts | 3 | 3 | 6 |
| file-delete.spec.ts | 0 | 3 | 3 |
| **合計** | **23** | **6** | **29** |

## 実装状況詳細

### ✅ 実装済み機能（テスト有効）

1. **ファイル一覧表示**
   - テーブル表示確認
   - ヘッダー項目確認

2. **検索・フィルタリング**
   - ファイル名検索
   - 検索クリア
   - カテゴリーフィルタリング
   - 空の検索結果メッセージ

3. **ソート機能**
   - ファイルサイズソート
   - 更新日時ソート
   - ファイル名ソート

4. **タグ管理**
   - ダイアログ表示
   - タグ検索
   - ダイアログ閉じる

5. **ファイルアップロード**
   - 基本アップロード
   - カテゴリー・タグ指定
   - アップロードキャンセル
   - 複数ファイル連続アップロード

6. **ファイル削除**
   - 個別削除
   - 一括削除

7. **画面遷移**
   - タグ管理画面遷移（ダイアログ形式）
   - ごみ箱画面遷移

8. **ページング**
   - ページング機能

### 🚧 スキップ中の機能（テスト実装済み、機能実装待ち）

1. **ファイル削除（file-delete.spec.ts）**
   - 個別削除（詳細版）
   - 一括削除（詳細版）
   - 削除キャンセル

2. **タグ管理（tag-management.spec.ts）**
   - タグ作成
   - タグ編集
   - タグ削除

## 次のステップ

1. file-delete.spec.ts のスキップテストを有効化（削除キャンセル機能の実装）
2. タグ作成・編集・削除機能の実装
3. tag-management.spec.ts のスキップテストを有効化
4. すべてのブラウザ（Firefox, WebKit）でテスト実行
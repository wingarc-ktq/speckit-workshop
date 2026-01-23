# ファイル管理機能 E2Eテスト

## テストファイル構成

```
specs/files/
├── file-list.md              # 仕様書
├── file-list.spec.ts         # 一覧・検索・ソート（14テスト: 8合格, 6スキップ）
├── file-upload.spec.ts       # アップロード（4テスト: すべてスキップ）
├── file-delete.spec.ts       # 削除（3テスト: すべてスキップ）
└── tag-management.spec.ts    # タグ管理（6テスト: 3合格, 3スキップ）
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

| テストファイル | 合格 | スキップ | 合計 |
|----------------|------|----------|------|
| file-list.spec.ts | 8 | 6 | 14 |
| tag-management.spec.ts | 3 | 3 | 6 |
| file-upload.spec.ts | 0 | 4 | 4 |
| file-delete.spec.ts | 0 | 3 | 3 |
| **合計** | **11** | **16** | **27** |

## 実装状況詳細

### ✅ 実装済み機能

1. **ファイル一覧表示**
   - テーブル表示確認
   - ヘッダー項目確認

2. **検索・フィルタリング**
   - ファイル名検索
   - 検索クリア
   - カテゴリーフィルタリング

3. **ソート機能**
   - ファイルサイズソート
   - 更新日時ソート
   - ファイル名ソート

4. **タグ管理**
   - ダイアログ表示
   - タグ検索
   - ダイアログ閉じる
   - 画面遷移（ダイアログ形式）

### 🚧 実装待ち機能

1. **ファイルアップロード**
   - 基本アップロード
   - カテゴリー・タグ指定
   - アップロードキャンセル
   - 複数ファイル連続アップロード

2. **ファイル削除**
   - 個別削除
   - 一括削除
   - 削除キャンセル

3. **その他**
   - ごみ箱画面遷移
   - 空の検索結果メッセージ
   - ページング機能
   - タグ作成・編集・削除

## 次のステップ

1. バックエンドのアップロード・削除APIを実装
2. フロントエンドのアップロード・削除UIを実装
3. スキップしたテストを有効化
4. すべてのブラウザ（Firefox, WebKit）でテスト実行

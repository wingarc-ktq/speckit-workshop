# Data Model: 文書管理システム

**Phase**: Phase 1 - Design & Data Modeling  
**Date**: 2025-01-14  
**Status**: MVP（P1 機能）に限定

---

## Entity Definitions

### 1. Document（文書）

文書管理システムで管理される主要エンティティ。ユーザーがアップロードしたファイル情報を表現。

**Fields**:

| Field Name | Type | Required | Description | Constraint |
|-----------|------|----------|-------------|-----------|
| `id` | UUID | Yes | 文書の一意識別子 | Immutable |
| `fileName` | String | Yes | オリジナルファイル名（拡張子含む） | Max: 255 chars |
| `fileSize` | Integer | Yes | ファイルサイズ（バイト単位） | Max: 10485760 (10MB) |
| `fileFormat` | Enum | Yes | ファイル形式（MIME type） | allowed: pdf, docx, xlsx, jpg, png |
| `uploadedAt` | DateTime | Yes | アップロード日時（UTC） | Immutable |
| `updatedAt` | DateTime | Yes | 最終更新日時（UTC） | Auto-updated |
| `uploadedByUserId` | UUID | Yes | アップロードユーザー ID | Foreign Key → User.id |
| `tags` | Tag[] | No | 付与されたタグ（多対多関係） | 0～複数 |
| `isDeleted` | Boolean | No | ゴミ箱に移動済みフラグ | Default: false |
| `deletedAt` | DateTime | No | 削除日時（30日後に自動完全削除） | Nullable |

**Validation Rules**:

- `fileName`: 空文字列不可、スラッシュを除く特殊文字は URL エンコード
- `fileFormat`: ホワイトリスト に含まれるもののみ受け入れ
- `fileSize`: 0MB < size ≤ 10MB
- `isDeleted = true` の場合、`deletedAt` は必須（30日間保持）
- `uploadedAt` ≤ `updatedAt` （常に成立すること）

**State Transitions**:

```
初期状態
  ↓
[アップロード中] → 進捗表示
  ↓
[アクティブ] ← ファイル一覧表示・詳細表示・ダウンロード・編集
  ↓ (削除実行)
[ゴミ箱] ← 復元可能（30日以内）
  ↓ (30日経過 or 完全削除実行)
[永久削除]
```

---

### 2. Tag（タグ）

文書を分類・整理するためのラベル。ユーザーが自由に作成・管理できる。

**Fields**:

| Field Name | Type | Required | Description | Constraint |
|-----------|------|----------|-------------|-----------|
| `id` | UUID | Yes | タグの一意識別子 | Immutable |
| `name` | String | Yes | タグ名（ユーザー入力） | Max: 50 chars, Unique per workspace |
| `color` | Enum | Yes | タグの色（セマンティック） | allowed: primary, secondary, error, success, warning, info |
| `createdAt` | DateTime | Yes | 作成日時（UTC） | Immutable |
| `updatedAt` | DateTime | Yes | 最終更新日時（UTC） | Auto-updated |
| `createdByUserId` | UUID | Yes | 作成ユーザー ID | Foreign Key → User.id |

**Validation Rules**:

- `name`: 空文字列不可、2～50文字
- `color`: Material-UI セマンティック色に限定
- 同一名前のタグ重複不可（ワークスペース内で Unique）

**Examples**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "請求書",
  "color": "error",
  "createdAt": "2025-01-10T08:30:00Z",
  "updatedAt": "2025-01-10T08:30:00Z",
  "createdByUserId": "user-123"
}
```

---

### 3. DocumentTag（文書タグ関連）

Document と Tag の多対多関係を管理する中間テーブル。

**Fields**:

| Field Name | Type | Required | Description | Constraint |
|-----------|------|----------|-------------|-----------|
| `id` | UUID | Yes | 関連の一意識別子 | Immutable |
| `documentId` | UUID | Yes | 文書 ID | Foreign Key → Document.id, ON DELETE CASCADE |
| `tagId` | UUID | Yes | タグ ID | Foreign Key → Tag.id, ON DELETE CASCADE |
| `assignedAt` | DateTime | Yes | タグ付与日時（UTC） | Immutable |

**Validation Rules**:

- 複合ユニーク制約: `(documentId, tagId)` → 同じ文書に同じタグを重複付与しない
- タグ削除時: 関連する DocumentTag レコードも CASCADE 削除

**Cardinality**:

- 1 Document : N Tags
- 1 Tag : N Documents

---

### 4. User（ユーザー）

システムを利用するユーザー。認証・権限管理用。（既存の001-user-auth から継承）

**Fields**:

| Field Name | Type | Required | Description | Constraint |
|-----------|------|----------|-------------|-----------|
| `id` | UUID | Yes | ユーザー一意識別子 | Immutable |
| `name` | String | Yes | ユーザー名（表示名） | Max: 100 chars |
| `email` | String | Yes | メールアドレス | Unique, RFC 5322 準拠 |
| `role` | Enum | Yes | ロール | allowed: admin, user |
| `createdAt` | DateTime | Yes | 作成日時（UTC） | Immutable |
| `updatedAt` | DateTime | Yes | 最終更新日時（UTC） | Auto-updated |

**Role 定義**:

| Role | タグ管理 | 文書管理 | ユーザー管理 |
|------|--------|--------|---------|
| admin | ✅ | ✅ | ✅ |
| user | ✗ | ✅ | ✗ |

---

### 5. SavedSearchCondition（保存済み検索条件）

ユーザーが保存した検索条件。複雑な検索を再利用できる。（MVP では Optional ですが、スキーマ定義）

**Fields**:

| Field Name | Type | Required | Description | Constraint |
|-----------|------|----------|-------------|-----------|
| `id` | UUID | Yes | 検索条件の一意識別子 | Immutable |
| `userId` | UUID | Yes | ユーザー ID | Foreign Key → User.id, ON DELETE CASCADE |
| `conditionName` | String | Yes | 検索条件の名前 | Max: 100 chars |
| `searchKeyword` | String | No | キーワード検索 | Max: 100 chars, Nullable |
| `tagIds` | UUID[] | No | タグフィルタ（複数選択） | Nullable, Array of Tag.id |
| `dateRangeStart` | Date | No | アップロード日付範囲（開始） | Nullable |
| `dateRangeEnd` | Date | No | アップロード日付範囲（終了） | Nullable |
| `createdAt` | DateTime | Yes | 作成日時（UTC） | Immutable |
| `updatedAt` | DateTime | Yes | 最終更新日時（UTC） | Auto-updated |

**Validation Rules**:

- `conditionName`: 空文字列不可、2～100文字
- `dateRangeStart` ≤ `dateRangeEnd` （指定時）
- 1 ユーザーあたり最大 20 条件（将来的なスケーリング考慮）

**Example**:

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "conditionName": "未処理請求書（今月）",
  "searchKeyword": null,
  "tagIds": ["tag-001", "tag-002"],
  "dateRangeStart": "2025-01-01",
  "dateRangeEnd": "2025-01-31",
  "createdAt": "2025-01-10T10:00:00Z",
  "updatedAt": "2025-01-10T10:00:00Z"
}
```

---

## Relationships

### ER Diagram (テキスト表現)

```
User (1) ────────────────── (N) Document
  │
  │ createdByUserId
  └──────────────────────────── (1) Tag (N)
                                    │
                         (N) DocumentTag (M)
                                    │
                                    └─── Document
```

### Relationship Details

| Relationship | Type | From | To | Action |
|-------------|------|------|-----|--------|
| User → Document | 1:N | uploadedByUserId | documentId | ON DELETE RESTRICT |
| User → Tag | 1:N | createdByUserId | tagId | ON DELETE RESTRICT |
| Document ↔ Tag | M:N | DocumentTag | documentId, tagId | ON DELETE CASCADE |
| User → SavedSearchCondition | 1:N | userId | userId | ON DELETE CASCADE |

---

## Data Flow

### アップロード時

```
1. ユーザーがファイルを選択
   ↓
2. Form 検証 (ファイルサイズ・形式)
   ↓
3. API /files (POST) にリクエスト
   ↓
4. Server: Document レコード作成 + ファイル保存
   ↓
5. Server: タグ情報を受け取り、DocumentTag レコード作成
   ↓
6. Client: TanStack Query キャッシュ更新 → UI 再レンダリング
```

### 検索・フィルタ時

```
1. ユーザーが検索条件入力 (キーワード、タグ、日付)
   ↓
2. URL Query Params に反映
   ↓
3. API /files (GET) に params を含めてリクエスト
   ↓
4. Server: 検索条件でフィルタ (isDeleted = false)
   ↓
5. Client: データ受信 → TanStack Query キャッシュ更新 → UI 表示
```

### 削除時

```
1. ユーザーが文書削除ボタンをクリック
   ↓
2. 確認ダイアログ表示
   ↓
3. API /files/{id} (DELETE) リクエスト
   ↓
4. Server: isDeleted = true, deletedAt = now() に更新
   ↓
5. Client: キャッシュから削除 → UI から消える
   ↓
6. [30日後] Server バッチ処理: 完全削除実行
```

---

## Indexes & Performance

**推奨インデックス** (バックエンド実装時):

```sql
-- Document
CREATE INDEX idx_document_uploaded_by_user_id ON document(uploaded_by_user_id);
CREATE INDEX idx_document_uploaded_at ON document(uploaded_at DESC);
CREATE INDEX idx_document_is_deleted_at ON document(is_deleted, deleted_at);

-- DocumentTag
CREATE INDEX idx_document_tag_document_id ON document_tag(document_id);
CREATE INDEX idx_document_tag_tag_id ON document_tag(tag_id);

-- SavedSearchCondition
CREATE INDEX idx_saved_search_user_id ON saved_search_condition(user_id);
```

---

## Frontend Type Definitions

MVP で使用する TypeScript 型定義。

```typescript
// src/domain/models/document/Document.ts
export type FileFormat = 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png';
export type DocumentStatus = 'active' | 'deleted';

export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileFormat: FileFormat;
  uploadedAt: Date;
  updatedAt: Date;
  uploadedByUserId: string;
  tags: Tag[];
  isDeleted: boolean;
  deletedAt: Date | null;
}

// src/domain/models/tag/Tag.ts
export type TagColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string;
}

// src/domain/models/search/SearchCondition.ts
export interface SearchCondition {
  keyword?: string;
  tagIds?: string[];
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  page?: number;
  limit?: number;
}

export interface SavedSearchCondition extends SearchCondition {
  id: string;
  userId: string;
  conditionName: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Summary

✅ **5 エンティティ定義完了**:
1. Document: 文書情報（ゴミ箱対応）
2. Tag: タグ（セマンティックカラー）
3. DocumentTag: 多対多関係
4. User: ユーザー（既存継承）
5. SavedSearchCondition: 検索条件保存（スキーマのみ）

✅ **関連性マッピング完了**: 1:N, M:N, ON DELETE 制約

✅ **フロント型定義ベース完成**: TypeScript インターフェース作成準備完了

👉 **Next**: API contracts を生成（OpenAPI ベース）

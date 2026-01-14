# API Contracts: 文書管理システム MVP

**Status**: MVP（P1 機能）に限定した REST API 仕様  
**Based on**: `schema/files/openapi.yaml`  
**Generated**: 2025-01-14

---

## Overview

OpenAPI 3.0 仕様に基づいた REST API コントラクト。フロントエンド実装用の詳細ドキュメント。

**Base URL**: `http://localhost:3000/api/v1`

---

## API Endpoints - MVP

### 1. Files（ファイル管理）

#### 1.1 ファイル一覧取得

```
GET /files
```

**Purpose**: アップロード済みファイルの一覧を取得（ゴミ箱除外）

**Query Parameters**:

| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `search` | string | No | ファイル名で検索（部分一致） | `search=請求書` |
| `tagIds` | string[] | No | タグ ID で絞り込み（複数指定可） | `tagIds=tag-001&tagIds=tag-002` |
| `page` | integer | No | ページ番号（1-based） | `page=1` |
| `limit` | integer | No | 1ページあたりの件数 | `limit=20` |

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "doc-001",
      "fileName": "請求書_20250110.pdf",
      "fileSize": 2048576,
      "fileFormat": "pdf",
      "uploadedAt": "2025-01-10T08:30:00Z",
      "updatedAt": "2025-01-10T08:30:00Z",
      "uploadedByUserId": "user-123",
      "uploadedByUserName": "太郎",
      "tags": [
        {
          "id": "tag-001",
          "name": "請求書",
          "color": "error"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error Cases**:
- 400: 無効な query parameter
- 401: 未認証

---

#### 1.2 ファイルアップロード

```
POST /files
Content-Type: multipart/form-data
```

**Purpose**: 新しいファイルをアップロード

**Request Body** (multipart):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | binary | Yes | アップロードするファイル（最大 10MB） |
| `tagIds` | string[] | No | タグ ID（複数指定可） |

**Example**:

```bash
curl -X POST http://localhost:3000/api/v1/files \
  -H "Authorization: Bearer <token>" \
  -F "file=@./invoice.pdf" \
  -F "tagIds=tag-001" \
  -F "tagIds=tag-002"
```

**Response** (201 Created):

```json
{
  "id": "doc-002",
  "fileName": "invoice.pdf",
  "fileSize": 2048576,
  "fileFormat": "pdf",
  "uploadedAt": "2025-01-14T10:00:00Z",
  "updatedAt": "2025-01-14T10:00:00Z",
  "uploadedByUserId": "user-123",
  "uploadedByUserName": "太郎",
  "tags": []
}
```

**Error Cases**:
- 400: ファイルサイズ超過（> 10MB）、形式が対応外、複数ファイル（> 20）
- 401: 未認証
- 409: 同名ファイルが既に存在

---

#### 1.3 ファイル詳細取得

```
GET /files/{fileId}
```

**Purpose**: 個別ファイルの詳細情報を取得（プレビュー用）

**Path Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fileId` | string | Yes | ファイル ID（UUID） |

**Response** (200 OK):

```json
{
  "id": "doc-001",
  "fileName": "請求書_20250110.pdf",
  "fileSize": 2048576,
  "fileFormat": "pdf",
  "uploadedAt": "2025-01-10T08:30:00Z",
  "updatedAt": "2025-01-10T08:30:00Z",
  "uploadedByUserId": "user-123",
  "uploadedByUserName": "太郎",
  "tags": [
    {
      "id": "tag-001",
      "name": "請求書",
      "color": "error"
    },
    {
      "id": "tag-003",
      "name": "未処理",
      "color": "warning"
    }
  ]
}
```

**Error Cases**:
- 404: ファイルが見つからない
- 401: 未認証

---

#### 1.4 ファイル更新

```
PUT /files/{fileId}
Content-Type: application/json
```

**Purpose**: ファイル名・タグを更新（内容は変更不可）

**Request Body**:

```json
{
  "fileName": "請求書_20250110_修正.pdf",
  "tagIds": ["tag-001", "tag-002", "tag-004"]
}
```

**Response** (200 OK):

```json
{
  "id": "doc-001",
  "fileName": "請求書_20250110_修正.pdf",
  "fileSize": 2048576,
  "fileFormat": "pdf",
  "uploadedAt": "2025-01-10T08:30:00Z",
  "updatedAt": "2025-01-14T11:00:00Z",
  "uploadedByUserId": "user-123",
  "uploadedByUserName": "太郎",
  "tags": [
    {
      "id": "tag-001",
      "name": "請求書",
      "color": "error"
    },
    {
      "id": "tag-002",
      "name": "未処理",
      "color": "warning"
    }
  ]
}
```

**Error Cases**:
- 400: 無効な request body
- 404: ファイルが見つからない
- 401: 未認証

---

#### 1.5 ファイル削除（ゴミ箱移動）

```
DELETE /files/{fileId}
```

**Purpose**: ファイルをゴミ箱に移動（論理削除）

**Response** (204 No Content):

（ボディなし）

**Error Cases**:
- 404: ファイルが見つからない
- 401: 未認証

---

#### 1.6 ファイルダウンロード

```
GET /files/{fileId}/download
```

**Purpose**: ファイルの元データをダウンロード

**Response** (200 OK):

```
Content-Type: application/pdf (またはファイル形式に応じた MIME type)
Content-Disposition: attachment; filename="請求書_20250110.pdf"
Content-Length: 2048576

[バイナリデータ]
```

**Error Cases**:
- 404: ファイルが見つからない
- 401: 未認証

---

### 2. Tags（タグ管理）

#### 2.1 タグ一覧取得

```
GET /tags
```

**Purpose**: システムに登録済みのすべてのタグを取得

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "tag-001",
      "name": "請求書",
      "color": "error",
      "createdAt": "2025-01-05T14:20:00Z",
      "updatedAt": "2025-01-05T14:20:00Z",
      "createdByUserId": "user-123"
    },
    {
      "id": "tag-002",
      "name": "契約書",
      "color": "primary",
      "createdAt": "2025-01-05T14:25:00Z",
      "updatedAt": "2025-01-05T14:25:00Z",
      "createdByUserId": "user-123"
    }
  ]
}
```

**Error Cases**:
- 401: 未認証

---

#### 2.2 タグ作成

```
POST /tags
Content-Type: application/json
```

**Purpose**: 新しいタグを作成（管理者のみ）

**Request Body**:

```json
{
  "name": "緊急",
  "color": "warning"
}
```

**Color Options**:
- `"primary"` - Material-UI Blue
- `"secondary"` - Material-UI Purple
- `"error"` - Material-UI Red
- `"success"` - Material-UI Green
- `"warning"` - Material-UI Orange
- `"info"` - Material-UI Cyan

**Response** (201 Created):

```json
{
  "id": "tag-005",
  "name": "緊急",
  "color": "warning",
  "createdAt": "2025-01-14T10:30:00Z",
  "updatedAt": "2025-01-14T10:30:00Z",
  "createdByUserId": "user-123"
}
```

**Error Cases**:
- 400: 無効な request body（重複タグ名等）
- 401: 未認証
- 403: 管理者権限がない

---

#### 2.3 タグ更新

```
PUT /tags/{tagId}
Content-Type: application/json
```

**Purpose**: タグ名・色を更新（管理者のみ）

**Request Body**:

```json
{
  "name": "最優先",
  "color": "error"
}
```

**Response** (200 OK):

```json
{
  "id": "tag-005",
  "name": "最優先",
  "color": "error",
  "createdAt": "2025-01-14T10:30:00Z",
  "updatedAt": "2025-01-14T10:45:00Z",
  "createdByUserId": "user-123"
}
```

**Error Cases**:
- 400: 無効な request body
- 404: タグが見つからない
- 401: 未認証
- 403: 管理者権限がない

---

#### 2.4 タグ削除

```
DELETE /tags/{tagId}
```

**Purpose**: タグを削除（関連する DocumentTag も削除、管理者のみ）

**Response** (204 No Content):

（ボディなし）

**Error Cases**:
- 404: タグが見つからない
- 401: 未認証
- 403: 管理者権限がない

---

## Authentication & Authorization

**Header**: 

```
Authorization: Bearer <JWT_TOKEN>
```

**Token Source**: 既存の 001-user-auth 認証エンドポイント から取得

**Validation**:
- JWT 署名検証
- トークン有効期限チェック
- User role チェック (タグ管理は admin のみ)

---

## Error Response Format

すべてのエラーレスポンスは統一フォーマット:

```json
{
  "error": {
    "code": "INVALID_FILE_SIZE",
    "message": "File size exceeds maximum limit (10MB)",
    "details": {
      "maxSize": "10MB",
      "providedSize": "15MB"
    }
  }
}
```

**Common Error Codes**:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_SIZE` | 400 | ファイルサイズが上限超過 |
| `UNSUPPORTED_FILE_FORMAT` | 400 | サポートされていないファイル形式 |
| `TOO_MANY_FILES` | 400 | 一度のアップロードで 20 ファイル超 |
| `DUPLICATE_FILE_NAME` | 409 | 同名ファイルが既に存在 |
| `FILE_NOT_FOUND` | 404 | ファイルが見つからない |
| `UNAUTHORIZED` | 401 | 認証なし or トークン無効 |
| `FORBIDDEN` | 403 | 権限不足（admin 権限が必要） |
| `INVALID_TAG_NAME` | 400 | タグ名が無効または重複 |
| `TAG_NOT_FOUND` | 404 | タグが見つからない |

---

## Request/Response Examples

### シナリオ 1: ファイルをドラッグ&ドロップでアップロード、タグ付け

```bash
# リクエスト
POST /files
Content-Type: multipart/form-data

file: (binary)
tagIds: tag-001
tagIds: tag-003

# レスポンス (201)
{
  "id": "doc-100",
  "fileName": "contract.pdf",
  "fileSize": 5242880,
  "fileFormat": "pdf",
  "uploadedAt": "2025-01-14T12:00:00Z",
  "updatedAt": "2025-01-14T12:00:00Z",
  "uploadedByUserId": "user-456",
  "uploadedByUserName": "花子",
  "tags": [
    { "id": "tag-001", "name": "請求書", "color": "error" },
    { "id": "tag-003", "name": "緊急", "color": "warning" }
  ]
}
```

### シナリオ 2: キーワード + タグでフィルタ検索

```bash
# リクエスト
GET /files?search=田中商事&tagIds=tag-001&tagIds=tag-002&page=1&limit=20

# レスポンス (200)
{
  "data": [
    {
      "id": "doc-050",
      "fileName": "田中商事_請求書_20250110.pdf",
      "fileSize": 1048576,
      "fileFormat": "pdf",
      "uploadedAt": "2025-01-10T09:15:00Z",
      "updatedAt": "2025-01-10T09:15:00Z",
      "uploadedByUserId": "user-123",
      "uploadedByUserName": "太郎",
      "tags": [
        { "id": "tag-001", "name": "請求書", "color": "error" },
        { "id": "tag-002", "name": "未処理", "color": "warning" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### シナリオ 3: ファイル詳細表示 → タグ編集

```bash
# リクエスト 1: 詳細取得
GET /files/doc-050

# レスポンス 1 (200)
{
  "id": "doc-050",
  "fileName": "田中商事_請求書_20250110.pdf",
  ...
}

# リクエスト 2: タグを追加
PUT /files/doc-050
Content-Type: application/json

{
  "fileName": "田中商事_請求書_20250110.pdf",
  "tagIds": ["tag-001", "tag-002", "tag-004"]
}

# レスポンス 2 (200)
{
  "id": "doc-050",
  "fileName": "田中商事_請求書_20250110.pdf",
  "tags": [
    { "id": "tag-001", "name": "請求書", "color": "error" },
    { "id": "tag-002", "name": "未処理", "color": "warning" },
    { "id": "tag-004", "name": "2025年度", "color": "primary" }
  ]
}
```

---

## Summary

✅ **MVP API 10 エンドポイント定義完了**:

**Files**:
1. GET /files - 一覧取得（検索・フィルタ・ページネーション対応）
2. POST /files - アップロード
3. GET /files/{fileId} - 詳細取得
4. PUT /files/{fileId} - 編集（ファイル名・タグ）
5. DELETE /files/{fileId} - 削除
6. GET /files/{fileId}/download - ダウンロード

**Tags**:
7. GET /tags - 一覧取得
8. POST /tags - 作成（admin のみ）
9. PUT /tags/{tagId} - 更新（admin のみ）
10. DELETE /tags/{tagId} - 削除（admin のみ）

✅ **エラーハンドリング**: 統一フォーマット + コード定義

✅ **認証**: JWT Bearer token（既存 001-user-auth を継承）

👉 **Next**: quickstart.md でセットアップガイド作成

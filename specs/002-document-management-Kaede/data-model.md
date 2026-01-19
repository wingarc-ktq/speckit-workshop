# Data Model: 文書管理システム

**Date**: 2025-01-14  
**Feature**: 文書管理システム

## Entities

### Document (文書)

**Attributes**:
- id: string (ファイルID)
- name: string (ファイル名, 1-255文字)
- size: number (ファイルサイズ, bytes)
- mimeType: string (MIMEタイプ)
- description?: string (説明, max 500文字)
- uploadedAt: DateTime (アップロード日時)
- downloadUrl: string (ダウンロードURL)
- tagIds: string[] (タグID配列)
- isDeleted: boolean (ゴミ箱に移動しているか)
- deletedAt?: DateTime (削除日時)

**Relationships**:
- Many-to-Many with Tag (via tagIds)

**Validation Rules**:
- name: required, 1-255 chars
- size: <= 10MB
- mimeType: PDF, DOCX, XLSX, JPG, PNG only
- uploadedAt: auto-generated

**State Transitions**:
- Created → Active (default)
- Active → Deleted (soft delete, move to trash)
- Deleted → Restored (from trash)
- Deleted → Permanently Deleted (after 30 days)

**State Transitions**:
- Created → Active
- Active → Deleted (soft delete / move to trash)
- Deleted → Active (restore)
- Deleted → Permanently Deleted (after 30 days)


### Tag (タグ)

**Attributes**:
- id: string (タグID)
- name: string (タグ名, 1-50文字)
- color: TagColor (blue|red|yellow|green|purple|orange|gray)
- createdAt: DateTime (作成日時)
- updatedAt: DateTime (更新日時)

**Relationships**:
- Many-to-Many with Document

**Validation Rules**:
- name: required, unique, 1-50 chars
- color: required, enum values

**Business Rules**:
- Tags can be created by users
- Tags can be renamed and recolored
- Tags cannot be deleted if used by documents (warning required)

### User (ユーザー) - Existing

**Attributes**: (from 001-user-auth)
- id: string
- name: string
- email: string
- role: 'admin' | 'user'

**Relationships**:
- One-to-Many with Document (uploadedBy)

## Data Flow

### File Upload Flow
1. User selects/drops files
2. Client validates (size, type)
3. API call: POST /files (multipart/form-data)
4. Server stores file, creates Document record
5. Response: FileInfo with downloadUrl

### Search Flow
1. User enters query or selects filters
2. Client debounces (300ms)
3. API call: GET /files?search=...&tagIds=...
4. Server queries documents with full-text search
5. Response: paginated FileList

### Tag Management Flow
1. User creates/edits tag
2. API call: POST/PUT /tags
3. Server validates uniqueness
4. Response: TagInfo

### Trash Flow
1. User deletes a document
2. Document is marked as isDeleted = true
3. Document disappears from normal list
4. User opens Trash page
5. User restores or permanently deletes the document


## Constraints

- Documents: max 100 per user initially
- Tags: max 50 per user
- File types: PDF, DOCX, XLSX, JPG, PNG
- File size: max 10MB per file
- Concurrent uploads: max 20 files

## Indexes (Backend)

- Documents: uploadedAt DESC, name ASC
- Documents: full-text on name and description
- Tags: name ASC
- DocumentTags: document_id, tag_id (composite)</content>
<parameter name="filePath">/home/kaepo/speckit-workshop/specs/002-document-management-Kaede/data-model.md
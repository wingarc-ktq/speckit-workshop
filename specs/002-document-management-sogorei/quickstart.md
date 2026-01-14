# Quickstart: 文書管理システム MVP 実装ガイド

**Date**: 2025-01-14  
**Target**: React + TypeScript + Material-UI フロントエンド  
**Scope**: MVP（P1 機能）実装

---

## 🎯 実装の全体像

### ディレクトリ構成（既存を踏襲）

```
src/
├── domain/                    # ビジネスロジック・モデル
│   ├── models/
│   │   ├── document/
│   │   │   ├── Document.ts
│   │   │   └── DocumentError.ts
│   │   ├── tag/
│   │   │   └── Tag.ts
│   │   └── search/
│   │       └── SearchCondition.ts
│   └── errors/
│       ├── DocumentException.ts
│       └── FileUploadException.ts
│
├── adapters/                  # API クライアント・リポジトリ
│   ├── generated/             # Orval 自動生成
│   │   └── files.ts           # OpenAPI コード生成（crud 操作）
│   ├── mocks/
│   │   └── handlers/
│   │       └── fileHandlers.ts  # MSW ハンドラー
│   └── repositories/
│       ├── DocumentRepository.ts
│       └── TagRepository.ts
│
├── app/                       # アプリケーション層
│   ├── router/
│   │   └── routes.tsx         # 文書管理ルート追加
│   └── providers/
│       └── (既存のプロバイダー)
│
└── presentations/             # UI コンポーネント
    ├── components/
    │   ├── files/
    │   │   ├── FileUploadArea.tsx        # ドラッグ&ドロップ
    │   │   ├── FileList.tsx              # リスト表示
    │   │   ├── FileGridView.tsx          # グリッド表示
    │   │   └── FileDetailsModal.tsx      # 詳細モーダル
    │   ├── tags/
    │   │   ├── TagChip.tsx
    │   │   ├── TagSelector.tsx
    │   │   └── TagManagement.tsx         # タグ管理（Admin）
    │   └── search/
    │       └── SearchBar.tsx
    ├── hooks/
    │   ├── queries/
    │   │   └── useDocuments.ts           # TanStack Query
    │   └── mutations/
    │       └── useFileUpload.ts
    ├── pages/
    │   └── DocumentManagementPage.tsx    # メインページ
    └── layouts/
        └── (既存のレイアウト)
```

---

## 📦 依存関係の追加

### インストールするパッケージ

```bash
pnpm add react-pdf@^8.0.0 react-dropzone@^14.2.0
```

**理由**:
- `react-pdf`: PDF プレビュー機能
- `react-dropzone`: ドラッグ&ドロップ UI + バリデーション

※ 以下は既に存在:
- `react-hook-form`, `zod`, `@tanstack/react-query`, `@mui/material`, `axios`

---

## 🏗️ Step-by-Step 実装フロー

### Phase 1: Domain Model 定義

#### Step 1-1: Document エンティティ定義

```typescript
// src/domain/models/document/Document.ts
export type FileFormat = 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png';

export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileFormat: FileFormat;
  uploadedAt: Date;
  updatedAt: Date;
  uploadedByUserId: string;
  uploadedByUserName?: string;
  tags: Tag[];
  isDeleted: boolean;
  deletedAt: Date | null;
}

// バリデーション定義
export const DocumentSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileFormat: z.enum(['pdf', 'docx', 'xlsx', 'jpg', 'png']),
  fileSize: z.number().min(1).max(10485760), // 10MB
  tags: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    color: z.enum(['primary', 'secondary', 'error', 'success', 'warning', 'info']),
  })).optional(),
});
```

#### Step 1-2: Tag エンティティ定義

```typescript
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

export const TagSchema = z.object({
  name: z.string().min(2).max(50),
  color: z.enum(['primary', 'secondary', 'error', 'success', 'warning', 'info']),
});
```

#### Step 1-3: エラー型定義

```typescript
// src/domain/errors/FileUploadException.ts
export class FileUploadException extends ApplicationException {
  constructor(
    public readonly code: 'INVALID_FILE_SIZE' | 'UNSUPPORTED_FORMAT' | 'TOO_MANY_FILES',
    message: string,
  ) {
    super(message);
    this.name = 'FileUploadException';
  }
}
```

---

### Phase 2: API クライアント生成 & リポジトリ

#### Step 2-1: OpenAPI スペック確認

```bash
# 既存のスペックファイル確認
cat schema/files/openapi.yaml
```

#### Step 2-2: Orval で自動生成（既存の `pnpm gen:api` コマンドで実行）

```bash
pnpm gen:api
```

生成されるファイル:
- `src/adapters/generated/files.ts` - API クライアント型定義
- MSW ハンドラーも自動生成

#### Step 2-3: リポジトリ層の実装

```typescript
// src/adapters/repositories/DocumentRepository.ts
import { getFiles, uploadFile, getFileById, updateFile, deleteFile, downloadFile } from '@/adapters/generated/files';

export interface IDocumentRepository {
  list(params: { search?: string; tagIds?: string[]; page?: number; limit?: number }): Promise<{ data: Document[]; pagination: Pagination }>;
  upload(file: File, tagIds?: string[]): Promise<Document>;
  getById(id: string): Promise<Document>;
  update(id: string, data: { fileName?: string; tagIds?: string[] }): Promise<Document>;
  delete(id: string): Promise<void>;
  download(id: string): Promise<Blob>;
}

export class DocumentRepository implements IDocumentRepository {
  async list(params) {
    const response = await getFiles(params);
    return response;
  }

  async upload(file: File, tagIds?: string[]) {
    const formData = new FormData();
    formData.append('file', file);
    tagIds?.forEach(id => formData.append('tagIds', id));
    
    return uploadFile({ body: formData });
  }

  // ... 他のメソッド実装
}
```

---

### Phase 3: React Hooks（Queries & Mutations）

#### Step 3-1: ドキュメント取得 Hook

```typescript
// src/presentations/hooks/queries/useDocuments.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useDocumentRepository } from '@/adapters/repositories';

interface UseDocumentsOptions {
  search?: string;
  tagIds?: string[];
  page?: number;
  limit?: number;
}

export const useDocuments = (
  options: UseDocumentsOptions = {}
): UseQueryResult<{ data: Document[]; pagination: Pagination }, Error> => {
  const repo = useDocumentRepository();

  return useQuery({
    queryKey: ['documents', options],
    queryFn: ({ signal }) => repo.list({ ...options, signal }),
  });
};
```

#### Step 3-2: ファイルアップロード Mutation

```typescript
// src/presentations/hooks/mutations/useFileUpload.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDocumentRepository } from '@/adapters/repositories';

export const useFileUpload = () => {
  const repo = useDocumentRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, tagIds }: { file: File; tagIds?: string[] }) =>
      repo.upload(file, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
```

---

### Phase 4: UI コンポーネント実装

#### Step 4-1: ファイルアップロードエリア

```typescript
// src/presentations/components/files/FileUploadArea.tsx
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFilesSelected }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // 検証（ファイルサイズ・形式）
      const validFiles = acceptedFiles.filter(file => {
        if (file.size > 10485760) {
          // エラー表示
          return false;
        }
        return true;
      });
      onFilesSelected(validFiles);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? '#f5f5f5' : 'transparent',
        border: '2px dashed #ccc',
        transition: 'all 0.3s',
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
      <Typography variant="h6">
        {isDragActive ? 'ファイルをドロップ' : 'ファイルをドラッグ&ドロップ'}
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }}>
        ファイルを選択
      </Button>
    </Paper>
  );
};
```

#### Step 4-2: ファイル一覧表示（リスト）

```typescript
// src/presentations/components/files/FileList.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Chip, Box } from '@mui/material';
import { Document } from '@/domain/models/document/Document';

interface FileListProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
}

export const FileList: React.FC<FileListProps> = ({ documents, onSelectDocument }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ファイル名</TableCell>
          <TableCell align="right">サイズ</TableCell>
          <TableCell>タグ</TableCell>
          <TableCell>アップロード日時</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {documents.map(doc => (
          <TableRow
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <TableCell>{doc.fileName}</TableCell>
            <TableCell align="right">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {doc.tags.map(tag => (
                  <Chip key={tag.id} label={tag.name} color={tag.color} size="small" />
                ))}
              </Box>
            </TableCell>
            <TableCell>{new Date(doc.uploadedAt).toLocaleString('ja-JP')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

#### Step 4-3: ファイル詳細モーダル + プレビュー

```typescript
// src/presentations/components/files/FileDetailsModal.tsx
import React, { Suspense } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Skeleton } from '@mui/material';
import { Document } from '@/domain/models/document/Document';
import { PDFViewer } from './PDFViewer';

interface FileDetailsModalProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
}

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({ document, open, onClose }) => {
  if (!document) return null;

  const isPdf = document.fileFormat === 'pdf';
  const isImage = ['jpg', 'png'].includes(document.fileFormat);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{document.fileName}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Suspense fallback={<Skeleton height={400} />}>
            {isPdf && <PDFViewer fileId={document.id} />}
            {isImage && <img src={`/api/v1/files/${document.id}/download`} alt={document.fileName} style={{ maxWidth: '100%' }} />}
          </Suspense>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        <Button
          variant="contained"
          onClick={() => {
            // ダウンロード処理
          }}
        >
          ダウンロード
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

#### Step 4-4: 検索バー + フィルタ

```typescript
// src/presentations/components/search/SearchBar.tsx
import React from 'react';
import { Box, TextField, Button, Select, MenuItem, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDocuments } from '@/presentations/hooks/queries/useDocuments';

interface SearchBarProps {
  onSearch: (search: string, tagIds: string[]) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [search, setSearch] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const { data: tagsData } = useDocuments(); // タグ情報取得

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        placeholder="ファイル名で検索"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onSearch(search, selectedTags);
          }
        }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1 }} />,
        }}
      />
      <Select
        multiple
        value={selectedTags}
        onChange={(e) => setSelectedTags(e.target.value)}
        placeholder="タグで絞り込み"
      >
        {/* タグ選択肢を動的に表示 */}
      </Select>
      <Button variant="contained" onClick={() => onSearch(search, selectedTags)}>
        検索
      </Button>
    </Box>
  );
};
```

---

### Phase 5: ページ・ルーティング統合

#### Step 5-1: ドキュメント管理ページ

```typescript
// src/presentations/pages/DocumentManagementPage.tsx
import React, { useState } from 'react';
import { Box, Container, Button, Tabs, Tab, Pagination } from '@mui/material';
import { FileUploadArea } from '@/presentations/components/files/FileUploadArea';
import { FileList } from '@/presentations/components/files/FileList';
import { FileDetailsModal } from '@/presentations/components/files/FileDetailsModal';
import { SearchBar } from '@/presentations/components/search/SearchBar';
import { useDocuments } from '@/presentations/hooks/queries/useDocuments';
import { useFileUpload } from '@/presentations/hooks/mutations/useFileUpload';
import { Document } from '@/domain/models/document/Document';

export const DocumentManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ search: '', tagIds: [], page: 1 });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { data, isLoading } = useDocuments(searchParams);
  const { mutate: uploadFile } = useFileUpload();

  const handleSearch = (search: string, tagIds: string[]) => {
    setSearchParams({ search, tagIds, page: 1 });
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      uploadFile({ file, tagIds: [] }); // タグ選択 UI 追加予定
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <FileUploadArea onFilesSelected={handleFileUpload} />
      
      <SearchBar onSearch={handleSearch} />

      <Tabs value={viewMode} onChange={(_, v) => setViewMode(v)}>
        <Tab value="list" label="リストビュー" />
        <Tab value="grid" label="グリッドビュー" />
      </Tabs>

      {viewMode === 'list' && (
        <FileList
          documents={data?.data || []}
          onSelectDocument={setSelectedDocument}
        />
      )}

      <Pagination
        count={data?.pagination.totalPages || 1}
        page={searchParams.page}
        onChange={(_, page) => setSearchParams({ ...searchParams, page })}
        sx={{ mt: 2 }}
      />

      <FileDetailsModal
        document={selectedDocument}
        open={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </Container>
  );
};
```

#### Step 5-2: ルーティング統合

```typescript
// src/app/router/routes.tsx に追加
import { DocumentManagementPage } from '@/presentations/pages/DocumentManagementPage';

const routes = [
  {
    path: '/documents',
    element: <DocumentManagementPage />,
  },
  // ...既存のルート
];
```

---

## 🧪 テスト実装パターン

### Component Test (React Testing Library)

```typescript
// src/presentations/components/files/FileUploadArea.test.tsx
import { render, screen } from '@testing-library/react';
import { FileUploadArea } from './FileUploadArea';

describe('FileUploadArea', () => {
  it('should render upload area with drag&drop prompt', () => {
    render(<FileUploadArea onFilesSelected={vi.fn()} />);
    expect(screen.getByText(/ドラッグ&ドロップ/i)).toBeInTheDocument();
  });

  it('should accept pdf, docx, xlsx, jpg, png files', () => {
    // TODO: ドラッグテスト実装
  });
});
```

### E2E Test (Playwright)

```typescript
// playwright/tests/specs/document-management/upload.spec.ts
import { test, expect } from '@playwright/test';

test('User can upload document with tags', async ({ page }) => {
  await page.goto('/documents');

  // ファイル選択
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-file.pdf');

  // タグ選択
  await page.click('[data-testid="tag-selector"]');
  await page.click('text=請求書');

  // アップロード実行
  await page.click('button:has-text("アップロード")');

  // ファイルが一覧に表示されることを確認
  await expect(page.locator('text=test-file.pdf')).toBeVisible();
});
```

---

## 📝 開発チェックリスト

### Phase 1: 基本機能実装

- [ ] Domain Model 定義（Document, Tag, SearchCondition）
- [ ] API リポジトリ実装
- [ ] TanStack Query Hooks 実装
- [ ] FileUploadArea コンポーネント
- [ ] FileList コンポーネント
- [ ] 検索バー実装
- [ ] ページネーション実装
- [ ] ユニットテスト（80% 以上）

### Phase 2: 詳細機能 + ポーランド

- [ ] ファイル詳細モーダル + PDF プレビュー
- [ ] グリッドビュー実装
- [ ] タグ管理ページ（Admin）
- [ ] ゴミ箱・復元機能
- [ ] E2E テスト（Playwright）
- [ ] アクセシビリティ確認（WCAG 2.1 AA）
- [ ] レスポンシブテスト

### Phase 3: 展開準備

- [ ] パフォーマンス最適化（Lighthouse > 80）
- [ ] ブラウザ互換性テスト
- [ ] バグ修正・QA
- [ ] ドキュメント整備

---

## 🚀 実行コマンド

```bash
# 依存関係インストール
pnpm install

# API コード生成
pnpm gen:api

# 開発サーバー起動
pnpm dev

# テスト実行
pnpm test                 # ユニットテスト
pnpm test:ui             # UI テスト
pnpm test:e2e            # E2E テスト

# ESLint/Prettier
pnpm lint
pnpm format:fix
```

---

## 📚 参考資料

- [React Hook Form ドキュメント](https://react-hook-form.com/)
- [TanStack Query ドキュメント](https://tanstack.com/query/)
- [Material-UI コンポーネント](https://mui.com/components/)
- [Zod バリデーション](https://zod.dev/)
- [Playwright テスト](https://playwright.dev/)

---

## 🎯 次のステップ

✅ Quickstart 完成

👉 **Day 2 へ**: `speckit.tasks` でタスク分解 → `speckit.implement` でコンポーネント実装開始

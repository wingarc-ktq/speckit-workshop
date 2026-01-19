import { http, HttpResponse } from 'msw';
import type { Document, DocumentListResponse } from '@/domain/models/document';
import type { Tag } from '@/domain/models/tag';

/**
 * API base URL
 */
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Mock documents data store
 */
let mockDocuments: Document[] = [
  {
    id: 'doc-001',
    fileName: '請求書_20250110.pdf',
    fileSize: 2048576,
    fileFormat: 'pdf',
    uploadedAt: '2025-01-10T08:30:00Z',
    updatedAt: '2025-01-10T08:30:00Z',
    uploadedByUserId: 'user-123',
    tags: [
      {
        id: 'tag-001',
        name: '請求書',
        color: 'error',
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-10T08:00:00Z',
        createdByUserId: 'user-123',
      },
    ],
    isDeleted: false,
    deletedAt: null,
  },
  {
    id: 'doc-002',
    fileName: '契約書_20250108.docx',
    fileSize: 1024576,
    fileFormat: 'docx',
    uploadedAt: '2025-01-08T14:15:00Z',
    updatedAt: '2025-01-08T14:15:00Z',
    uploadedByUserId: 'user-456',
    tags: [
      {
        id: 'tag-002',
        name: '契約書',
        color: 'success',
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-10T08:00:00Z',
        createdByUserId: 'user-123',
      },
    ],
    isDeleted: false,
    deletedAt: null,
  },
];

/**
 * Mock tags data store
 */
let mockTags: Tag[] = [
  {
    id: 'tag-001',
    name: '請求書',
    color: 'error',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z',
    createdByUserId: 'user-123',
  },
  {
    id: 'tag-002',
    name: '契約書',
    color: 'success',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z',
    createdByUserId: 'user-123',
  },
];

/**
 * Validate file format
 */
function isValidFileFormat(fileName: string): boolean {
  const validExtensions = ['.pdf', '.docx', '.xlsx', '.jpg', '.png'];
  return validExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );
}

/**
 * Get file format from file name
 */
function getFileFormat(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const formatMap: Record<string, string> = {
    pdf: 'pdf',
    docx: 'docx',
    xlsx: 'xlsx',
    jpg: 'jpg',
    png: 'png',
  };
  return formatMap[ext] || 'unknown';
}

/**
 * GET /files - ファイル一覧取得
 */
function handleGetDocuments() {
  return http.get(`${API_BASE_URL}/files`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const tagIdsParam = url.searchParams.getAll('tagIds') || [];
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'uploadedAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Filter by isDeleted=false (exclude trash)
    let filtered = mockDocuments.filter((doc) => !doc.isDeleted);

    // Search filter
    if (search) {
      filtered = filtered.filter((doc) =>
        doc.fileName.toLowerCase().includes(search) ||
        doc.tags.some((tag: Tag) => tag.name.toLowerCase().includes(search))
      );
    }

    // Tag filter (AND logic - all selected tags must be present)
    if (tagIdsParam.length > 0) {
      filtered = filtered.filter((doc) => {
        const docTagIds = doc.tags.map((tag: Tag) => tag.id);
        return tagIdsParam.every((tagId: string) => docTagIds.includes(tagId));
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let compareA: string | number = '';
      let compareB: string | number = '';

      switch (sortBy) {
        case 'fileName':
          compareA = a.fileName;
          compareB = b.fileName;
          break;
        case 'fileSize':
          compareA = a.fileSize;
          compareB = b.fileSize;
          break;
        case 'uploadedAt':
        default:
          compareA = new Date(a.uploadedAt).getTime();
          compareB = new Date(b.uploadedAt).getTime();
      }

      if (sortOrder === 'asc') {
        return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
      } else {
        return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
      }
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const data = filtered.slice(startIdx, startIdx + limit);

    const response: DocumentListResponse = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return HttpResponse.json(response, { status: 200 });
  });
}

/**
 * POST /files - ファイルアップロード
 */
function handleUploadDocument() {
  return http.post(`${API_BASE_URL}/files`, async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const tagIds = formData.getAll('tagIds') as string[];

      // Validate file exists
      if (!file) {
        return HttpResponse.json(
          { error: 'File is required' },
          { status: 400 }
        );
      }

      // Validate file format
      if (!isValidFileFormat(file.name)) {
        return HttpResponse.json(
          {
            error: `File format not supported. Allowed formats: PDF, DOCX, XLSX, JPG, PNG`,
          },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return HttpResponse.json(
          {
            error: `File size exceeds maximum limit (10MB). Actual size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          },
          { status: 400 }
        );
      }

      // Check for duplicate file name
      const isDuplicate = mockDocuments.some(
        (doc) => doc.fileName === file.name && !doc.isDeleted
      );
      if (isDuplicate) {
        return HttpResponse.json(
          {
            error: `File with name "${file.name}" already exists`,
          },
          { status: 409 }
        );
      }

      // Create new document
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileFormat: getFileFormat(file.name) as any,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedByUserId: 'user-123', // Mock current user
        tags: mockTags.filter((tag) => tagIds.includes(tag.id)),
        isDeleted: false,
        deletedAt: null,
      };

      mockDocuments.push(newDoc);

      return HttpResponse.json(newDoc, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET /files/:id - ファイル詳細取得
 */
function handleGetDocumentById() {
  return http.get(`${API_BASE_URL}/files/:id`, ({ params }) => {
    const { id } = params;
    const doc = mockDocuments.find((d) => d.id === id);

    if (!doc) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(doc, { status: 200 });
  });
}

/**
 * GET /files/:id/download - ファイルダウンロード
 */
function handleDownloadDocument() {
  return http.get(`${API_BASE_URL}/files/:id/download`, ({ params }) => {
    const { id } = params;
    const doc = mockDocuments.find((d) => d.id === id);

    if (!doc) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const blob = new Blob(['dummy file content'], {
      type: 'application/octet-stream',
    });

    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${doc.fileName}"`,
      },
    });
  });
}

/**
 * PUT /files/:id - ファイル更新
 */
function handleUpdateDocument() {
  return http.put(`${API_BASE_URL}/files/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as any;

    const doc = mockDocuments.find((d) => d.id === id);
    if (!doc) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.fileName) {
      doc.fileName = body.fileName;
    }
    if (body.tagIds) {
      doc.tags = mockTags.filter((tag) => body.tagIds.includes(tag.id));
    }
    doc.updatedAt = new Date().toISOString();

    return HttpResponse.json(doc, { status: 200 });
  });
}

/**
 * DELETE /files/:id - ファイル削除（soft delete → ゴミ箱）
 */
function handleDeleteDocument() {
  return http.delete(`${API_BASE_URL}/files/:id`, ({ params }) => {
    const { id } = params;
    const doc = mockDocuments.find((d) => d.id === id);

    if (!doc) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Soft delete
    doc.isDeleted = true;
    doc.deletedAt = new Date().toISOString();

    return HttpResponse.json(doc, { status: 200 });
  });
}

/**
 * POST /files/:id/restore - ファイル復元
 */
function handleRestoreDocument() {
  return http.post(`${API_BASE_URL}/files/:id/restore`, ({ params }) => {
    const { id } = params;
    const doc = mockDocuments.find((d) => d.id === id);

    if (!doc) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Restore
    doc.isDeleted = false;
    doc.deletedAt = null;
    doc.updatedAt = new Date().toISOString();

    return HttpResponse.json(doc, { status: 200 });
  });
}

/**
 * GET /tags - タグ一覧取得
 */
function handleGetTags() {
  return http.get(`${API_BASE_URL}/tags`, () => {
    return HttpResponse.json(mockTags, { status: 200 });
  });
}

/**
 * POST /tags - タグ作成
 */
function handleCreateTag() {
  return http.post(`${API_BASE_URL}/tags`, async ({ request }) => {
    const body = (await request.json()) as any;

    // Validate input
    if (!body.name || body.name.length < 2 || body.name.length > 50) {
      return HttpResponse.json(
        { error: 'Tag name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    // Check for duplicate
    if (mockTags.some((tag) => tag.name === body.name)) {
      return HttpResponse.json(
        { error: `Tag with name "${body.name}" already exists` },
        { status: 409 }
      );
    }

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: body.name,
      color: body.color || 'primary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: 'user-123', // Mock current user
    };

    mockTags.push(newTag);

    return HttpResponse.json(newTag, { status: 201 });
  });
}

/**
 * PUT /tags/:id - タグ更新
 */
function handleUpdateTag() {
  return http.put(`${API_BASE_URL}/tags/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as any;

    const tag = mockTags.find((t) => t.id === id);
    if (!tag) {
      return HttpResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.name) {
      tag.name = body.name;
    }
    if (body.color) {
      tag.color = body.color;
    }
    tag.updatedAt = new Date().toISOString();

    return HttpResponse.json(tag, { status: 200 });
  });
}

/**
 * DELETE /tags/:id - タグ削除
 */
function handleDeleteTag() {
  return http.delete(`${API_BASE_URL}/tags/:id`, ({ params }) => {
    const { id } = params;
    const tagIndex = mockTags.findIndex((t) => t.id === id);

    if (tagIndex === -1) {
      return HttpResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Remove tag from all documents
    mockDocuments.forEach((doc) => {
      doc.tags = doc.tags.filter((tag: Tag) => tag.id !== id);
    });

    // Remove tag
    const deletedTag = mockTags.splice(tagIndex, 1)[0];

    return HttpResponse.json(deletedTag, { status: 200 });
  });
}

/**
 * Export all file handlers
 */
export function getFileHandlers() {
  return [
    handleGetDocuments(),
    handleUploadDocument(),
    handleGetDocumentById(),
    handleDownloadDocument(),
    handleUpdateDocument(),
    handleDeleteDocument(),
    handleRestoreDocument(),
    handleGetTags(),
    handleCreateTag(),
    handleUpdateTag(),
    handleDeleteTag(),
  ];
}

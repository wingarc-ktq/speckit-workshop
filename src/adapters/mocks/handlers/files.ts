import { faker } from '@faker-js/faker';

import {
  getBulkDeleteFilesMockHandler,
  getCreateTagMockHandler,
  getDeleteFileMockHandler,
  getDeleteTagMockHandler,
  getDownloadFileMockHandler,
  getGetFileByIdMockHandler,
  getGetFilesMockHandler,
  getGetTagsMockHandler,
  getUpdateFileMockHandler,
  getUpdateTagMockHandler,
  getUploadFileMockHandler,
  type FileListResponse,
  type TagListResponse,
} from '@/adapters/generated/files';

// Generate a stable list of mock files with meaningful tags
const MOCK_FILES_COUNT = 45; // Total number of files
const mockFiles = Array.from({ length: MOCK_FILES_COUNT }, (_, index) => {
  // Distribute tags meaningfully across files
  let tagIds: string[] = [];
  if (index % 5 === 0) {
    tagIds = ['tag-1']; // Important
  } else if (index % 5 === 1) {
    tagIds = ['tag-2']; // Work
  } else if (index % 5 === 2) {
    tagIds = ['tag-3']; // Personal
  } else if (index % 5 === 3) {
    tagIds = ['tag-2', 'tag-5']; // Work + Urgent
  } else {
    tagIds = ['tag-1', 'tag-2']; // Important + Work
  }

  return {
    id: `file-${index + 1}`,
    name: `Document_${index + 1}.pdf`,
    size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
    mimeType: 'application/pdf',
    description: faker.lorem.sentence(),
    uploadedAt: faker.date.past().toISOString(),
    downloadUrl: `/api/files/file-${index + 1}/download`,
    tagIds,
  };
});

// Custom handler for getFiles with pagination support
const getFilesWithPaginationHandler = getGetFilesMockHandler(
  (info): FileListResponse => {
    const url = new URL(info.request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = mockFiles.slice(startIndex, endIndex);

    return {
      files: paginatedFiles,
      total: MOCK_FILES_COUNT,
      page,
      limit,
    };
  }
);

// Define a stable list of mock tags with meaningful names
const mockTags = [
  {
    id: 'tag-1',
    name: '請求書',
    color: 'blue' as const,
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-2',
    name: '提案書',
    color: 'orange' as const,
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-3',
    name: '未処理',
    color: 'green' as const,
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-4',
    name: '完了',
    color: 'red' as const,
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-5',
    name: 'その他',
    color: 'gray' as const,
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
];

// Custom handler for getTags
const getTagsHandler = getGetTagsMockHandler((): TagListResponse => {
  return {
    tags: mockTags,
  };
});

export const filesHandlers = [
  // Files handlers
  getFilesWithPaginationHandler, // Custom getFiles handler with pagination
  getUploadFileMockHandler(),
  getGetFileByIdMockHandler(),
  getUpdateFileMockHandler(),
  getDeleteFileMockHandler(),
  getBulkDeleteFilesMockHandler(),
  getDownloadFileMockHandler(),
  // Tags handlers
  getTagsHandler, // Custom getTags handler with meaningful tags
  getCreateTagMockHandler(),
  getUpdateTagMockHandler(),
  getDeleteTagMockHandler(),
];

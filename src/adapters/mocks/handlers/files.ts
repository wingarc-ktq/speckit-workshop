import { faker } from '@faker-js/faker';

import { mockExtendedFileListApi } from '@/__fixtures__/files';
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
  type FileInfo,
  type FileListResponse,
  type TagListResponse,
} from '@/adapters/generated/files';

// Generate a stable list of mock files with meaningful tags
// First 5 files are from fixtures for consistency with tests
const ADDITIONAL_FILES_COUNT = 40; // Additional files count
const additionalMockFiles = Array.from(
  { length: ADDITIONAL_FILES_COUNT },
  (_, index) => {
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

    const fileIndex = index + 6; // Start from 6 since we have 5 fixed files
    return {
      id: `file-${String(fileIndex).padStart(3, '0')}`,
      name: `Document_${fileIndex}.pdf`,
      size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
      mimeType: 'application/pdf',
      description: faker.lorem.sentence(),
      uploadedAt: faker.date.past().toISOString(),
      downloadUrl: `/api/files/file-${String(fileIndex).padStart(3, '0')}/download`,
      tagIds,
    };
  }
);

const mockFiles = [...mockExtendedFileListApi, ...additionalMockFiles];

// Custom handler for getFiles with pagination and search support
const getFilesWithPaginationHandler = getGetFilesMockHandler(
  (info): FileListResponse => {
    const url = new URL(info.request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || undefined;

    // Filter files by search query
    let filteredFiles: FileInfo[] = mockFiles;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredFiles = mockFiles.filter((file) => {
        // 名前でマッチしたら早期リターン
        if (file.name.toLowerCase().includes(lowerSearch)) return true;
        // 名前でマッチしなければdescriptionをチェック
        return file.description?.toLowerCase().includes(lowerSearch) ?? false;
      });
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    return {
      files: paginatedFiles,
      total: filteredFiles.length,
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

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

import { RepositoryProvider } from '@/app/providers/RepositoryProvider';
import type { RepositoryComposition } from '@/adapters/repositories';
import { createTestQueryClient } from '@/__fixtures__/testUtils';

import { useFiles } from '../useFiles';

const mockGetFiles = vi.fn();

const createMockRepositories = (): RepositoryComposition =>
  ({
    auth: {
      getCurrentSession: vi.fn(),
      loginUser: vi.fn(),
      logoutUser: vi.fn(),
    },
    files: {
      getFiles: mockGetFiles,
      getFile: vi.fn(),
      getTags: vi.fn(),
      uploadFile: vi.fn(),
      updateFile: vi.fn(),
      deleteFile: vi.fn(),
      getTrash: vi.fn(),
      restoreFile: vi.fn(),
      permanentlyDeleteFile: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
    },
  }) as unknown as RepositoryComposition;

describe('useFiles', () => {
  const queryClient = createTestQueryClient();

  const createWrapper = (repositories: RepositoryComposition) => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider repositories={repositories}>{children}</RepositoryProvider>
      </QueryClientProvider>
    );
    return Wrapper;
  };

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    test('ファイル一覧取得成功', async () => {
      const mockData = {
        files: [
          {
            id: '1',
            name: 'test.pdf',
            size: 1024,
            mimeType: 'application/pdf',
            description: 'テストファイル',
            uploadedAt: '2026-01-01T00:00:00Z',
            downloadUrl: '/download/1',
            tagIds: ['tag1'],
          },
          {
            id: '2',
            name: 'test2.jpg',
            size: 2048,
            mimeType: 'image/jpeg',
            description: '',
            uploadedAt: '2026-01-02T00:00:00Z',
            downloadUrl: '/download/2',
            tagIds: [],
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      mockGetFiles.mockResolvedValue(mockData);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFiles(), {
        wrapper: createWrapper(repositories),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetFiles).toHaveBeenCalledWith(undefined);
    });

    test('検索フィルタリング', async () => {
      const mockData = {
        files: [
          {
            id: '1',
            name: 'search-result.pdf',
            size: 1024,
            mimeType: 'application/pdf',
            description: '',
            uploadedAt: '2026-01-01T00:00:00Z',
            downloadUrl: '/download/1',
            tagIds: [],
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockGetFiles.mockResolvedValue(mockData);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFiles({ search: 'search' }), {
        wrapper: createWrapper(repositories),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetFiles).toHaveBeenCalledWith({ search: 'search' });
    });

    test('タグフィルタリング', async () => {
      const mockData = {
        files: [
          {
            id: '1',
            name: 'tagged-file.pdf',
            size: 1024,
            mimeType: 'application/pdf',
            description: '',
            uploadedAt: '2026-01-01T00:00:00Z',
            downloadUrl: '/download/1',
            tagIds: ['tag1'],
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockGetFiles.mockResolvedValue(mockData);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFiles({ tagIds: ['tag1'] }), {
        wrapper: createWrapper(repositories),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetFiles).toHaveBeenCalledWith({ tagIds: ['tag1'] });
    });

    test('ソート動作', async () => {
      const mockData = {
        files: [
          {
            id: '2',
            name: 'b-file.pdf',
            size: 2048,
            mimeType: 'application/pdf',
            description: '',
            uploadedAt: '2026-01-02T00:00:00Z',
            downloadUrl: '/download/2',
            tagIds: [],
          },
          {
            id: '1',
            name: 'a-file.pdf',
            size: 1024,
            mimeType: 'application/pdf',
            description: '',
            uploadedAt: '2026-01-01T00:00:00Z',
            downloadUrl: '/download/1',
            tagIds: [],
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      mockGetFiles.mockResolvedValue(mockData);

      const repositories = createMockRepositories();
      const { result } = renderHook(
        () => useFiles({ sortBy: 'name', sortOrder: 'desc' }),
        { wrapper: createWrapper(repositories) },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetFiles).toHaveBeenCalledWith({ sortBy: 'name', sortOrder: 'desc' });
    });

    test('ページネーション', async () => {
      const mockData = {
        files: [
          {
            id: '21',
            name: 'page2-file.pdf',
            size: 1024,
            mimeType: 'application/pdf',
            description: '',
            uploadedAt: '2026-01-01T00:00:00Z',
            downloadUrl: '/download/21',
            tagIds: [],
          },
        ],
        total: 25,
        page: 2,
        limit: 20,
      };

      mockGetFiles.mockResolvedValue(mockData);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFiles({ page: 2, limit: 20 }), {
        wrapper: createWrapper(repositories),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetFiles).toHaveBeenCalledWith({ page: 2, limit: 20 });
    });
  });

  describe('エラーハンドリング', () => {
    test('APIエラー時にエラー状態になる', async () => {
      const error = new Error('API Error');
      mockGetFiles.mockRejectedValue(error);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFiles(), {
        wrapper: createWrapper(repositories),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });

    test('ネットワークエラー時にエラー状態になる', async () => {
      const networkError = new Error('Network Error');
      mockGetFiles.mockRejectedValue(networkError);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFiles(), {
        wrapper: createWrapper(repositories),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(networkError);
    });
  });

  describe('ローディング状態', () => {
    test('データ取得中はローディング状態になる', async () => {
      mockGetFiles.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  files: [],
                  total: 0,
                  page: 1,
                  limit: 20,
                }),
              100,
            ),
          ),
      );

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFiles(), {
        wrapper: createWrapper(repositories),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isLoading).toBe(false);
    });
  });
});

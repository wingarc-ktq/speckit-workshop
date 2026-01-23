import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

import { RepositoryProvider } from '@/app/providers/RepositoryProvider';
import type { RepositoryComposition } from '@/adapters/repositories';
import { createTestQueryClient } from '@/__fixtures__/testUtils';

import { useFileUpload } from '../useFileUpload';

const mockUploadFile = vi.fn();

const createMockRepositories = (): RepositoryComposition =>
  ({
    auth: {
      getCurrentSession: vi.fn(),
      loginUser: vi.fn(),
      logoutUser: vi.fn(),
    },
    files: {
      getFiles: vi.fn(),
      getFile: vi.fn(),
      getTags: vi.fn(),
      uploadFile: mockUploadFile,
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

describe('useFileUpload', () => {
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
    test('ファイルアップロード成功', async () => {
      const mockResponse = {
        file: {
          id: '1',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
          description: 'テストファイル',
          uploadedAt: '2026-01-01T00:00:00Z',
          downloadUrl: '/download/1',
          tagIds: [],
        },
      };

      mockUploadFile.mockResolvedValue(mockResponse);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.mutateAsync({
          file: mockFile,
          description: 'テストファイル',
        });
      });

      expect(mockUploadFile).toHaveBeenCalledWith({
        file: mockFile,
        description: 'テストファイル',
      });
      expect(result.current.isSuccess).toBe(true);
    });

    test('タグ付きアップロード', async () => {
      const mockResponse = {
        file: {
          id: '1',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
          description: '',
          uploadedAt: '2026-01-01T00:00:00Z',
          downloadUrl: '/download/1',
          tagIds: ['tag1', 'tag2'],
        },
      };

      mockUploadFile.mockResolvedValue(mockResponse);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.mutateAsync({
          file: mockFile,
          tagIds: ['tag1', 'tag2'],
        });
      });

      expect(mockUploadFile).toHaveBeenCalledWith({
        file: mockFile,
        tagIds: ['tag1', 'tag2'],
      });
      expect(result.current.isSuccess).toBe(true);
    });

    test('アップロード成功後にfilesクエリが無効化される', async () => {
      const mockResponse = {
        file: {
          id: '1',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
          description: '',
          uploadedAt: '2026-01-01T00:00:00Z',
          downloadUrl: '/download/1',
          tagIds: [],
        },
      };

      mockUploadFile.mockResolvedValue(mockResponse);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.mutateAsync({ file: mockFile });
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['files'] });
    });
  });

  describe('エラーハンドリング', () => {
    test('バリデーションエラー', async () => {
      const validationError = new Error('Invalid file type');
      mockUploadFile.mockRejectedValue(validationError);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.exe', {
        type: 'application/x-msdownload',
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ file: mockFile });
        } catch {
          // エラーを期待
        }
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(validationError);
    });

    test('ネットワークエラー', async () => {
      const networkError = new Error('Network Error');
      mockUploadFile.mockRejectedValue(networkError);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ file: mockFile });
        } catch {
          // エラーを期待
        }
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(networkError);
    });

    test('サーバーエラー', async () => {
      const serverError = new Error('Internal Server Error');
      mockUploadFile.mockRejectedValue(serverError);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ file: mockFile });
        } catch {
          // エラーを期待
        }
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(serverError);
    });
  });

  describe('進捗状態の確認', () => {
    test('アップロード中はpending状態になる', async () => {
      mockUploadFile.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  file: {
                    id: '1',
                    name: 'test.pdf',
                    size: 1024,
                    mimeType: 'application/pdf',
                    description: '',
                    uploadedAt: '2026-01-01T00:00:00Z',
                    downloadUrl: '/download/1',
                    tagIds: [],
                  },
                }),
              100,
            ),
          ),
      );

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        result.current.mutate({ file: mockFile });
      });

      expect(result.current.isPending).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isPending).toBe(false);
    });

    test('アップロード完了後はsuccess状態になる', async () => {
      const mockResponse = {
        file: {
          id: '1',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
          description: '',
          uploadedAt: '2026-01-01T00:00:00Z',
          downloadUrl: '/download/1',
          tagIds: [],
        },
      };

      mockUploadFile.mockResolvedValue(mockResponse);

      const repositories = createMockRepositories();
      const { result } = renderHook(() => useFileUpload(), {
        wrapper: createWrapper(repositories),
      });

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.mutateAsync({ file: mockFile });
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockResponse);
    });
  });
});

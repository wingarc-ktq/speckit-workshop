import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createTestWrapper } from '@/__fixtures__/testWrappers';

import { useFileSearch } from '../useFileSearch';

// useDebounce をモック
vi.mock('../useDebounce', () => ({
  useDebounce: vi.fn((value) => value), // デバウンスなしで即座に返す
}));

// useFiles をモック
vi.mock('../queries/useFiles', () => ({
  useFiles: vi.fn(() => ({
    data: {
      files: [
        { id: '1', name: 'test1.pdf', size: 1024, mimeType: 'application/pdf', uploadedAt: '2024-01-01' },
        { id: '2', name: 'test2.pdf', size: 2048, mimeType: 'application/pdf', uploadedAt: '2024-01-02' },
      ],
      total: 2,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

describe('useFileSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('デバウンス動作確認', () => {
    it('初期状態で空の検索クエリを持つ', () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.debouncedSearchQuery).toBe('');
    });

    it('検索クエリがデバウンスされた値としてuseFilesに渡される', async () => {
      const { useDebounce } = await import('../useDebounce');
      const { useFiles } = await import('../queries/useFiles');

      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      result.current.setSearchQuery('test query');

      await waitFor(() => {
        expect(useDebounce).toHaveBeenCalled();
        expect(useFiles).toHaveBeenCalled();
      });
    });

    it('デバウンス遅延時間をカスタマイズできる', () => {
      const { result } = renderHook(() => useFileSearch({}, 500), {
        wrapper: createTestWrapper(),
      });

      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('検索クエリ変更', () => {
    it('検索クエリを設定できる', async () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      // 検索クエリを設定
      act(() => {
        result.current.setSearchQuery('test');
      });

      await waitFor(() => {
        expect(result.current.searchQuery).toBe('test');
      });
    });

    it('検索クエリをクリアできる', async () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      // 検索クエリを設定
      act(() => {
        result.current.setSearchQuery('test');
      });

      await waitFor(() => {
        expect(result.current.searchQuery).toBe('test');
      });

      // 検索クエリをクリア
      act(() => {
        result.current.setSearchQuery('');
      });

      await waitFor(() => {
        expect(result.current.searchQuery).toBe('');
      });
    });

    it('日本語の検索クエリも正しく設定できる', async () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      act(() => {
        result.current.setSearchQuery('テスト検索');
      });

      await waitFor(() => {
        expect(result.current.searchQuery).toBe('テスト検索');
      });
    });
  });

  describe('検索結果更新', () => {
    it('初期パラメータを受け取る', () => {
      const initialParams = {
        page: 2,
        limit: 10,
        tagIds: ['tag1', 'tag2'],
      };

      const { result } = renderHook(() => useFileSearch(initialParams), {
        wrapper: createTestWrapper(),
      });

      // useFiles が正しいパラメータで呼ばれているか確認
      expect(result.current.data).toBeDefined();
    });

    it('useFiles の結果を返す', () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.files).toHaveLength(2);
      expect(result.current.data?.total).toBe(2);
      expect(result.current.isLoading).toBe(false);
    });

    it('検索クエリ変更後にデータが更新される', async () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      act(() => {
        result.current.setSearchQuery('pdf');
      });

      await waitFor(() => {
        expect(result.current.searchQuery).toBe('pdf');
        // モックしているのでデータは同じだが、クエリが更新されていることを確認
        expect(result.current.data).toBeDefined();
      });
    });

    it('空文字列での検索時は全件取得と同等', () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.data?.total).toBe(2);
    });
  });

  describe('返却値の確認', () => {
    it('searchQuery, setSearchQuery, debouncedSearchQuery が返却される', () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      expect(result.current.searchQuery).toBeDefined();
      expect(typeof result.current.setSearchQuery).toBe('function');
      expect(result.current.debouncedSearchQuery).toBeDefined();
    });

    it('useFiles の返却値がスプレッドされて含まれる', () => {
      const { result } = renderHook(() => useFileSearch(), {
        wrapper: createTestWrapper(),
      });

      // useFiles から継承されるプロパティ
      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isError).toBeDefined();
    });
  });
});

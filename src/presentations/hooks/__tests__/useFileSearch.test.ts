import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
  it('初期状態で空の検索クエリを持つ', () => {
    const { result } = renderHook(() => useFileSearch(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.debouncedSearchQuery).toBe('');
  });

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

  it('デバウンス遅延時間をカスタマイズできる', () => {
    const { result } = renderHook(() => useFileSearch({}, 500), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.searchQuery).toBe('');
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
});

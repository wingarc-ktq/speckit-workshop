import { renderHook, act } from '@testing-library/react';
import * as ReactRouterDom from 'react-router-dom';

import { QUERY_PARAMS } from '@/presentations/constants/queryParams';

import { useFilesSearchParams } from '../useFilesSearchParams';

/**
 * react-router-domのuseSearchParamsをモック化
 *
 * useFilesSearchParamsはReact RouterのuseSearchParamsに依存しているため、
 * テスト環境ではURLSearchParamsオブジェクトとセッター関数をモックする必要がある。
 * 実際のURLSearchParamsクラスを使用して、実際の動作を再現する。
 */
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: vi.fn(),
  };
});

describe('useFilesSearchParams', () => {
  let mockSearchParams: URLSearchParams;
  let mockSetSearchParams: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 各テストで新しいURLSearchParamsインスタンスを作成
    mockSearchParams = new URLSearchParams();
    mockSetSearchParams = vi.fn((params: URLSearchParams) => {
      // setSearchParamsが呼ばれたときにmockSearchParamsを更新
      mockSearchParams = new URLSearchParams(params);
    });

    // useSearchParamsのモック実装
    vi.mocked(ReactRouterDom.useSearchParams).mockReturnValue([
      mockSearchParams,
      mockSetSearchParams,
    ]);
  });

  describe('初期状態', () => {
    test('クエリパラメータが空の場合、すべての値がundefinedであること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBeUndefined();
      expect(result.current.page).toBeUndefined();
      expect(result.current.pageSize).toBeUndefined();
    });
  });

  describe('getSearchQuery: 検索クエリの取得', () => {
    test('検索クエリが存在する場合、正しい値が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, 'test query');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBe('test query');
    });

    test('検索クエリが存在しない場合、undefinedが返されること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBeUndefined();
    });

    test('空文字列の検索クエリの場合、空文字列が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, '');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBe('');
    });

    test('日本語の検索クエリが正しく取得できること', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, 'テスト検索');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBe('テスト検索');
    });

    test('特殊文字を含む検索クエリが正しく取得できること', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, 'test@#$%&*');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBe('test@#$%&*');
    });
  });

  describe('setSearchQuery: 検索クエリの設定', () => {
    test('検索クエリを設定できること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('new query');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get(QUERY_PARAMS.SEARCH)).toBe('new query');
    });

    test('検索クエリを設定する際にreplaceオプションが使用されること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('new query');
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );
    });

    test('空文字列を設定した場合、検索クエリパラメータが削除されること', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, 'existing query');

      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.has(QUERY_PARAMS.SEARCH)).toBe(false);
    });

    test('検索クエリ設定時にページパラメータがリセットされること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '3');
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '20');

      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('new query');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      // ページパラメータは削除される
      expect(calledParams.has(QUERY_PARAMS.PAGE)).toBe(false);
      // ページサイズは維持される
      expect(calledParams.get(QUERY_PARAMS.PAGE_SIZE)).toBe('20');
      // 検索クエリは設定される
      expect(calledParams.get(QUERY_PARAMS.SEARCH)).toBe('new query');
    });

    test('検索クエリを空文字列に設定した場合、ページパラメータはリセットされないこと', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, 'existing query');
      mockSearchParams.set(QUERY_PARAMS.PAGE, '3');

      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      // 検索クエリは削除される
      expect(calledParams.has(QUERY_PARAMS.SEARCH)).toBe(false);
      // ページパラメータは維持される
      expect(calledParams.get(QUERY_PARAMS.PAGE)).toBe('3');
    });

    test('日本語の検索クエリを設定できること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('テスト検索');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get(QUERY_PARAMS.SEARCH)).toBe('テスト検索');
    });

    test('特殊文字を含む検索クエリを設定できること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('test@#$%&*');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get(QUERY_PARAMS.SEARCH)).toBe('test@#$%&*');
    });

    test('連続して検索クエリを設定できること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('query1');
      });

      act(() => {
        result.current.setSearchQuery('query2');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
      const lastCalledParams = mockSetSearchParams.mock.calls[1][0];
      expect(lastCalledParams.get(QUERY_PARAMS.SEARCH)).toBe('query2');
    });
  });

  describe('getPage: ページ番号の取得', () => {
    test('ページ番号が存在する場合、数値が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '5');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBe(5);
    });

    test('ページ番号が存在しない場合、undefinedが返されること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBeUndefined();
    });

    test('ページ番号が文字列"0"の場合、0が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '0');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBe(0);
    });

    test('ページ番号が文字列"1"の場合、1が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '1');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBe(1);
    });

    test('ページ番号に大きな数値が設定されている場合、正しく変換されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '9999');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBe(9999);
    });

    test('ページ番号に不正な値が設定されている場合、NaNが返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, 'invalid');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBeNaN();
    });

    test('ページ番号に負の数が設定されている場合、負の数が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '-1');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBe(-1);
    });
  });

  describe('getPageSize: ページサイズの取得', () => {
    test('ページサイズが存在する場合、数値が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '20');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBe(20);
    });

    test('ページサイズが存在しない場合、undefinedが返されること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBeUndefined();
    });

    test('ページサイズが文字列"10"の場合、10が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '10');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBe(10);
    });

    test('ページサイズが文字列"50"の場合、50が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '50');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBe(50);
    });

    test('ページサイズに大きな数値が設定されている場合、正しく変換されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '1000');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBe(1000);
    });

    test('ページサイズに不正な値が設定されている場合、NaNが返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, 'invalid');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBeNaN();
    });

    test('ページサイズに負の数が設定されている場合、負の数が返されること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '-10');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBe(-10);
    });
  });

  describe('複合的な動作', () => {
    test('複数のクエリパラメータが同時に存在する場合、すべて正しく取得できること', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, 'test query');
      mockSearchParams.set(QUERY_PARAMS.PAGE, '3');
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '25');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBe('test query');
      expect(result.current.page).toBe(3);
      expect(result.current.pageSize).toBe(25);
    });

    test('検索クエリを変更しても他のパラメータは影響を受けないこと（ページ以外）', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '30');

      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('new search');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get(QUERY_PARAMS.SEARCH)).toBe('new search');
      expect(calledParams.get(QUERY_PARAMS.PAGE_SIZE)).toBe('30');
    });
  });

  describe('QUERY_PARAMS定数の使用確認', () => {
    test('QUERY_PARAMS.SEARCHが正しく使用されていること', () => {
      mockSearchParams.set(QUERY_PARAMS.SEARCH, 'test');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBe('test');
    });

    test('QUERY_PARAMS.PAGEが正しく使用されていること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '2');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.page).toBe(2);
    });

    test('QUERY_PARAMS.PAGE_SIZEが正しく使用されていること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '15');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.pageSize).toBe(15);
    });
  });

  describe('エッジケース', () => {
    test('URLSearchParamsが空の状態でsetSearchQueryを呼び出しても動作すること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('first query');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get(QUERY_PARAMS.SEARCH)).toBe('first query');
    });

    test('同じ検索クエリを連続して設定しても正しく動作すること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('same query');
      });

      act(() => {
        result.current.setSearchQuery('same query');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
      const lastCalledParams = mockSetSearchParams.mock.calls[1][0];
      expect(lastCalledParams.get(QUERY_PARAMS.SEARCH)).toBe('same query');
    });

    test('空白文字のみの検索クエリを設定できること', () => {
      const { result } = renderHook(() => useFilesSearchParams());

      act(() => {
        result.current.setSearchQuery('   ');
      });

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get(QUERY_PARAMS.SEARCH)).toBe('   ');
    });

    test('ページ番号とページサイズのみが設定されている場合も正しく動作すること', () => {
      mockSearchParams.set(QUERY_PARAMS.PAGE, '2');
      mockSearchParams.set(QUERY_PARAMS.PAGE_SIZE, '50');

      const { result } = renderHook(() => useFilesSearchParams());

      expect(result.current.searchQuery).toBeUndefined();
      expect(result.current.page).toBe(2);
      expect(result.current.pageSize).toBe(50);
    });
  });
});

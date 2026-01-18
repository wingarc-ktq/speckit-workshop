import { useCallback } from 'react';

import { useSearchParams } from 'react-router-dom';

import { QUERY_PARAMS } from '@/presentations/constants/queryParams';

/**
 * ファイル検索用のクエリパラメータ操作フック
 */
export function useFilesSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * 検索クエリを取得
   */
  const getSearchQuery = useCallback((): string | undefined => {
    const query = searchParams.get(QUERY_PARAMS.SEARCH);
    return query ?? undefined;
  }, [searchParams]);

  /**
   * 検索クエリを設定
   * ページ番号をリセットします
   */
  const setSearchQuery = useCallback(
    (query: string) => {
      if (query) {
        searchParams.set(QUERY_PARAMS.SEARCH, query);
        // 検索時はページをリセット
        searchParams.delete(QUERY_PARAMS.PAGE);
      } else {
        searchParams.delete(QUERY_PARAMS.SEARCH);
      }
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  /**
   * ページ番号を取得
   */
  const getPage = useCallback((): number | undefined => {
    const page = searchParams.get(QUERY_PARAMS.PAGE);
    return page ? parseInt(page, 10) : undefined;
  }, [searchParams]);

  /**
   * ページサイズを取得
   */
  const getPageSize = useCallback((): number | undefined => {
    const pageSize = searchParams.get(QUERY_PARAMS.PAGE_SIZE);
    return pageSize ? parseInt(pageSize, 10) : undefined;
  }, [searchParams]);

  return {
    searchQuery: getSearchQuery(),
    page: getPage(),
    pageSize: getPageSize(),
    setSearchQuery,
  };
}

import { useState, useCallback, useMemo } from 'react';

/**
 * 検索ロジック用フック
 */
export function useSearch(
  initialQuery: string = ''
): {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  clear: () => void;
} {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // デバウンス処理
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    clear,
  };
}

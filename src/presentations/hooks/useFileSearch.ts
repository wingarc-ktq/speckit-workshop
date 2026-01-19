import { useState } from 'react';

import type { GetFilesParams } from '@/domain/models/files';

import { useDebounce } from './useDebounce';
import { useFiles } from './queries/useFiles';

/**
 * ファイル検索フック
 * デバウンス処理を含む検索機能を提供
 */
export function useFileSearch(
  initialParams: Omit<GetFilesParams, 'search'> = {},
  debounceDelay: number = 300,
) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  const queryParams: GetFilesParams = {
    ...initialParams,
    search: debouncedSearchQuery,
  };

  const filesResult = useFiles(queryParams);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    ...filesResult,
  };
}

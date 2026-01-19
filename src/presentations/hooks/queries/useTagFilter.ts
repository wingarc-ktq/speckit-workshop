import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const TAG_PARAM_KEY = 'tagIds';

interface UseTagFilterResult {
  selectedTagIds: string[];
  setTagIds: (tagIds: string[]) => void;
  toggleTagId: (tagId: string) => void;
  clearTagIds: () => void;
}

/**
 * タグフィルターの状態を URL クエリと同期するフック
 * - tagIds クエリパラメータを配列で管理
 * - フィルタ変更時に page をリセットし、useDocuments の再フェッチを促す
 */
export function useTagFilter(): UseTagFilterResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTagIds = useMemo(() => searchParams.getAll(TAG_PARAM_KEY), [searchParams]);

  const updateSearchParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const nextParams = new URLSearchParams(searchParams);
      updater(nextParams);
      // フィルタ変更時はページをリセット
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setTagIds = useCallback(
    (tagIds: string[]) => {
      updateSearchParams((params) => {
        params.delete(TAG_PARAM_KEY);
        tagIds.forEach((id) => params.append(TAG_PARAM_KEY, id));
      });
    },
    [updateSearchParams]
  );

  const toggleTagId = useCallback(
    (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
        setTagIds(selectedTagIds.filter((id) => id !== tagId));
      } else {
        setTagIds([...selectedTagIds, tagId]);
      }
    },
    [selectedTagIds, setTagIds]
  );

  const clearTagIds = useCallback(() => {
    updateSearchParams((params) => {
      params.delete(TAG_PARAM_KEY);
    });
  }, [updateSearchParams]);

  return {
    selectedTagIds,
    setTagIds,
    toggleTagId,
    clearTagIds,
  };
}

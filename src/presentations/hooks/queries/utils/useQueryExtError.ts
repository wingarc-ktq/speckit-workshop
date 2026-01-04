import { useCallback, useEffect, useMemo, useState } from 'react';

import { checkSessionExpire } from '@/domain/utils';

import type { UseQueryResult } from '@tanstack/react-query';

/**
 * エラーを保持するuseQueryの拡張フック
 * @param queryHookResult useQueryの結果
 * @returns 拡張したuseQueryの結果
 *
 * @example
 * export const useGetWhoami = () => {
 *  const {
 *     usersCurrent: { getWhoami },
 *   } = useRepository();
 *   return useQueryExtError(
 *     useQuery({
 *       queryKey: [WHOAMI_API],
 *       queryFn: getWhoami,
 *       staleTime: Infinity,
 *     })
 *   );
 * };
 */
export const useQueryExtError = <TData, TError>(
  queryHookResult: UseQueryResult<TData, TError>
) => {
  const [storedError, setStoredError] = useState<TError | null>(null);
  const { error, ...rest } = queryHookResult;

  const resetError = useCallback(() => setStoredError(null), [setStoredError]);

  useEffect(() => {
    if (error) {
      checkSessionExpire(error);
      setStoredError(error);
    }
  }, [error, setStoredError]);

  const isError = useMemo(() => storedError != null, [storedError]);

  return {
    ...rest,
    isError,
    error: storedError,
    resetError,
  };
};

import { QueryClient } from '@tanstack/react-query';

import { HTTP_STATUS_CLIENT_ERROR } from '@/domain/constants';
import { WebApiException } from '@/domain/errors';
import { checkSessionExpire } from '@/domain/utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 10, // 10分
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        // 401エラーの場合はリトライしない
        if (
          error instanceof WebApiException &&
          error.statusCode === HTTP_STATUS_CLIENT_ERROR.UNAUTHORIZED
        ) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

// グローバルエラーハンドリング
queryClient.getQueryCache().config.onError = (error) => {
  if (checkSessionExpire(error) === true) {
    // セッションエラーの場合、全キャッシュを削除
    queryClient.clear();
  }
};

queryClient.getMutationCache().config.onError = (error) => {
  if (checkSessionExpire(error) === true) {
    // セッションエラーの場合、全キャッシュを削除
    queryClient.clear();
  }
};

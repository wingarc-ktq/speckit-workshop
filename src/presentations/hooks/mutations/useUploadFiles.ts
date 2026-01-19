import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadFile } from '@/adapters/repositories/files';
import type { UploadFileBody } from '@/adapters/generated/files';
import { QUERY_KEYS } from '../queries/constants';

interface UseUploadFilesOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * ファイルアップロードのmutationカスタムフック
 * アップロード成功時にファイル一覧を更新
 */
export const useUploadFiles = (options?: UseUploadFilesOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const body: UploadFileBody = {
        file,
      };
      return uploadFile(body);
    },
    onSuccess: () => {
      // アップロード成功時にファイル一覧キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES.LIST });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  return mutation;
};

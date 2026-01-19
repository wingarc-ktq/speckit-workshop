import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export interface UploadFileData {
  file: File;
  description?: string;
  tagIds?: string[];
}

export function useFileUpload() {
  const queryClient = useQueryClient();
  const repositories = useRepository();

  return useMutation({
    mutationFn: async (data: UploadFileData) => {
      return repositories.files.uploadFile(data);
    },
    onSuccess: () => {
      // ファイル一覧クエリを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('File upload failed:', error);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepository } from '@/app/providers/RepositoryProvider';

import type { TagColor } from '@/adapters/generated/files';

interface CreateTagParams {
  name: string;
  color: TagColor;
}

/**
 * タグ作成のためのカスタムフック
 */
export const useCreateTag = () => {
  const repositories = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTagParams) => {
      const response = await repositories.files.createTag({
        name: params.name,
        color: params.color,
      });
      return response.tag;
    },
    onSuccess: () => {
      // タグ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

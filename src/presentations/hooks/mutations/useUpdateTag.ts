import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';
import type { TagColor, TagInfo } from '@/domain/models/files';

interface UpdateTagParams {
  id: string;
  name?: string;
  color?: TagColor;
}

export const useUpdateTag = () => {
  const repositories = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, color }: UpdateTagParams): Promise<TagInfo> => {
      const response = await repositories.files.updateTag(id, { name, color });
      return response.tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

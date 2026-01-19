import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export const useDeleteTag = () => {
  const repositories = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await repositories.files.deleteTag(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

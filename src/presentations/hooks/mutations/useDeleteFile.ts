import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export function useDeleteFile() {
  const queryClient = useQueryClient();
  const repositories = useRepository();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.files.deleteFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    },
    onError: (error) => {
      console.error('File delete failed:', error);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export function useRestoreFile() {
  const queryClient = useQueryClient();
  const repositories = useRepository();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.files.restoreFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      console.error('Restore failed:', error);
    },
  });
}

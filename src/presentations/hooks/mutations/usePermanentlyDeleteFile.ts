import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export function usePermanentlyDeleteFile() {
  const queryClient = useQueryClient();
  const repositories = useRepository();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.files.permanentlyDeleteFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    },
    onError: (error) => {
      console.error('Permanent delete failed:', error);
    },
  });
}

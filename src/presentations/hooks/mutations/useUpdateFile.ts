import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export interface UpdateFileData {
  id: string;
  name?: string;
  description?: string;
  tagIds?: string[];
}

export function useUpdateFile() {
  const queryClient = useQueryClient();
  const repositories = useRepository();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateFileData) => {
      return repositories.files.updateFile(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file', variables.id] });
    },
    onError: (error) => {
      console.error('File update failed:', error);
    },
  });
}

import { useQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';
import type { GetFilesParams } from '@/domain/models/files';

export const useFiles = (params?: GetFilesParams) => {
  const {
    files: { getFiles },
  } = useRepository();

  return useQuery({
    queryKey: ['files', params],
    queryFn: () => getFiles(params),
    staleTime: 5 * 60 * 1000, // 5分
  });
};

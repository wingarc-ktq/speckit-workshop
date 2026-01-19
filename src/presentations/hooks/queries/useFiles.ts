import { useQuery } from '@tanstack/react-query';

import { getFiles } from '@/adapters/repositories/files/getFiles';
import type { GetFilesParams } from '@/domain/models/files';

export const useFiles = (params?: GetFilesParams) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => getFiles(params),
    staleTime: 5 * 60 * 1000, // 5分
  });
};

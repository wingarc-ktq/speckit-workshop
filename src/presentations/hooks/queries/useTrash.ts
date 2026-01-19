import { useQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export const useTrash = () => {
  const repositories = useRepository();

  return useQuery({
    queryKey: ['trash'],
    queryFn: () => repositories.files.getTrash(),
    staleTime: 5 * 60 * 1000,
  });
};

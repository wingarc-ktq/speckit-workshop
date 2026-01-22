import { useQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export const useTags = () => {
  const {
    files: { getTags },
  } = useRepository();

  return useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
    staleTime: 10 * 60 * 1000, // 10分
  });
};

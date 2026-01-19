import { useQuery } from '@tanstack/react-query';

import { getTags } from '@/adapters/repositories/files/getTags';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
    staleTime: 10 * 60 * 1000, // 10分
  });
};

import { useSuspenseQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

import { QUERY_KEYS } from '../constants';

export const useGetCurrentSessionQuery = () => {
  const {
    auth: { getCurrentSession },
  } = useRepository();

  return useSuspenseQuery({
    queryKey: QUERY_KEYS.AUTH.CURRENT_SESSION,
    queryFn: getCurrentSession,
  });
};

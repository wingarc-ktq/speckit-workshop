import { useMutation } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export const useLoginMutation = () => {
  const {
    auth: { loginUser },
  } = useRepository();

  return useMutation({
    mutationFn: loginUser,
  });
};

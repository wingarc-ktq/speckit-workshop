import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const {
    auth: { logoutUser },
  } = useRepository();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // ログアウト成功時に全キャッシュを削除（セキュリティ対策）
      queryClient.clear();
    },
  });
};

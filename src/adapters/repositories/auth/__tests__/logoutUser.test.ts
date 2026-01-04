import { mockLogoutResponse } from '@/__fixtures__/auth';
import { customInstance } from '@/adapters/axios';
import { AuthException, WebApiException } from '@/domain/errors';

import { logoutUser } from '../logoutUser';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('logoutUser', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にLogoutResultに変換される',
      async () => {
        mocked.mockResolvedValue(mockLogoutResponse);

        const result = await logoutUser();

        expect(result).toEqual({
          message: mockLogoutResponse.message,
        });
      }
    );

    test.concurrent('カスタムメッセージでも正常に処理される', async () => {
      const customResponse = {
        message: 'セッションが正常に終了されました',
      };
      mocked.mockResolvedValue(customResponse);

      const result = await logoutUser();

      expect(result.message).toBe(customResponse.message);
    });

    test.concurrent('空文字メッセージでも正常に処理される', async () => {
      const emptyMessageResponse = {
        message: '',
      };
      mocked.mockResolvedValue(emptyMessageResponse);

      const result = await logoutUser();

      expect(result.message).toBe('');
    });
  });

  describe('異常系', () => {
    test.concurrent('401エラーでAuthExceptionがthrowされる', async () => {
      const unauthorizedError = new WebApiException(401, 'Unauthorized', {
        message: 'Session expired',
      });
      mocked.mockRejectedValue(unauthorizedError);

      await expect(logoutUser()).rejects.toThrow(AuthException);
    });
  });
});

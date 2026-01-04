import {
  mockSessionResponse,
  mockSessionResponseVariations,
} from '@/__fixtures__/auth';
import { customInstance } from '@/adapters/axios';
import { AuthException, WebApiException } from '@/domain/errors';

import { getCurrentSession } from '../getCurrentSession';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('getCurrentSession', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にAuthSessionに変換される',
      async () => {
        mocked.mockResolvedValue(mockSessionResponse);

        const r = await getCurrentSession();

        expect(mocked).toHaveBeenCalledWith({
          method: 'GET',
          url: '/auth/session',
        });
        expect(r).toEqual({
          user: {
            id: mockSessionResponse.user.id,
            username: mockSessionResponse.user.username,
            email: mockSessionResponse.user.email,
            fullName: mockSessionResponse.user.fullName,
          },
          sessionInfo: {
            expiresAt: new Date(mockSessionResponse.sessionInfo.expiresAt),
            csrfToken: mockSessionResponse.sessionInfo.csrfToken,
          },
        });
      }
    );

    test.concurrent('fullNameがnullの場合、nullが保持される', async () => {
      const mockData = mockSessionResponseVariations.withNullFullName();
      mocked.mockResolvedValue(mockData);

      const r = await getCurrentSession();

      expect(r.user.fullName).toBeNull();
    });

    test.concurrent('fullNameがundefinedの場合、nullに変換される', async () => {
      const mockData = mockSessionResponseVariations.withUndefinedFullName();
      mocked.mockResolvedValue(mockData);

      const r = await getCurrentSession();

      expect(r.user.fullName).toBeNull();
    });

    test.concurrent(
      '日付文字列が正しくDateオブジェクトに変換される',
      async () => {
        const testDate = '2025-06-17T12:00:00.000Z';
        const mockData = mockSessionResponseVariations.withCustomDate(testDate);

        mocked.mockResolvedValue(mockData);

        const r = await getCurrentSession();

        expect(r.sessionInfo?.expiresAt).toBeInstanceOf(Date);
        expect(r.sessionInfo?.expiresAt?.toISOString()).toBe(testDate);
      }
    );
  });
  describe('準正常系', () => {
    test.concurrent('401エラーでAuthExceptionがthrowされる', async () => {
      const unauthorizedError = new WebApiException(401, 'Unauthorized', {
        message: 'Session expired',
      });
      mocked.mockRejectedValue(unauthorizedError);

      await expect(getCurrentSession()).rejects.toThrow(AuthException);
    });
  });
});

import {
  mockLoginCredentials,
  mockLoginResponse,
  mockLoginResponseVariations,
} from '@/__fixtures__/auth';
import { customInstance } from '@/adapters/axios';
import { loginUser } from '@/adapters/repositories/auth/loginUser';
import { AuthException, WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('loginUser', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にLoginResultに変換される',
      async () => {
        mocked.mockResolvedValue(mockLoginResponse);

        const result = await loginUser(mockLoginCredentials);

        expect(mocked).toHaveBeenCalledWith({
          method: 'POST',
          url: `/auth/login`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: new URLSearchParams([
            ['userId', mockLoginCredentials.userId],
            ['password', mockLoginCredentials.password],
            ['rememberMe', String(mockLoginCredentials.rememberMe)],
          ]),
        });

        expect(result).toEqual({
          message: mockLoginResponse.message,
          session: {
            user: {
              id: mockLoginResponse.data.user.id,
              username: mockLoginResponse.data.user.username,
              email: mockLoginResponse.data.user.email,
              fullName: mockLoginResponse.data.user.fullName,
            },
            sessionInfo: {
              expiresAt: new Date(
                mockLoginResponse.data.sessionInfo!.expiresAt
              ),
              csrfToken: mockLoginResponse.data.sessionInfo!.csrfToken,
            },
          },
        });
      }
    );

    test.concurrent('fullNameがnullの場合、nullが保持される', async () => {
      const mockData = mockLoginResponseVariations.withNullFullName();
      mocked.mockResolvedValue(mockData);

      const result = await loginUser(mockLoginCredentials);

      expect(result.session.user.fullName).toBeNull();
    });

    test.concurrent('fullNameがundefinedの場合、nullに変換される', async () => {
      const mockData = mockLoginResponseVariations.withUndefinedFullName();
      mocked.mockResolvedValue(mockData);

      const result = await loginUser(mockLoginCredentials);

      expect(result.session.user.fullName).toBeNull();
    });

    test.concurrent(
      'sessionInfoがundefinedの場合、undefinedが保持される',
      async () => {
        const mockData = mockLoginResponseVariations.withoutSessionInfo();
        mocked.mockResolvedValue(mockData);

        const result = await loginUser(mockLoginCredentials);

        expect(result.session.sessionInfo).toBeUndefined();
      }
    );

    test.concurrent('ユーザー名でのログインも正常に処理される', async () => {
      const usernameCredentials =
        mockLoginResponseVariations.withUsernameLogin();
      mocked.mockResolvedValue(mockLoginResponse);

      const result = await loginUser(usernameCredentials);

      expect(mocked).toHaveBeenCalledWith({
        method: 'POST',
        url: `/auth/login`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams([
          ['userId', usernameCredentials.userId],
          ['password', usernameCredentials.password],
          ['rememberMe', String(usernameCredentials.rememberMe)],
        ]),
      });

      expect(result.message).toBe(mockLoginResponse.message);
      expect(result.session.user.username).toBe(
        mockLoginResponse.data.user.username
      );
    });
  });

  describe('異常系', () => {
    test.concurrent('401エラーでAuthExceptionがthrowされる', async () => {
      const unauthorizedError = new WebApiException(401, 'Unauthorized', {
        message: 'Invalid credentials',
      });
      mocked.mockRejectedValue(unauthorizedError);

      await expect(loginUser(mockLoginCredentials)).rejects.toThrow(
        AuthException
      );
    });
  });
});

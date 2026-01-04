import { AuthException, AuthErrorCode } from '../AuthException';

describe('AuthException', () => {
  describe('コンストラクタ', () => {
    test.concurrent('すべてのプロパティが正しく設定されること', () => {
      const code = AuthErrorCode.INVALID_CREDENTIALS;
      const statusCode = 401;
      const statusText = 'Unauthorized';
      const data = { detail: 'Invalid password' };

      const error = new AuthException(code, statusCode, statusText, data);

      expect(error.code).toBe(code);
      expect(error.statusCode).toBe(statusCode);
      expect(error.statusText).toBe(statusText);
      expect(error.data).toBe(data);
      expect(error.message).toBe(statusText);
      expect(error.name).toBe('AuthException');
    });

    test.concurrent('dataを省略した場合はnullが設定されること', () => {
      const error = new AuthException(
        AuthErrorCode.NO_SESSION,
        401,
        'No session found'
      );

      expect(error.data).toBeNull();
    });
  });

  describe('staticファクトリーメソッド', () => {
    describe('invalidCredentials', () => {
      test.concurrent('無効な認証情報エラーを作成できること', () => {
        const data = { username: 'test@example.com' };
        const error = AuthException.invalidCredentials(data);

        expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
        expect(error.statusCode).toBe(401);
        expect(error.statusText).toBe('Invalid credentials');
        expect(error.data).toBe(data);
      });

      test.concurrent('dataなしで作成できること', () => {
        const error = AuthException.invalidCredentials();

        expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
        expect(error.data).toBeNull();
      });
    });

    describe('noSession', () => {
      test.concurrent('セッションなしエラーを作成できること', () => {
        const data = { redirectUrl: '/login' };
        const error = AuthException.noSession(data);

        expect(error.code).toBe(AuthErrorCode.NO_SESSION);
        expect(error.statusCode).toBe(401);
        expect(error.statusText).toBe('No session found');
        expect(error.data).toBe(data);
      });
    });

    describe('sessionExpired', () => {
      test.concurrent('セッション期限切れエラーを作成できること', () => {
        const data = { expiredAt: '2025-10-25T12:00:00Z' };
        const error = AuthException.sessionExpired(data);

        expect(error.code).toBe(AuthErrorCode.SESSION_EXPIRED);
        expect(error.statusCode).toBe(401);
        expect(error.statusText).toBe('Session expired');
        expect(error.data).toBe(data);
      });
    });

    describe('networkError', () => {
      test.concurrent('ネットワークエラーを作成できること', () => {
        const data = { originalError: 'Connection timeout' };
        const error = AuthException.networkError(data);

        expect(error.code).toBe(AuthErrorCode.NETWORK_ERROR);
        expect(error.statusCode).toBe(0);
        expect(error.statusText).toBe('Network error');
        expect(error.data).toBe(data);
      });
    });
  });

  describe('継承チェック', () => {
    test.concurrent('WebApiExceptionを継承していること', () => {
      const error = AuthException.invalidCredentials();

      // WebApiExceptionは名前付きインポートできないため、プロパティで確認
      expect(error).toHaveProperty('statusCode');
      expect(error).toHaveProperty('statusText');
      expect(error).toHaveProperty('data');
    });

    test.concurrent('Errorを継承していること', () => {
      const error = AuthException.invalidCredentials();

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('エラーコード型', () => {
    test.concurrent('すべての定義されたエラーコードが使用できること', () => {
      const codes = [
        AuthErrorCode.INVALID_CREDENTIALS,
        AuthErrorCode.NO_SESSION,
        AuthErrorCode.SESSION_EXPIRED,
        AuthErrorCode.NETWORK_ERROR,
      ] as const;

      codes.forEach((code) => {
        const error = new AuthException(code, 401, 'Test error');
        expect(error.code).toBe(code);
      });
    });
  });
});

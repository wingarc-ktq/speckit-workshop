import { WebApiException } from './WebApiException';

/**
 * 認証エラーコード
 */
export const AuthErrorCode = {
  /** 無効な認証情報 */
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  /** セッションなし */
  NO_SESSION: 'NO_SESSION',
  /** セッション期限切れ */
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  /** ネットワークエラー */
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

/**
 * 認証関連のエラー
 * @remarks
 * ログイン失敗、セッション切れ、認証エラーなどを表現する
 */
export class AuthException extends WebApiException {
  readonly code: AuthErrorCode;

  constructor(
    code: AuthErrorCode,
    statusCode: number,
    statusText: string,
    data: unknown = null
  ) {
    super(statusCode, statusText, data);
    this.code = code;
  }

  /**
   * 無効な認証情報エラーを作成
   */
  static invalidCredentials(data?: unknown): AuthException {
    return new AuthException(
      AuthErrorCode.INVALID_CREDENTIALS,
      401,
      'Invalid credentials',
      data
    );
  }

  /**
   * セッションなしエラーを作成
   */
  static noSession(data?: unknown): AuthException {
    return new AuthException(
      AuthErrorCode.NO_SESSION,
      401,
      'No session found',
      data
    );
  }

  /**
   * セッション期限切れエラーを作成
   */
  static sessionExpired(data?: unknown): AuthException {
    return new AuthException(
      AuthErrorCode.SESSION_EXPIRED,
      401,
      'Session expired',
      data
    );
  }

  /**
   * ネットワークエラーを作成
   */
  static networkError(data?: unknown): AuthException {
    return new AuthException(
      AuthErrorCode.NETWORK_ERROR,
      0,
      'Network error',
      data
    );
  }
}

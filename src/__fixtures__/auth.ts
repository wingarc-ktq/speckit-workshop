import type {
  SessionResponse,
  LoginResponse,
  LogoutResponse,
} from '@/adapters/generated/auth';
import type {
  AuthSession,
  LoginCredentials,
  LoginResult,
  LogoutResult,
} from '@/domain/models/auth';

// API レスポンス用のモックデータ
export const mockSessionResponse: SessionResponse = {
  user: {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
  },
  sessionInfo: {
    expiresAt: '2025-12-31T23:59:59Z',
    csrfToken: 'csrf-token-123',
  },
};

// ドメインモデル用のモックデータ
export const mockAuthSession: AuthSession = {
  user: {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
  },
  sessionInfo: {
    expiresAt: new Date('2025-12-31T23:59:59Z'),
    csrfToken: 'csrf-token-123',
  },
};

// よく使用されるバリエーション
export const mockSessionResponseVariations = {
  withNullFullName: (): SessionResponse => ({
    ...mockSessionResponse,
    user: {
      ...mockSessionResponse.user,
      fullName: null,
    },
  }),
  withUndefinedFullName: (): SessionResponse => ({
    ...mockSessionResponse,
    user: {
      ...mockSessionResponse.user,
      fullName: undefined,
    },
  }),
  withCustomDate: (date: string): SessionResponse => ({
    ...mockSessionResponse,
    sessionInfo: {
      ...mockSessionResponse.sessionInfo,
      expiresAt: date,
    },
  }),
};

// ログイン用のモックデータ
export const mockLoginCredentials: LoginCredentials = {
  userId: 'test@example.com',
  password: 'password123',
  rememberMe: true,
};

export const mockLoginResponse: LoginResponse = {
  message: 'ログインに成功しました',
  data: {
    user: {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
    },
    sessionInfo: {
      expiresAt: '2025-12-31T23:59:59Z',
      csrfToken: 'csrf-token-123',
    },
  },
};

export const mockLoginResult: LoginResult = {
  message: 'ログインに成功しました',
  session: {
    user: {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
    },
    sessionInfo: {
      expiresAt: new Date('2025-12-31T23:59:59Z'),
      csrfToken: 'csrf-token-123',
    },
  },
};

// ログアウト用のモックデータ
export const mockLogoutResponse: LogoutResponse = {
  message: 'ログアウトしました',
};

export const mockLogoutResult: LogoutResult = {
  message: 'ログアウトしました',
};

// ログイン関連のバリエーション
export const mockLoginResponseVariations = {
  withNullFullName: (): LoginResponse => ({
    ...mockLoginResponse,
    data: {
      ...mockLoginResponse.data,
      user: {
        ...mockLoginResponse.data.user,
        fullName: null,
      },
    },
  }),
  withUndefinedFullName: (): LoginResponse => ({
    ...mockLoginResponse,
    data: {
      ...mockLoginResponse.data,
      user: {
        ...mockLoginResponse.data.user,
        fullName: undefined,
      },
    },
  }),
  withoutSessionInfo: (): LoginResponse => ({
    ...mockLoginResponse,
    data: {
      ...mockLoginResponse.data,
      sessionInfo: undefined,
    },
  }),
  withUsernameLogin: (): LoginCredentials => ({
    userId: 'testuser',
    password: 'password123',
    rememberMe: false,
  }),
};

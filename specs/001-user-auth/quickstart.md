# Quickstart Guide: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**Target**: 開発者向け実装ガイド

## 概要

このガイドでは、ユーザー認証機能の実装手順を段階的に説明します。各ユーザーストーリー（US1-US5）を独立したタスクとして実装できるよう設計されています。

**前提条件**:

- Phase 0 (Research)完了
- OpenAPI仕様 (`schema/auth/openapi.yaml`) 確認済み
- Figmaデザイン構造分析済み

---

## 実装フェーズ

### Phase 0: セットアップ ✅

**完了済み**: 技術調査、データモデル定義、API契約定義

### Phase 1: 基盤実装（Foundational）

ドメイン層、アダプター層の基盤コードを実装します。

#### Task 1.1: エラー定義

**目的**: 認証エラーの型定義とエラークラス作成

**ファイル**:

- `src/domain/errors/AuthException.ts`

**実装内容**:

```typescript
// src/domain/errors/AuthException.ts
import { WebApiException } from './WebApiException';

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'NO_SESSION'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR';

export class AuthException extends WebApiException {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    statusCode: number
  ) {
    super(message, statusCode);
    this.name = 'AuthException';
  }
}
```

**検証**:

```bash
pnpm test src/domain/errors/__tests__/AuthException.test.ts
```

---

#### Task 1.2: Orvalでコード生成

**目的**: OpenAPI仕様からTypeScript型とAPI関数を自動生成

**コマンド**:

```bash
pnpm run gen:api:auth
```

**生成ファイル**:

- `src/adapters/generated/auth.ts`

**生成される内容**:

- `LoginRequest`, `LoginResponse`, `SessionResponse`, `ErrorResponse` 型
- `loginUser()`, `getSession()`, `logoutUser()` API関数

**検証**:

```bash
# 生成ファイルの確認
cat src/adapters/generated/auth.ts | grep "export interface"
cat src/adapters/generated/auth.ts | grep "export const"
```

---

#### Task 1.3: MSWモックハンドラー作成

**目的**: API開発前にフロントエンド開発を進めるためのモック実装

**ファイル**:

- `src/adapters/mocks/handlers/auth.ts`

**実装内容**:

```typescript
// src/adapters/mocks/handlers/auth.ts
import { http, HttpResponse, delay } from 'msw';
import {
  LoginRequest,
  LoginResponse,
  SessionResponse,
} from '../../generated/auth';

export const authHandlers = [
  // POST /api/auth/login - 成功シナリオ
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500); // ネットワーク遅延シミュレーション

    const body = await request.formData();
    const userId = body.get('userId') as string;
    const password = body.get('password') as string;

    // テストユーザー: test@example.com / password123
    if (userId === 'test@example.com' && password === 'password123') {
      return HttpResponse.json<LoginResponse>(
        {
          message: 'ログインに成功しました',
          data: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              username: 'test_user',
              email: 'test@example.com',
              fullName: 'Test User',
            },
            sessionInfo: {
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
              csrfToken: 'csrf_mock_token',
            },
          },
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': `session_id=mock_session_${Date.now()}; Path=/; HttpOnly; Secure; SameSite=Strict`,
            'X-CSRF-Token': 'csrf_mock_token',
          },
        }
      );
    }

    // 認証失敗
    return HttpResponse.json(
      {
        error: 'INVALID_CREDENTIALS',
        message: 'メールアドレス/ユーザー名またはパスワードが正しくありません',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }),

  // GET /api/auth/session - セッションチェック
  http.get('/api/auth/session', async ({ cookies }) => {
    await delay(300);

    const sessionId = cookies.session_id;

    if (sessionId?.startsWith('mock_session_')) {
      return HttpResponse.json<SessionResponse>({
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          username: 'test_user',
          email: 'test@example.com',
          fullName: 'Test User',
        },
        sessionInfo: {
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          csrfToken: 'csrf_mock_token',
        },
      });
    }

    return HttpResponse.json(
      {
        error: 'NO_SESSION',
        message: 'ログインが必要です',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', async () => {
    await delay(300);

    return HttpResponse.json(
      { message: 'ログアウトしました' },
      {
        status: 200,
        headers: {
          'Set-Cookie':
            'session_id=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
        },
      }
    );
  }),
];
```

**ハンドラー登録**:

```typescript
// src/adapters/mocks/handlers/index.ts
import { authHandlers } from './auth';

export const handlers = [
  ...authHandlers,
  // 他のハンドラー...
];
```

**検証**:

```bash
# 開発サーバー起動してブラウザでMSWログ確認
pnpm dev
```

---

#### Task 1.4: AuthRepository実装

**目的**: API呼び出しとエラー変換のリポジトリ層実装

**ファイル**:

- `src/adapters/repositories/auth/AuthRepository.ts`
- `src/adapters/repositories/auth/IAuthRepository.ts`

**実装内容**:

```typescript
// src/adapters/repositories/auth/IAuthRepository.ts
import type {
  LoginRequest,
  LoginResponse,
  SessionResponse,
} from '../../generated/auth';

export interface IAuthRepository {
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  getSession(): Promise<SessionResponse>;
}
```

```typescript
// src/adapters/repositories/auth/AuthRepository.ts
import axios from 'axios';
import { loginUser, logoutUser, getSession } from '../../generated/auth';
import { NetworkException } from '../../../domain/errors/NetworkException';
import { WebApiException } from '../../../domain/errors/WebApiException';
import { AuthException } from '../../../domain/errors/AuthException';
import type { IAuthRepository } from './IAuthRepository';
import type {
  LoginRequest,
  LoginResponse,
  SessionResponse,
} from '../../generated/auth';

export class AuthRepository implements IAuthRepository {
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await loginUser(request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          throw new NetworkException('ネットワークエラーが発生しました');
        }

        const { status, data } = error.response;

        if (status === 400 && data.error === 'INVALID_CREDENTIALS') {
          throw new AuthException(
            'INVALID_CREDENTIALS',
            'メールアドレス/ユーザー名またはパスワードが正しくありません',
            400
          );
        }

        if (status === 401) {
          throw new AuthException(data.error, data.message, 401);
        }

        throw new WebApiException(data.message, status);
      }

      throw new Error('予期しないエラーが発生しました');
    }
  }

  async logout(): Promise<void> {
    try {
      await logoutUser();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          throw new NetworkException('ネットワークエラーが発生しました');
        }

        const { status, data } = error.response;

        if (status === 401) {
          throw new AuthException(data.error, data.message, 401);
        }

        throw new WebApiException(data.message, status);
      }

      throw new Error('予期しないエラーが発生しました');
    }
  }

  async getSession(): Promise<SessionResponse> {
    try {
      const response = await getSession();
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          throw new NetworkException('ネットワークエラーが発生しました');
        }

        const { status, data } = error.response;

        if (status === 401) {
          throw new AuthException(data.error, data.message, 401);
        }

        throw new WebApiException(data.message, status);
      }

      throw new Error('予期しないエラーが発生しました');
    }
  }
}
```

**リポジトリ登録**:

```typescript
// src/adapters/repositories/repositoryComposition.ts
import { AuthRepository } from './auth/AuthRepository';

export const repositories = {
  auth: new AuthRepository(),
  // 他のリポジトリ...
} as const;
```

**検証**:

```bash
pnpm test src/adapters/repositories/auth/__tests__/AuthRepository.test.ts
```

---

#### Task 1.5: i18n翻訳キー追加

**目的**: エラーメッセージとUI文言の多言語対応

**ファイル**:

- `src/i18n/locales/ja/translation.json`
- `src/i18n/locales/en/translation.json`

**実装内容**:

```json
// src/i18n/locales/ja/translation.json
{
  "auth": {
    "login": {
      "title": "ログイン",
      "userId": "メールアドレス / ユーザー名",
      "password": "パスワード",
      "rememberMe": "ログイン状態を記録する",
      "submit": "ログイン",
      "errors": {
        "invalidCredentials": "メールアドレス/ユーザー名またはパスワードが正しくありません",
        "networkError": "ネットワークエラーが発生しました。再度お試しください",
        "sessionExpired": "セッションの有効期限が切れました。再度ログインしてください",
        "noSession": "ログインが必要です"
      }
    },
    "logout": {
      "button": "ログアウト",
      "success": "ログアウトしました"
    }
  },
  "validation": {
    "required": "{{field}}を入力してください",
    "minLength": "{{field}}は{{min}}文字以上必要です",
    "maxLength": "{{field}}は{{max}}文字以内で入力してください"
  }
}
```

```json
// src/i18n/locales/en/translation.json
{
  "auth": {
    "login": {
      "title": "Login",
      "userId": "Email / Username",
      "password": "Password",
      "rememberMe": "Remember me",
      "submit": "Login",
      "errors": {
        "invalidCredentials": "Invalid email/username or password",
        "networkError": "Network error occurred. Please try again",
        "sessionExpired": "Session expired. Please login again",
        "noSession": "Login required"
      }
    },
    "logout": {
      "button": "Logout",
      "success": "Logged out successfully"
    }
  },
  "validation": {
    "required": "{{field}} is required",
    "minLength": "{{field}} must be at least {{min}} characters",
    "maxLength": "{{field}} must be at most {{max}} characters"
  }
}
```

**検証**:

```bash
pnpm test src/i18n/__tests__/translation.test.ts
```

---

### Phase 2: User Story 1 (P1) - 基本的なログイン機能

#### Task 2.1: LoginFormスキーマ定義

**目的**: フォームバリデーションスキーマ作成

**ファイル**:

- `src/presentations/pages/LoginPage/schemas/loginFormSchema.ts`

**実装内容**:

```typescript
// src/presentations/pages/LoginPage/schemas/loginFormSchema.ts
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const createLoginFormSchema = (
  t: (key: string, params?: any) => string
) =>
  z.object({
    userId: z
      .string()
      .min(1, t('validation.required', { field: t('auth.login.userId') }))
      .max(
        100,
        t('validation.maxLength', { field: t('auth.login.userId'), max: 100 })
      ),
    password: z
      .string()
      .min(
        8,
        t('validation.minLength', { field: t('auth.login.password'), min: 8 })
      )
      .max(
        36,
        t('validation.maxLength', { field: t('auth.login.password'), max: 36 })
      ),
    rememberMe: z.boolean().default(false),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginFormSchema>>;
```

---

#### Task 2.2: useAuthフック実装

**目的**: TanStack Queryでセッション状態管理

**ファイル**:

- `src/presentations/hooks/useAuth.ts`

**実装内容**:

```typescript
// src/presentations/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '../../app/providers/RepositoryProvider';
import type { LoginRequest } from '../../adapters/generated/auth';

const AUTH_QUERY_KEY = ['auth', 'session'];

export const useAuth = () => {
  const { auth: authRepository } = useRepositories();
  const queryClient = useQueryClient();

  // セッション状態取得
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authRepository.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  // ログインミューテーション
  const loginMutation = useMutation({
    mutationFn: (request: LoginRequest) => authRepository.login(request),
    onSuccess: (data) => {
      // セッションキャッシュ更新
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        user: data.data.user,
        sessionInfo: data.data.sessionInfo,
      });
    },
  });

  // ログアウトミューテーション
  const logoutMutation = useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      // セッションキャッシュクリア
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  return {
    user: session?.user ?? null,
    sessionInfo: session?.sessionInfo ?? null,
    isAuthenticated: !!session?.user,
    isLoading,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  };
};
```

**検証**:

```bash
pnpm test src/presentations/hooks/__tests__/useAuth.test.tsx
```

---

#### Task 2.3: LoginFormコンポーネント実装

**目的**: ログインフォームUI実装

**ファイル**:

- `src/presentations/pages/LoginPage/components/LoginForm.tsx`

**実装内容**:

```typescript
// src/presentations/pages/LoginPage/components/LoginForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
} from '@mui/material';
import { createLoginFormSchema, type LoginFormData } from '../schemas/loginFormSchema';
import { AuthException } from '../../../../domain/errors/AuthException';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error: Error | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const { t } = useTranslation();
  const loginFormSchema = createLoginFormSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userId: '',
      password: '',
      rememberMe: false,
    },
  });

  const getErrorMessage = (error: Error | null): string => {
    if (!error) return '';

    if (error instanceof AuthException) {
      switch (error.code) {
        case 'INVALID_CREDENTIALS':
          return t('auth.login.errors.invalidCredentials');
        case 'NETWORK_ERROR':
          return t('auth.login.errors.networkError');
        default:
          return error.message;
      }
    }

    return error.message;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error)}
        </Alert>
      )}

      <Controller
        name="userId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="userId"
            label={t('auth.login.userId')}
            autoComplete="email"
            autoFocus
            error={!!errors.userId}
            helperText={errors.userId?.message}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="password"
            label={t('auth.login.password')}
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="rememberMe"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} color="primary" />}
            label={t('auth.login.rememberMe')}
            disabled={isLoading}
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? '...' : t('auth.login.submit')}
      </Button>
    </Box>
  );
};
```

**検証**:

```bash
pnpm test src/presentations/pages/LoginPage/components/__tests__/LoginForm.test.tsx
```

---

#### Task 2.4: LoginPageコンポーネント実装

**目的**: ログインページ全体のレイアウトとロジック

**ファイル**:

- `src/presentations/pages/LoginPage/LoginPage.tsx`

**実装内容**:

```typescript
// src/presentations/pages/LoginPage/LoginPage.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Paper } from '@mui/material';
import { LoginForm } from './components/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import type { LoginFormData } from './schemas/loginFormSchema';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoginPending, loginError } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {t('auth.login.title')}
          </Typography>

          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoginPending}
            error={loginError}
          />
        </Paper>
      </Box>
    </Container>
  );
};
```

**検証**:

```bash
pnpm test src/presentations/pages/LoginPage/__tests__/LoginPage.test.tsx
```

---

#### Task 2.5: ルート登録

**目的**: ログインページのルート設定

**ファイル**:

- `src/app/router/routes.tsx`

**実装内容**:

```typescript
// src/app/router/routes.tsx
import { lazy } from 'react';

const LoginPage = lazy(() =>
  import('../../presentations/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage }))
);

export const routes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  // 他のルート...
];
```

**検証**:

```bash
# 開発サーバー起動
pnpm dev

# ブラウザで http://localhost:5173/login にアクセス
```

---

### Phase 3: User Story 3 (P1) - 保護されたページへのアクセス制御

#### Task 3.1: ProtectedRouteコンポーネント実装

**目的**: 認証チェックとリダイレクト処理

**ファイル**:

- `src/app/router/components/ProtectedRoute.tsx`

**実装内容**:

```typescript
// src/app/router/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../../presentations/hooks/useAuth';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
```

**検証**:

```bash
pnpm test src/app/router/components/__tests__/ProtectedRoute.test.tsx
```

---

#### Task 3.2: ProtectedRoute適用

**目的**: 保護が必要なルートにProtectedRoute適用

**ファイル**:

- `src/app/router/routes.tsx`

**実装内容**:

```typescript
// src/app/router/routes.tsx
import { ProtectedRoute } from './components/ProtectedRoute';

export const routes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      // 他の保護されたルート...
    ],
  },
];
```

**検証**:

```bash
# E2Eテスト実行
pnpm test:e2e tests/specs/login/protected-route.spec.ts
```

---

### Phase 4: User Story 4 (P2) - ログアウト機能

#### Task 4.1: LogoutButtonコンポーネント実装

**目的**: ログアウトボタンUI

**ファイル**:

- `src/presentations/components/LogoutButton/LogoutButton.tsx`

**実装内容**:

```typescript
// src/presentations/components/LogoutButton/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

export const LogoutButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, isLogoutPending } = useAuth();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/login', { replace: true });
      },
    });
  };

  return (
    <Button
      variant="outlined"
      onClick={handleLogout}
      disabled={isLogoutPending}
      startIcon={isLogoutPending ? <CircularProgress size={16} /> : null}
    >
      {t('auth.logout.button')}
    </Button>
  );
};
```

**検証**:

```bash
pnpm test src/presentations/components/LogoutButton/__tests__/LogoutButton.test.tsx
```

---

### Phase 5: User Story 2 (P1) - エラーハンドリング

**Task 2.1-2.5で実装済み**: `LoginForm`コンポーネントでエラー表示実装

**追加検証**:

```bash
# エラーシナリオテスト
pnpm test src/presentations/pages/LoginPage/__tests__/LoginPage.error.test.tsx
```

---

### Phase 6: User Story 5 (P3) - Remember Me機能

**Task 2.1-2.5で実装済み**: `LoginForm`にチェックボックス実装済み

**バックエンド連携確認**:

- `rememberMe: true` でログイン時にCookieの`Max-Age`が長期設定されることを確認

---

### Phase 7: E2Eテスト実装

#### Task 7.1: Playwrightテスト作成

**ファイル**:

- `playwright/tests/specs/login/login.spec.ts`

**実装内容**:

```typescript
// playwright/tests/specs/login/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('ログイン', () => {
  test('有効な認証情報でログインできること', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');

    // ホーム画面にリダイレクトされることを確認
    await expect(page).toHaveURL('/');
  });

  test('無効な認証情報でエラーメッセージが表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // エラーメッセージ表示確認
    await expect(
      page.getByText(
        'メールアドレス/ユーザー名またはパスワードが正しくありません'
      )
    ).toBeVisible();
  });

  test('ログイン状態を記録するチェックボックスが機能すること', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.checkRememberMe();
    await loginPage.login('test@example.com', 'password123');

    // rememberMe=trueでリクエストされることを確認
    const request = await page.waitForRequest(
      (req) => req.url().includes('/api/auth/login') && req.method() === 'POST'
    );
    const postData = await request.postData();
    expect(postData).toContain('rememberMe=true');
  });
});
```

**Page Object**:

```typescript
// playwright/tests/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(userId: string, password: string) {
    await this.page.fill('#userId', userId);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
  }

  async checkRememberMe() {
    await this.page.check('input[type="checkbox"][name="rememberMe"]');
  }
}
```

**検証**:

```bash
pnpm test:e2e tests/specs/login/login.spec.ts
```

---

## 実装順序まとめ

```
Phase 1: 基盤実装
├─ Task 1.1: AuthException
├─ Task 1.2: Orvalコード生成
├─ Task 1.3: MSWハンドラー
├─ Task 1.4: AuthRepository
└─ Task 1.5: i18n翻訳キー

Phase 2: US1 (基本ログイン) ← 最優先
├─ Task 2.1: LoginFormスキーマ
├─ Task 2.2: useAuthフック
├─ Task 2.3: LoginFormコンポーネント
├─ Task 2.4: LoginPageコンポーネント
└─ Task 2.5: ルート登録

Phase 3: US3 (保護されたページ)
├─ Task 3.1: ProtectedRoute実装
└─ Task 3.2: ProtectedRoute適用

Phase 4: US4 (ログアウト)
└─ Task 4.1: LogoutButton実装

Phase 5: US2 (エラーハンドリング)
└─ Phase 2で実装済み

Phase 6: US5 (Remember Me)
└─ Phase 2で実装済み

Phase 7: E2Eテスト
└─ Task 7.1: Playwrightテスト
```

---

## 開発コマンド

### 日常開発

```bash
# 開発サーバー起動 (MSW有効)
pnpm dev

# ユニット/コンポーネントテスト
pnpm test

# ユニットテスト (watch mode)
pnpm test:watch

# カバレッジ確認
pnpm test:coverage

# E2Eテスト
pnpm test:e2e

# E2Eテスト (UI mode)
pnpm test:e2e:ui
```

### コード生成

```bash
# OpenAPIからコード生成
pnpm run gen:api:auth

# すべてのOpenAPI仕様から生成
pnpm run gen:api
```

### リンター/フォーマッター

```bash
# ESLint
pnpm lint

# Prettier (自動修正)
pnpm format
```

---

## トラブルシューティング

### MSWが動作しない

**症状**: API呼び出しが実際のエンドポイントに飛ぶ

**解決策**:

```bash
# MSW Service Worker再生成
pnpm exec msw init public/ --save
```

### Orval生成エラー

**症状**: `pnpm run gen:api:auth` でエラー

**解決策**:

```bash
# OpenAPI仕様の検証
pnpm exec orval --input schema/auth/openapi.yaml --output /tmp/test.ts
```

### TypeScript型エラー

**症状**: `LoginRequest` 型が見つからない

**解決策**:

```bash
# 再生成
pnpm run gen:api:auth

# VS Code再起動
# Cmd+Shift+P → "Reload Window"
```

---

## Constitution Check

すべてのタスクは以下の原則に従います:

1. ✅ **TypeScript Strict Mode**: `strict: true`, 型安全性確保
2. ✅ **Component Architecture**: 機能的凝集性、単一責任の原則
3. ✅ **Material-UI First**: MUIコンポーネント優先、カスタムCSS最小化
4. ✅ **Test-Driven Development**: テストファースト、カバレッジ80%以上
5. ✅ **API-First with OpenAPI**: Orval自動生成、手動APIコード禁止
6. ✅ **Clean Architecture**: 4層分離、依存関係逆転
7. ✅ **Accessibility**: WCAG 2.1 AA、セマンティックHTML、aria属性

---

## Next Steps

✅ Phase 1 (Quickstart)完了 → **Agentコンテキスト更新に進む**

**コマンド**:

```bash
.specify/scripts/bash/update-agent-context.sh copilot
```

その後、`/speckit.tasks` コマンドで `tasks.md` を生成し、実装を開始します。

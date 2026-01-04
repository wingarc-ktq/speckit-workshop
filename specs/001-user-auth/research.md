# Research: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**Purpose**: 技術選定、ベストプラクティス、実装パターンの調査

## 技術決定事項

### 1. フォーム管理とバリデーション

**Decision**: React Hook Form + Zod を使用

**Rationale**:

- React Hook Formは高性能で再レンダリングを最小化
- Zodによる型安全なスキーマバリデーション（TypeScriptと統合）
- MUIとの統合が容易（Controller component）
- OpenAPI仕様の型定義と統合可能

**Alternatives Considered**:

- Formik: 人気だが、React Hook Formより低速
- 素のReact state: バリデーションロジックが複雑化

**Implementation Pattern**:

```typescript
// useLoginForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginForm() {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: '',
      password: '',
      rememberMe: false,
    },
  });
}
```

---

### 2. セッション状態管理

**Decision**: TanStack Query (React Query) を使用

**Rationale**:

- サーバー状態とキャッシュ管理に特化
- 自動再取得、楽観的更新、エラーハンドリング
- 既にプロジェクトで使用中
- ログイン状態の永続化とリフレッシュが容易

**Alternatives Considered**:

- Context API単体: キャッシュとリフレッシュロジックを自前実装する必要
- Zustand: グローバル状態管理だが、サーバー状態には不向き

**Implementation Pattern**:

```typescript
// useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AUTH_QUERY_KEY = ['auth', 'session'] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  // セッション確認
  const { data: session, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authRepository.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分
  });

  // ログイン
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) =>
      authRepository.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  // ログアウト
  const logoutMutation = useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    },
  });

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  };
}
```

---

### 3. ProtectedRouteパターン

**Decision**: React Router v7のloader + コンポーネントラッパー

**Rationale**:

- React Router v7の新しいデータローディングパターンを活用
- 認証チェックをルート定義レベルで実装
- リダイレクト先URL（redirect param）の保存が容易

**Alternatives Considered**:

- HOC (Higher Order Component): React Hooksと相性悪い
- 各ページで個別チェック: DRY原則違反、漏れのリスク

**Implementation Pattern**:

```typescript
// ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // またはスケルトン
  }

  if (!isAuthenticated) {
    // ログイン画面にリダイレクト（元のURLを保存）
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
```

---

### 4. エラーハンドリング戦略

**Decision**: 階層的エラーハンドリング（Network → API → UI）

**Rationale**:

- ネットワークエラー、認証エラー、バリデーションエラーを区別
- ユーザーに適切なフィードバックを提供
- 既存のエラーシステム（WebApiException）を拡張

**Implementation Pattern**:

```typescript
// AuthException.ts
import { WebApiException } from '@/domain/errors';

export class AuthException extends WebApiException {
  constructor(
    public readonly code: 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'NO_SESSION',
    message: string,
    statusCode: number
  ) {
    super(message, statusCode);
    this.name = 'AuthException';
  }
}

// AuthRepositoryImpl.ts
async login(credentials: LoginFormData): Promise<LoginResponse> {
  try {
    const response = await authApi.loginUser({
      body: credentials
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorCode, message } = error.response.data;
      throw new AuthException(
        errorCode,
        message,
        error.response.status
      );
    }
    throw new NetworkException('ネットワークエラーが発生しました');
  }
}
```

---

### 5. Figmaデザインの実装方針

**Decision**: MUIコンポーネント優先、Figmaトークンは参考程度

**Rationale**:

- MUIのデフォルトスタイルとテーマシステムを活用
- Figmaのピクセル単位の細かい調整は再現しない
- レイアウトと配色構造はFigmaに合わせる
- Constitution原則III（Material-UI First）に準拠

**Figma構造分析**:

```
/login (Frame)
└── Frame 11 (Container)
    ├── icon 1 (Logo)
    ├── <Typography> (h3) - "Login"
    ├── <Typography> (body1) - "Please sign in..."
    ├── *Custom / Forms / Email & Password (Form)
    │   ├── <TextField> - "Email Address or Username"
    │   ├── Spacing
    │   ├── <TextField> - "Password" (with eye icon)
    │   ├── Spacing
    │   ├── <FormControlLabel> - "Remember me"
    │   ├── Spacing
    │   └── <Button> - "Login"
    └── <Link> - "Forgot Password?"
```

**Component Mapping**:
| Figma Component | MUI Component | Props |
|----------------|---------------|-------|
| `<Typography>` h3 | `Typography` | `variant="h3"` |
| `<Typography>` body1 | `Typography` | `variant="body1"` |
| `<TextField>` | `TextField` | `variant="outlined"`, `size="medium"` |
| `<FormControlLabel>` | `FormControlLabel` + `Checkbox` | `label="Remember me"` |
| `<Button>` | `Button` | `variant="contained"`, `size="large"`, `color="primary"` |
| `<Link>` | `Link` | `underline="hover"`, `color="primary"` |

**Spacing Strategy**:

- Figmaの`Spacing | Vertical`（16px）を`theme.spacing(2)`に変換
- MUIのGrid/Stackコンポーネントでレイアウト
- カードコンテナは`Paper`コンポーネント（`padding: theme.spacing(4)`）

---

### 6. MSWモック戦略

**Decision**: シナリオベースのハンドラー（成功・失敗・エッジケース）

**Rationale**:

- 開発環境とテスト環境で同じモックを使用
- OpenAPI仕様に基づいたレスポンス
- エラーケースのテストが容易

**Implementation Pattern**:

```typescript
// authHandlers.ts
import { http, HttpResponse, delay } from 'msw';

const BASE_URL = 'http://localhost:3000/api';

export const authHandlers = [
  // 成功ケース
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();

    // 遅延シミュレーション
    await delay(500);

    // テストユーザー
    if (body.userId === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json(
        {
          message: 'ログインに成功しました',
          data: {
            user: {
              id: 'user-123',
              username: 'testuser',
              email: 'test@example.com',
              fullName: 'Test User',
            },
            sessionInfo: {
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
              csrfToken: 'csrf-token-123',
            },
          },
        },
        {
          headers: {
            'Set-Cookie': 'session_id=mock-session; Path=/; HttpOnly',
          },
        }
      );
    }

    // 認証失敗ケース
    return HttpResponse.json(
      {
        error: 'INVALID_CREDENTIALS',
        message: 'メールアドレス/ユーザー名またはパスワードが正しくありません',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }),

  // ログアウト
  http.post(`${BASE_URL}/auth/logout`, async () => {
    await delay(300);
    return HttpResponse.json(
      {
        message: 'ログアウトしました',
      },
      {
        headers: {
          'Set-Cookie': 'session_id=; Path=/; HttpOnly; Max-Age=0',
        },
      }
    );
  }),

  // セッション確認
  http.get(`${BASE_URL}/auth/session`, ({ cookies }) => {
    if (cookies.session_id) {
      return HttpResponse.json({
        user: {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
        },
        sessionInfo: {
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          csrfToken: 'csrf-token-123',
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
];
```

---

### 7. 国際化（i18n）対応

**Decision**: react-i18next（既存システム）を使用

**Rationale**:

- プロジェクトで既に使用中
- 型安全な翻訳キー（useTypedTranslation）
- Constitution指示に準拠

**Translation Keys**:

```json
// locales/ja/auth.json
{
  "login": {
    "title": "ログイン",
    "subtitle": "アカウントにサインインしてください",
    "emailLabel": "メールアドレスまたはユーザー名",
    "passwordLabel": "パスワード",
    "rememberMe": "ログイン状態を保持",
    "loginButton": "ログイン",
    "forgotPassword": "パスワードをお忘れですか？",
    "errors": {
      "required": "{field}を入力してください",
      "invalidCredentials": "メールアドレス/ユーザー名またはパスワードが正しくありません",
      "networkError": "ネットワークエラーが発生しました。再度お試しください",
      "sessionExpired": "セッションの有効期限が切れました。再度ログインしてください"
    }
  }
}
```

---

### 8. テスト戦略

**Decision**: 3層テスト（Unit → Component → E2E）

**Test Coverage**:

| Layer         | What to Test                                                                     | Tools                          | Files                                   |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------- |
| **Unit**      | - カスタムフック（useLoginForm）<br>- Repository実装<br>- バリデーションロジック | Vitest + React Testing Library | `*.test.ts`, `*.test.tsx`               |
| **Component** | - LoginPageコンポーネント<br>- LoginFormコンポーネント<br>- ProtectedRoute       | Vitest + RTL + MSW             | `*.test.tsx`                            |
| **E2E**       | - ログインフロー<br>- ログアウトフロー<br>- リダイレクトフロー<br>- エラーケース | Playwright + MSW               | `playwright/tests/specs/auth/*.spec.ts` |

**Priority Testing Scenarios**:

1. ✅ **P1**: 有効な認証情報でログイン成功
2. ✅ **P1**: 無効な認証情報でエラー表示
3. ✅ **P1**: 保護されたページへのリダイレクト
4. ✅ **P2**: ログアウト機能
5. ✅ **P3**: Remember Me機能

---

## ベストプラクティス参照

### React Hook Form + MUI Integration

- [React Hook Form with MUI](https://react-hook-form.com/get-started#IntegratingwithUIlibraries)
- [MUI TextField Controller](https://mui.com/material-ui/react-text-field/#integration-with-3rd-party-input-libraries)

### TanStack Query Authentication Pattern

- [Authentication pattern](https://tanstack.com/query/latest/docs/framework/react/guides/authentication)
- [Optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

### React Router v7 Protected Routes

- [Protecting Routes](https://reactrouter.com/en/main/start/tutorial#protecting-routes)
- [Redirects](https://reactrouter.com/en/main/fetch/redirect)

### MSW Best Practices

- [MSW with React](https://mswjs.io/docs/integrations/browser)
- [Testing with MSW](https://mswjs.io/docs/getting-started/integrate/node)

---

## 未解決の技術的課題

**なし**: すべての技術的決定事項が確定。Phase 1（設計）に進行可能。

---

## Next Phase

✅ Phase 0完了 → **Phase 1: データモデルとAPI契約定義に進む**

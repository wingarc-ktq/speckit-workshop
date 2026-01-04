# API Contracts: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**OpenAPI Spec**: `schema/auth/openapi.yaml` v1.0.0

## 概要

この機能で使用するAPI契約を定義します。すべてのAPI仕様は既存の `schema/auth/openapi.yaml` に記載されています。

**OpenAPI仕様ファイル**: `/schema/auth/openapi.yaml`  
**自動生成コード**: `src/adapters/generated/auth.ts` (Orval使用)

---

## エンドポイント一覧

| Endpoint            | Method | Operation ID | Description        | 使用ユーザーストーリー |
| ------------------- | ------ | ------------ | ------------------ | ---------------------- |
| `/api/auth/login`   | POST   | `loginUser`  | ユーザーログイン   | US1, US2, US5          |
| `/api/auth/logout`  | POST   | `logoutUser` | ユーザーログアウト | US4                    |
| `/api/auth/session` | GET    | `getSession` | セッション情報取得 | US3                    |

---

## エンドポイント詳細

### 1. POST /api/auth/login

**操作ID**: `loginUser`  
**説明**: ユーザー認証とセッションCookie発行  
**認証**: 不要

#### リクエスト

**Content-Type**: `application/x-www-form-urlencoded`

**Body Schema** (`LoginRequest`):

```typescript
{
  userId: string;      // メールアドレスまたはユーザー名 (1-100文字)
  password: string;    // パスワード (8-36文字)
  rememberMe?: boolean; // ログイン状態保持フラグ (デフォルト: false)
}
```

**バリデーション**:

- `userId`: 必須、1-100文字
- `password`: 必須、8-36文字
- `rememberMe`: オプション、booleanデフォルトfalse

**例**:

```typescript
// メールアドレスでログイン
{
  userId: 'user@example.com',
  password: 'password123',
  rememberMe: false
}

// ユーザー名でログイン
{
  userId: 'john_doe',
  password: 'password123',
  rememberMe: true
}
```

#### レスポンス

##### 200 OK - ログイン成功

**Headers**:

```
Set-Cookie: session_id=abc123def456; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
X-CSRF-Token: csrf_1234567890abcdef (オプション)
```

**Body Schema** (`LoginResponse`):

```typescript
{
  message: string; // 成功メッセージ
  data: {
    user: {
      id: string;        // UUID
      username: string;
      email: string;
      fullName: string | null;
    };
    sessionInfo?: {
      expiresAt: string; // ISO 8601 date-time
      csrfToken?: string;
    };
  };
}
```

**例**:

```json
{
  "message": "ログインに成功しました",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "sessionInfo": {
      "expiresAt": "2024-01-16T10:30:00Z",
      "csrfToken": "csrf_1234567890abcdef"
    }
  }
}
```

##### 400 Bad Request - ログイン情報が無効

**Body Schema** (`ErrorResponse`):

```typescript
{
  error: string; // エラーコード
  message: string; // エラーメッセージ
  timestamp: string; // ISO 8601 date-time
}
```

**エラーコード**:

- `INVALID_CREDENTIALS`: 認証情報が無効

**例**:

```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "メールアドレス/ユーザー名またはパスワードが正しくありません",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

##### 429 Too Many Requests - ログイン試行回数超過

**Body Schema** (`ErrorResponse`):

```typescript
{
  error: 'TOO_MANY_ATTEMPTS';
  message: string;
  timestamp: string;
}
```

**例**:

```json
{
  "error": "TOO_MANY_ATTEMPTS",
  "message": "ログイン試行回数が上限を超えました。しばらく時間をおいてから再度お試しください",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

##### 500 Internal Server Error

**Body Schema** (`ErrorResponse`):

```typescript
{
  error: 'INTERNAL_SERVER_ERROR';
  message: string;
  timestamp: string;
}
```

---

### 2. POST /api/auth/logout

**操作ID**: `logoutUser`  
**説明**: ユーザーセッションの無効化  
**認証**: Cookie必須 (`session_id`)

#### リクエスト

**Headers**:

```
Cookie: session_id=abc123def456
X-CSRF-Token: csrf_1234567890abcdef (CSRF保護有効時は必須)
```

**Body**: なし

#### レスポンス

##### 200 OK - ログアウト成功

**Headers**:

```
Set-Cookie: session_id=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

**Body Schema** (`LogoutResponse`):

```typescript
{
  message: string; // 成功メッセージ
}
```

**例**:

```json
{
  "message": "ログアウトしました"
}
```

##### 401 Unauthorized - セッションが無効

**Body Schema** (`ErrorResponse`):

```typescript
{
  error: 'NO_SESSION' | 'SESSION_EXPIRED';
  message: string;
  timestamp: string;
}
```

**例**:

```json
{
  "error": "NO_SESSION",
  "message": "ログインが必要です",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

##### 403 Forbidden - CSRF検証エラー

**Body Schema** (`ErrorResponse`):

```typescript
{
  error: 'CSRF_VALIDATION_ERROR';
  message: string;
  timestamp: string;
}
```

**例**:

```json
{
  "error": "CSRF_VALIDATION_ERROR",
  "message": "CSRFトークンが無効です",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

##### 500 Internal Server Error

**Body Schema** (`ErrorResponse`):

```typescript
{
  error: 'INTERNAL_SERVER_ERROR';
  message: string;
  timestamp: string;
}
```

---

### 3. GET /api/auth/session

**操作ID**: `getSession`  
**説明**: 現在のセッション情報取得  
**認証**: Cookie必須 (`session_id`)

#### リクエスト

**Headers**:

```
Cookie: session_id=abc123def456
```

**Query Parameters**: なし

#### レスポンス

##### 200 OK - セッション情報取得成功

**Body Schema** (`SessionResponse`):

```typescript
{
  user: {
    id: string;        // UUID
    username: string;
    email: string;
    fullName: string | null;
  };
  sessionInfo: {
    expiresAt: string; // ISO 8601 date-time
    csrfToken?: string;
  };
}
```

**例**:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "sessionInfo": {
    "expiresAt": "2024-01-16T10:30:00Z",
    "csrfToken": "csrf_1234567890abcdef"
  }
}
```

##### 401 Unauthorized - セッションが無効

**Body Schema** (`ErrorResponse`):

```typescript
{
  error: 'NO_SESSION' | 'SESSION_EXPIRED';
  message: string;
  timestamp: string;
}
```

**例**:

```json
{
  "error": "SESSION_EXPIRED",
  "message": "セッションの有効期限が切れました。再度ログインしてください",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## エラーハンドリング仕様

### エラーコード一覧

| Code                    | HTTP Status | Description            | フロントエンド対応                      |
| ----------------------- | ----------- | ---------------------- | --------------------------------------- |
| `INVALID_CREDENTIALS`   | 400         | 認証情報が無効         | フォームエラーとして表示                |
| `TOO_MANY_ATTEMPTS`     | 429         | ログイン試行回数超過   | アラート表示（※未実装）                 |
| `NO_SESSION`            | 401         | セッションが存在しない | ログイン画面にリダイレクト              |
| `SESSION_EXPIRED`       | 401         | セッション期限切れ     | ログイン画面にリダイレクト + メッセージ |
| `CSRF_VALIDATION_ERROR` | 403         | CSRF検証エラー         | エラーメッセージ表示                    |
| `INTERNAL_SERVER_ERROR` | 500         | サーバーエラー         | エラーページ表示                        |
| `NETWORK_ERROR`         | N/A         | ネットワークエラー     | 再試行プロンプト表示                    |

### エラーハンドリング戦略

**階層構造**:

```
1. NetworkException (AxiosError, no response)
   ↓ catch
2. WebApiException (response.status >= 400)
   ↓ transform
3. AuthException (domain layer error)
   ↓ display
4. UI Error Message (presentations layer)
```

**コード例**:

```typescript
// adapters/repositories/auth/AuthRepository.ts
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
        throw new AuthException(
          data.error as AuthErrorCode,
          data.message,
          401
        );
      }

      throw new WebApiException(data.message, status);
    }

    throw new FatalException('予期しないエラーが発生しました');
  }
}
```

---

## 認証フロー図

### ログインフロー

```
[Client]                [API Server]              [Session Store]
   │                         │                         │
   ├─ POST /api/auth/login ──►                         │
   │  Body: {userId, password, rememberMe}            │
   │                         │                         │
   │                    ◄────┤ 認証チェック               │
   │                         │                         │
   │                         ├────────────────────────►│
   │                         │  セッション作成            │
   │                         ◄────────────────────────┤
   │                         │  session_id              │
   │                         │                         │
   ◄─ 200 OK + Set-Cookie ───┤                         │
   │  Body: LoginResponse    │                         │
   │  Cookie: session_id     │                         │
   │                         │                         │
```

### セッションチェックフロー

```
[Client]                [API Server]              [Session Store]
   │                         │                         │
   ├─ GET /api/auth/session ►                          │
   │  Cookie: session_id     │                         │
   │                         │                         │
   │                         ├────────────────────────►│
   │                         │  セッション検証            │
   │                         ◄────────────────────────┤
   │                         │  user info               │
   │                         │                         │
   ◄─ 200 OK ───────────────┤                         │
   │  Body: SessionResponse  │                         │
   │                         │                         │
```

### ログアウトフロー

```
[Client]                [API Server]              [Session Store]
   │                         │                         │
   ├─ POST /api/auth/logout ►                          │
   │  Cookie: session_id     │                         │
   │                         │                         │
   │                         ├────────────────────────►│
   │                         │  セッション削除            │
   │                         ◄────────────────────────┤
   │                         │                         │
   ◄─ 200 OK + Set-Cookie ──┤                         │
   │  Cookie: (Max-Age=0)    │                         │
   │                         │                         │
```

---

## Orval自動生成コード参照

### 生成コマンド

```bash
pnpm run gen:api:auth
```

### 生成ファイル

`src/adapters/generated/auth.ts`

### 生成される型とAPI関数

```typescript
// 型定義（OpenAPIスキーマから自動生成）
export interface LoginRequest { ... }
export interface LoginResponse { ... }
export interface LogoutResponse { ... }
export interface SessionResponse { ... }
export interface UserProfile { ... }
export interface SessionInfo { ... }
export interface ErrorResponse { ... }

// API関数（operationIdから自動生成）
export const loginUser = (loginRequest: LoginRequest, options?: AxiosRequestConfig) =>
  axios.post<LoginResponse>('/api/auth/login', loginRequest, options);

export const logoutUser = (options?: AxiosRequestConfig) =>
  axios.post<LogoutResponse>('/api/auth/logout', undefined, options);

export const getSession = (options?: AxiosRequestConfig) =>
  axios.get<SessionResponse>('/api/auth/session', options);
```

---

## テスト用MSWハンドラー

**場所**: `src/adapters/mocks/handlers/auth.ts`

### ハンドラー設計

```typescript
import { http, HttpResponse, delay } from 'msw';

export const authHandlers = [
  // 成功シナリオ
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500); // ネットワーク遅延シミュレーション

    const body = await request.formData();
    const userId = body.get('userId');
    const password = body.get('password');
    const rememberMe = body.get('rememberMe') === 'true';

    // テストユーザー検証
    if (userId === 'test@example.com' && password === 'password123') {
      return HttpResponse.json(
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

  // セッションチェック
  http.get('/api/auth/session', async ({ cookies }) => {
    await delay(300);

    const sessionId = cookies.session_id;

    if (sessionId?.startsWith('mock_session_')) {
      return HttpResponse.json({
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

  // ログアウト
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

---

## セキュリティ考慮事項

### Cookie属性

| 属性       | 値                    | 理由                                    |
| ---------- | --------------------- | --------------------------------------- |
| `HttpOnly` | `true`                | JavaScriptからのアクセス防止（XSS対策） |
| `Secure`   | `true`                | HTTPS通信必須                           |
| `SameSite` | `Strict`              | CSRF攻撃防止                            |
| `Path`     | `/`                   | アプリケーション全体で有効              |
| `Max-Age`  | `86400` (1日) or 長期 | Remember Me対応                         |

### CSRF保護

- `X-CSRF-Token`ヘッダーでトークン送信
- ログアウトなど状態変更APIで必須
- バックエンド実装依存（オプション）

### パスワードセキュリティ

- HTTPS暗号化通信（平文送信なし）
- バックエンド側でハッシュ化
- フロントエンドは検証のみ

---

## Next Steps

✅ Phase 1 (API Contracts)完了 → **クイックスタートガイド（quickstart.md）に進む**

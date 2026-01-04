# Data Model: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**Source**: `schema/auth/openapi.yaml` + 機能仕様

## エンティティ定義

### 1. User（ユーザー）

ログイン済みユーザーの情報を表すエンティティ。

**属性**:

| Field      | Type             | Required | Description          | Validation |
| ---------- | ---------------- | -------- | -------------------- | ---------- |
| `id`       | `string (UUID)`  | ✅       | ユーザーの一意識別子 | UUID形式   |
| `username` | `string`         | ✅       | ユーザー名           | 1-100文字  |
| `email`    | `string`         | ✅       | メールアドレス       | Email形式  |
| `fullName` | `string \| null` | ❌       | フルネーム           | 任意       |

**TypeScript型定義**:

```typescript
export interface User {
  id: string; // UUID
  username: string;
  email: string;
  fullName: string | null;
}
```

**状態遷移**: なし（読み取り専用）

**関連エンティティ**: Session（1:1）

---

### 2. Session（セッション）

ユーザーのログインセッション情報を表すエンティティ。

**属性**:

| Field       | Type                | Required | Description                  | Validation                        |
| ----------- | ------------------- | -------- | ---------------------------- | --------------------------------- |
| `sessionId` | `string (Cookie)`   | ✅       | セッションID（Cookieで管理） | HttpOnly, Secure, SameSite=Strict |
| `expiresAt` | `string (ISO 8601)` | ✅       | セッション有効期限           | 日時形式                          |
| `csrfToken` | `string`            | ❌       | CSRF保護トークン             | CSRF保護有効時のみ                |

**TypeScript型定義**:

```typescript
export interface SessionInfo {
  expiresAt: string; // ISO 8601 date-time
  csrfToken?: string;
}

export interface Session {
  user: User;
  sessionInfo: SessionInfo;
}
```

**状態遷移**:

```
[未認証] --login--> [認証済み] --logout/expire--> [未認証]
```

**関連エンティティ**: User（1:1）

**ライフサイクル**:

- **作成**: ログイン成功時にバックエンドが生成
- **更新**: Remember Me有効時は長期有効期限
- **削除**: ログアウト時またはセッション期限切れ時

---

### 3. LoginFormData（ログインフォームデータ）

ログインフォームの入力データを表すエンティティ。

**属性**:

| Field        | Type      | Required | Description                          | Validation        |
| ------------ | --------- | -------- | ------------------------------------ | ----------------- |
| `userId`     | `string`  | ✅       | ユーザーID（メールまたはユーザー名） | 1-100文字         |
| `password`   | `string`  | ✅       | パスワード                           | 8-36文字          |
| `rememberMe` | `boolean` | ❌       | ログイン状態保持フラグ               | デフォルト: false |

**TypeScript型定義**:

```typescript
export interface LoginFormData {
  userId: string;
  password: string;
  rememberMe: boolean;
}
```

**バリデーションルール**:

```typescript
import { z } from 'zod';

export const loginFormSchema = z.object({
  userId: z
    .string()
    .min(1, 'ユーザーIDを入力してください')
    .max(100, 'ユーザーIDは100文字以内で入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上必要です')
    .max(36, 'パスワードは36文字以内で入力してください'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
```

**関連エンティティ**: なし（入力データのみ）

---

### 4. LoginRequest（ログインリクエスト）

APIに送信するログインリクエストデータ。`LoginFormData`から変換。

**属性**:

| Field        | Type      | Required | Description      | 対応 OpenAPI Schema       |
| ------------ | --------- | -------- | ---------------- | ------------------------- |
| `userId`     | `string`  | ✅       | ユーザーID       | `LoginRequest.userId`     |
| `password`   | `string`  | ✅       | パスワード       | `LoginRequest.password`   |
| `rememberMe` | `boolean` | ❌       | ログイン状態保持 | `LoginRequest.rememberMe` |

**TypeScript型定義**（Orval自動生成）:

```typescript
// adapters/generated/auth.ts
export interface LoginRequest {
  userId: string;
  password: string;
  rememberMe?: boolean;
}
```

---

### 5. LoginResponse（ログインレスポンス）

ログインAPI成功時のレスポンスデータ。

**属性**:

| Field              | Type          | Required | Description    | 対応 OpenAPI Schema              |
| ------------------ | ------------- | -------- | -------------- | -------------------------------- |
| `message`          | `string`      | ✅       | 成功メッセージ | `LoginResponse.message`          |
| `data.user`        | `User`        | ✅       | ユーザー情報   | `LoginResponse.data.user`        |
| `data.sessionInfo` | `SessionInfo` | ❌       | セッション情報 | `LoginResponse.data.sessionInfo` |

**TypeScript型定義**（Orval自動生成）:

```typescript
// adapters/generated/auth.ts
export interface LoginResponse {
  message: string;
  data: {
    user: UserProfile; // = User
    sessionInfo?: SessionInfo;
  };
}
```

**HTTPヘッダー**:

- `Set-Cookie`: セッションCookie
- `X-CSRF-Token`: CSRFトークン（オプション）

---

### 6. AuthError（認証エラー）

認証エラー情報を表すエンティティ。

**属性**:

| Field       | Type                | Required | Description      | 対応 OpenAPI Schema       |
| ----------- | ------------------- | -------- | ---------------- | ------------------------- |
| `error`     | `string`            | ✅       | エラーコード     | `ErrorResponse.error`     |
| `message`   | `string`            | ✅       | エラーメッセージ | `ErrorResponse.message`   |
| `timestamp` | `string (ISO 8601)` | ✅       | エラー発生日時   | `ErrorResponse.timestamp` |

**エラーコード一覧**:

| Code                  | HTTP Status | Description            | ユーザー表示メッセージ                                      |
| --------------------- | ----------- | ---------------------- | ----------------------------------------------------------- |
| `INVALID_CREDENTIALS` | 400         | 認証情報が無効         | メールアドレス/ユーザー名またはパスワードが正しくありません |
| `NO_SESSION`          | 401         | セッションが存在しない | ログインが必要です                                          |
| `SESSION_EXPIRED`     | 401         | セッション期限切れ     | セッションの有効期限が切れました。再度ログインしてください  |
| `NETWORK_ERROR`       | N/A         | ネットワークエラー     | ネットワークエラーが発生しました。再度お試しください        |

**TypeScript型定義**:

```typescript
// domain/errors/AuthException.ts
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

---

## エンティティ関係図（ER図）

```
┌─────────────────┐
│   LoginFormData │ (入力)
│  - userId       │
│  - password     │
│  - rememberMe   │
└────────┬────────┘
         │ 送信
         ▼
┌─────────────────┐
│   LoginRequest  │ (API Request)
│  - userId       │
│  - password     │
│  - rememberMe   │
└────────┬────────┘
         │ API Call
         ▼
┌─────────────────┐      ┌──────────────┐
│  LoginResponse  │◄─────┤ Set-Cookie   │
│  - message      │      │ session_id   │
│  - data         │      └──────────────┘
│    - user       │
│    - sessionInfo│
└────────┬────────┘
         │ 保存
         ▼
┌─────────────────┐       ┌──────────────┐
│     Session     │ 1:1   │     User     │
│  - sessionInfo  ├───────┤  - id        │
│    - expiresAt  │       │  - username  │
│    - csrfToken  │       │  - email     │
│                 │       │  - fullName  │
└─────────────────┘       └──────────────┘
         │
         │ ログアウト/期限切れ
         ▼
    [未認証状態]
```

---

## データフロー

### ログインフロー

```
1. [User Input]
   ユーザーがフォームに入力
   ↓
2. [Validation]
   React Hook Form + Zod でバリデーション
   ↓
3. [API Request]
   POST /api/auth/login
   Body: { userId, password, rememberMe }
   ↓
4. [API Response]
   200 OK: LoginResponse + Set-Cookie
   400 Bad Request: ErrorResponse
   ↓
5. [State Update]
   TanStack Query でセッション状態更新
   ↓
6. [Redirect]
   ホーム画面または元のページに遷移
```

### セッションチェックフロー

```
1. [Page Load]
   保護されたページにアクセス
   ↓
2. [Session Query]
   GET /api/auth/session
   Cookie: session_id
   ↓
3. [Response Check]
   200 OK: Session情報取得 → ページ表示
   401 Unauthorized: ログイン画面にリダイレクト
```

### ログアウトフロー

```
1. [User Action]
   ログアウトボタンクリック
   ↓
2. [API Request]
   POST /api/auth/logout
   Cookie: session_id
   ↓
3. [API Response]
   200 OK: Set-Cookie (Max-Age=0)
   ↓
4. [State Clear]
   TanStack Query のキャッシュクリア
   ↓
5. [Redirect]
   ログイン画面に遷移
```

---

## データ永続化

| Data            | Storage Location     | Lifetime                         | Security                          |
| --------------- | -------------------- | -------------------------------- | --------------------------------- |
| セッションID    | Cookie (HttpOnly)    | セッション期限 or ブラウザ終了時 | HttpOnly, Secure, SameSite=Strict |
| ユーザー情報    | TanStack Query Cache | staleTime: 5分                   | メモリのみ、ページリロードで消失  |
| Remember Me状態 | Cookieの有効期限     | 長期（バックエンド設定）         | Cookie属性で保護                  |

**セキュリティ考慮事項**:

- セッションIDはJavaScriptからアクセス不可（HttpOnly）
- HTTPS接続必須（Secure）
- CSRF保護（バックエンド実装、フロントエンドはトークン送信）
- パスワードは平文送信しない（HTTPS暗号化）

---

## バリデーション仕様

### クライアント側バリデーション

| Field    | Rule      | Error Message                                       |
| -------- | --------- | --------------------------------------------------- |
| userId   | 必須      | "ユーザーIDを入力してください"                      |
| userId   | 1-100文字 | "ユーザーIDは100文字以内で入力してください"         |
| password | 必須      | "パスワードを入力してください"                      |
| password | 8-36文字  | "パスワードは8文字以上36文字以内で入力してください" |

### サーバー側バリデーション

OpenAPI仕様（`schema/auth/openapi.yaml`）に定義:

- userId: `minLength: 1`, `maxLength: 100`
- password: `minLength: 8`, `maxLength: 36`
- パスワード複雑性チェック（バックエンド実装）

---

## マイグレーション計画

**該当なし**: 既存データなし。新規機能実装。

---

## Next Steps

✅ Phase 1 (Data Model)完了 → **API契約定義（contracts/）に進む**

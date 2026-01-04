import z from 'zod';

import { tKeys } from '@/i18n';
import { i18n } from '@/i18n/config';
/**
 * 認証関連のドメインモデル
 */

/**
 * ログイン認証情報のスキーマ
 * @remarks
 * - userIdとpasswordは必須
 * - rememberMeはオプション
 * @remarks
 * - カスタムエラーメッセージは`error: () => i18n.t(tkeys.xxx.xxx)`の形式で記載
 * - アロー関数にすることで、言語が変更されても追従できる
 */
export const loginCredentialsSchema = z.object({
  userId: z.string().min(1, { error: () => i18n.t(tKeys.validations.require) }),
  password: z
    .string()
    .min(1, { error: () => i18n.t(tKeys.validations.require) })
    .min(8, { error: () => i18n.t(tKeys.validations.minLength, { min: 8 }) })
    .max(36, {
      error: () => i18n.t(tKeys.validations.maxLength, { max: 36 }),
    }),
  rememberMe: z.boolean().optional(),
});

/**
 * ログイン認証情報の型
 */
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export interface User {
  /** ユーザーID */
  readonly id: string;
  /** ユーザー名 */
  readonly username: string;
  /** メールアドレス */
  readonly email: string;
  /** 氏名 */
  readonly fullName?: string | null;
}

export interface SessionInfo {
  /** セッション有効期限 */
  readonly expiresAt: Date;
  /** CSRF保護用トークン */
  readonly csrfToken?: string;
}

export interface AuthSession {
  /** ユーザー情報 */
  readonly user: User;
  /** セッション情報 */
  readonly sessionInfo?: SessionInfo;
}

export interface LoginResult {
  /** 認証セッション */
  readonly session: AuthSession;
  /** レスポンスメッセージ */
  readonly message: string;
}

export interface LogoutResult {
  /** レスポンスメッセージ */
  readonly message: string;
}

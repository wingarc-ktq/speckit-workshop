import '@/adapters/axios';

import { logoutUser as logoutUserApi } from '@/adapters/generated/auth';
import type { LogoutResult } from '@/domain/models/auth';

import { handleLogoutError } from './utils/authErrorHandler';

export type LogoutUser = () => Promise<LogoutResult>;

/**
 * ユーザーログアウト
 * @returns ログアウト結果
 * @throws {AuthException} 認証エラー時
 */
export const logoutUser: LogoutUser = async (): Promise<LogoutResult> => {
  try {
    const data = await logoutUserApi();

    return {
      message: data.message,
    };
  } catch (error) {
    handleLogoutError(error);
  }
};

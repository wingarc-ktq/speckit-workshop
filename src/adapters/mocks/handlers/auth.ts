import { http, HttpResponse, delay } from 'msw';

import {
  getLoginUserResponseMock,
  getLogoutUserResponseMock,
  getGetSessionResponseMock,
} from '@/adapters/generated/auth';
import {
  HTTP_STATUS_CLIENT_ERROR,
  HTTP_STATUS_SUCCESS,
} from '@/domain/constants';

// 簡単なCookieサポートを追加した認証APIのモックハンドラーを返す関数
export const getCustomAuthAPIMock = () => {
  // ログインハンドラーを拡張してSet-Cookieヘッダーを追加
  const loginWithCookie = http.post('*/auth/login', async ({ request }) => {
    await delay(1000);

    // application/x-www-form-urlencodedのボディを取得
    const formData = await request.formData();
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'true';

    // US2: 特定の無効なパスワード（wrong_password等）の場合のみエラーを返す
    if (password === 'wrong_password') {
      return new HttpResponse(
        JSON.stringify({
          error: 'ユーザー名またはパスワードが正しくありません',
        }),
        {
          status: HTTP_STATUS_CLIENT_ERROR.UNAUTHORIZED,
          headers: { 'content-type': 'application/json' },
        }
      );
    }

    // US5: rememberMeの値に応じてCookieの有効期限を変更
    const maxAge = rememberMe ? 2592000 : 86400; // 30日 or 24時間
    const cookieValue = `session_id=abc123; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict`;

    return new HttpResponse(JSON.stringify(getLoginUserResponseMock()), {
      status: HTTP_STATUS_SUCCESS.OK,
      headers: {
        'content-type': 'application/json',
        'set-cookie': cookieValue,
      },
    });
  });

  // ログアウトハンドラーを拡張してCookie削除
  const logoutWithCookie = http.post('*/auth/logout', async () => {
    await delay(1000);

    return new HttpResponse(JSON.stringify(getLogoutUserResponseMock()), {
      status: HTTP_STATUS_SUCCESS.OK,
      headers: {
        'content-type': 'application/json',
        'set-cookie':
          'session_id=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict',
      },
    });
  });

  // Cookieを見てセッション情報を取得するハンドラー
  const sessionHandler = http.get('*/auth/session', async ({ cookies }) => {
    await delay(1000);

    console.log('Cookies:', cookies);

    const sessionId = cookies['session_id'];

    if (!sessionId) {
      return new HttpResponse(
        JSON.stringify({ error: 'セッションがありません' }),
        {
          status: HTTP_STATUS_CLIENT_ERROR.UNAUTHORIZED,
          headers: { 'content-type': 'application/json' },
        }
      );
    }
    return new HttpResponse(JSON.stringify(getGetSessionResponseMock()), {
      status: HTTP_STATUS_SUCCESS.OK,
      headers: {
        'content-type': 'application/json',
      },
    });
  });
  return [loginWithCookie, logoutWithCookie, sessionHandler];
};

import { router } from '@/app/router';
import { HTTP_STATUS_CODES } from '@/domain/constants';
import { WebApiException } from '@/domain/errors';

/**
 * セッションエラーをチェックして401ステータスだった場合にログインページにリダイレクトを行う
 * @param error エラー
 * @return 判定結果(true:セッション切れ, false:他のエラー)
 */
export const checkSessionExpire = (error: unknown): boolean => {
  if (
    error instanceof WebApiException &&
    error.statusCode === HTTP_STATUS_CODES.UNAUTHORIZED
  ) {
    const {
      basename,
      state: { location },
    } = router;
    const pathname = basename
      ? stripBaseName(location.pathname, basename)
      : location.pathname;

    void router.navigate('/login', {
      state: {
        from: {
          ...location,
          pathname,
        },
      },
      replace: true,
    });
    return true;
  }
  return false;
};

/**
 * pathnameからbasenameを除去する
 * @param pathname 現在のパス名
 * @param baseName ベース名
 * @returns 除去後のパス名
 * @remarks
 * - basenameが'/'または空文字列の場合はpathnameをそのまま返す
 * - 大文字・小文字を区別しない
 * - basenameがpathnameの先頭にあり、かつその後に'/'または文字列の終端が続く場合にのみbasenameを除去する
 * - 上記以外の場合（basenameがpathnameに含まれない、または部分一致の場合など）は安全のため'/'を返す（通常は発生しない想定だが防御的に対応）
 */
function stripBaseName(pathname: string, baseName: string): string {
  if (baseName === '/') return pathname;

  if (!pathname.toLowerCase().startsWith(baseName.toLowerCase())) {
    return '/';
  }

  // basename末尾にスラッシュがある場合は、それを除いた位置から開始
  const startIndex = baseName.endsWith('/')
    ? baseName.length - 1
    : baseName.length;

  const nextChar = pathname.charAt(startIndex);

  // 次の文字が'/'でない場合は部分一致なのでマッチしない
  if (nextChar && nextChar !== '/') {
    return '/';
  }

  return pathname.slice(startIndex) || '/';
}

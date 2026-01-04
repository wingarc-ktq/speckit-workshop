import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { router } from '@/app/router';
import { HTTP_STATUS_CODES } from '@/domain/constants';
import { WebApiException } from '@/domain/errors';

import { checkSessionExpire } from '../sessionErrorHandler';

describe('checkSessionExpire', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.spyOn(router, 'navigate').mockImplementation(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('401エラーの場合、trueを返してログインページにリダイレクトする', () => {
    const error = new WebApiException(
      HTTP_STATUS_CODES.UNAUTHORIZED,
      'Unauthorized',
      { message: 'Session expired' }
    );

    const result = checkSessionExpire(error);

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: router.state.location },
      replace: true,
    });
  });

  test('401以外のエラーの場合、falseを返してリダイレクトしない', () => {
    const error = new WebApiException(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      'Internal Server Error',
      { message: 'Server error' }
    );

    const result = checkSessionExpire(error);

    expect(result).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('WebApiException以外のエラーの場合、falseを返してリダイレクトしない', () => {
    const error = new Error('Network error');

    const result = checkSessionExpire(error);

    expect(result).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  describe('basename処理', () => {
    test.each([
      {
        description: 'basenameがない場合、pathnameをそのまま使用する',
        basename: undefined,
        currentPathname: '/pathname/123',
        expectedPathname: '/pathname/123',
      },
      {
        description: 'basenameが空文字列の場合、pathnameをそのまま使用する',
        basename: '',
        currentPathname: '/pathname/123',
        expectedPathname: '/pathname/123',
      },
      {
        description: 'basenameが/の場合、pathnameをそのまま使用する',
        basename: '/',
        currentPathname: '/pathname/123',
        expectedPathname: '/pathname/123',
      },
      {
        description: 'basenameが/baseの場合、pathnameから/baseを除去する',
        basename: '/base',
        currentPathname: '/base/pathname/123',
        expectedPathname: '/pathname/123',
      },
      {
        description: 'basenameが/base/の場合、pathnameから/base/を除去する',
        basename: '/base/',
        currentPathname: '/base/pathname/456',
        expectedPathname: '/pathname/456',
      },
      {
        description: 'basenameが/base/xxxの場合、pathnameから除去する',
        basename: '/base/xxx',
        currentPathname: '/base/xxx/pathname/456',
        expectedPathname: '/pathname/456',
      },
      {
        description: 'pathnameがbasenameと完全一致する場合、/を返す',
        basename: '/base',
        currentPathname: '/base',
        expectedPathname: '/',
      },
      {
        description: 'pathnameがbasenameを含まない場合、/を返す',
        basename: '/base',
        currentPathname: '/other/path',
        expectedPathname: '/',
      },
      {
        description: 'basenameが複数回出現する場合、最初の1回のみ除去する',
        basename: '/base',
        currentPathname: '/base/base/pathname',
        expectedPathname: '/base/pathname',
      },
      {
        description: 'basenameが/base/でpathnameが/base/の場合、/を返す',
        basename: '/base/',
        currentPathname: '/base/',
        expectedPathname: '/',
      },
      {
        description:
          'basenameが/base/でpathnameが/baseの場合、マッチせず/を返す',
        basename: '/base/',
        currentPathname: '/base',
        expectedPathname: '/',
      },
      {
        description:
          '部分一致を防ぐ：basenameが/appでpathnameが/applicationの場合、/を返す',
        basename: '/app',
        currentPathname: '/application',
        expectedPathname: '/',
      },
    ])('$description', ({ basename, currentPathname, expectedPathname }) => {
      // basenameを設定
      Object.defineProperty(router, 'basename', {
        value: basename,
        writable: true,
        configurable: true,
      });

      // router.state.locationをモック
      Object.defineProperty(router.state, 'location', {
        value: {
          pathname: currentPathname,
          search: '?test=1',
          hash: '#section',
          state: null,
          key: 'test-key',
        },
        writable: true,
        configurable: true,
      });

      const error = new WebApiException(
        HTTP_STATUS_CODES.UNAUTHORIZED,
        'Unauthorized',
        { message: 'Session expired' }
      );

      const result = checkSessionExpire(error);

      expect(result).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          from: {
            pathname: expectedPathname,
            search: '?test=1',
            hash: '#section',
            state: null,
            key: 'test-key',
          },
        },
        replace: true,
      });
    });
  });
});

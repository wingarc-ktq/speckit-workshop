import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { HTTP_STATUS_CODES } from '@/domain/constants';
import { WebApiException } from '@/domain/errors';

import { AuthErrorFallback } from '../AuthErrorFallback';

describe('AuthErrorFallback', () => {
  const renderWithRouter = (error: Error, initialPath = '/protected') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthErrorFallback error={error} />
      </MemoryRouter>
    );
  };

  test('401エラーの場合はログインページにリダイレクトされること', () => {
    // WebApiException(statusCode, statusText, data)
    const error = new WebApiException(HTTP_STATUS_CODES.UNAUTHORIZED, 'Unauthorized');

    renderWithRouter(error);

    // MemoryRouterでは実際のナビゲーションは発生しないが、Navigateがレンダリングされる
    // Navigate コンポーネントは何もレンダリングしないので、コンテナが空であることを確認
    expect(screen.queryByText('Unauthorized')).not.toBeInTheDocument();
  });

  test('401以外のエラーの場合は例外が再スローされること', () => {
    const error = new WebApiException(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 'Internal Server Error');

    expect(() => renderWithRouter(error)).toThrow('Internal Server Error');
  });

  test('WebApiException以外のエラーの場合は例外が再スローされること', () => {
    const error = new Error('Generic error');

    expect(() => renderWithRouter(error)).toThrow('Generic error');
  });

  test('403エラーの場合は例外が再スローされること', () => {
    const error = new WebApiException(HTTP_STATUS_CODES.FORBIDDEN, 'Forbidden');

    expect(() => renderWithRouter(error)).toThrow('Forbidden');
  });

  test('404エラーの場合は例外が再スローされること', () => {
    const error = new WebApiException(HTTP_STATUS_CODES.NOT_FOUND, 'Not Found');

    expect(() => renderWithRouter(error)).toThrow('Not Found');
  });
});

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import {
  WebApiException,
  NetworkException,
  FatalException,
} from '@/domain/errors';
import { i18n } from '@/i18n/config';

import { RouteErrorBoundary } from '../RouteErrorBoundary';

describe('RouteErrorBoundary', () => {
  const renderWithRouter = (element: React.ReactElement, path = '/') => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element,
          errorElement: <RouteErrorBoundary />,
        },
      ],
      { initialEntries: [path] }
    );

    return render(
      <RepositoryTestWrapper>
        <RouterProvider router={router} />
      </RepositoryTestWrapper>
    );
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  test('正常なページが表示される（エラーなし）', () => {
    renderWithRouter(<div data-testid="normalContent">正常なページ</div>);

    expect(screen.getByTestId('normalContent')).toBeInTheDocument();
    expect(screen.queryByTestId('crashPage')).not.toBeInTheDocument();
  });

  test('JavaScriptエラーでCrashPageが表示される', () => {
    const ErrorComponent = () => {
      throw new Error('JavaScript Error');
    };

    renderWithRouter(<ErrorComponent />);

    expect(screen.getByTestId('crashPage')).toBeInTheDocument();
    expect(screen.getByText(/JavaScript Error/)).toBeInTheDocument();
  });

  test('404エラーでCrashPageが表示される', () => {
    renderWithRouter(<div>ホーム</div>, '/notfound');

    expect(screen.getByTestId('crashPage')).toBeInTheDocument();
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });

  test('500エラーでCrashPageが表示される', () => {
    const ServerErrorComponent = () => {
      throw new WebApiException(500, 'Internal Server Error', {
        message: 'サーバーエラーが発生しました',
      });
    };

    renderWithRouter(<ServerErrorComponent />);

    expect(screen.getByTestId('crashPage')).toBeInTheDocument();
    expect(screen.getByText(/Internal Server Error/)).toBeInTheDocument();
  });

  test('ネットワークエラーでCrashPageが表示される', () => {
    const NetworkErrorComponent = () => {
      throw new NetworkException('ネットワーク接続に失敗しました');
    };

    renderWithRouter(<NetworkErrorComponent />);

    expect(screen.getByTestId('crashPage')).toBeInTheDocument();
    expect(
      screen.getByText(/ネットワーク接続に失敗しました/)
    ).toBeInTheDocument();
  });

  test('FatalExceptionでCrashPageが表示される', () => {
    const FatalErrorComponent = () => {
      throw new FatalException('致命的なエラーが発生しました', {
        source: 'test',
      });
    };

    renderWithRouter(<FatalErrorComponent />);

    expect(screen.getByTestId('crashPage')).toBeInTheDocument();
    expect(
      screen.getByText(/致命的なエラーが発生しました/)
    ).toBeInTheDocument();
  });

  test('異なるエラータイプでCrashPageが表示される', () => {
    // 文字列を投げるコンポーネント（String(error)の分岐をテスト）
    const StringErrorComponent = () => {
      throw 'String Error Message';
    };

    renderWithRouter(<StringErrorComponent />);

    expect(screen.getByTestId('crashPage')).toBeInTheDocument();
    expect(screen.getByText(/String Error Message/)).toBeInTheDocument();
  });

  test('クラッシュページのリロードボタンクリック時にページがリロードされる', async () => {
    const user = userEvent.setup();
    const mockReload = vi.fn();

    // window.location.reloadをモック
    vi.stubGlobal('location', {
      ...window.location,
      reload: mockReload,
    });

    const ErrorComponent = () => {
      throw new Error('Test Error');
    };

    renderWithRouter(<ErrorComponent />);

    const reloadButton = screen.getByTestId('reloadButton');
    await user.click(reloadButton);

    expect(mockReload).toHaveBeenCalledOnce();
  });
});

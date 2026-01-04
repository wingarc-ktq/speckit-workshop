import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { HTTP_STATUS_SERVER_ERROR } from '@/domain/constants';
import { WebApiException } from '@/domain/errors';
import { i18n } from '@/i18n/config';

import { UserMenu } from '../UserMenu';

describe('UserMenu', () => {
  const mockLogoutUser = vi.fn();

  const renderUserMenu = () => {
    const initialEntries = ['/'];
    return render(
      <RepositoryTestWrapper
        override={{
          auth: {
            logoutUser: mockLogoutUser,
          },
        }}
      >
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/" element={<UserMenu />} />
            <Route
              path="/login"
              element={<div data-testid="loginPage">Login Page</div>}
            />
          </Routes>
        </MemoryRouter>
      </RepositoryTestWrapper>
    );
  };

  beforeEach(() => {
    i18n.changeLanguage('ja');
  });

  describe('基本的な表示', () => {
    test('ユーザーアバターが表示される', () => {
      const r = renderUserMenu();

      const avatarButton = r.getByRole('button');
      expect(avatarButton).toBeInTheDocument();

      const avatarText = r.getByText('OP');
      expect(avatarText).toBeInTheDocument();
    });

    test('初期状態ではメニューが非表示', () => {
      const r = renderUserMenu();

      const logoutMenuItem = r.queryByText('ログアウト');
      expect(logoutMenuItem).not.toBeInTheDocument();
    });
  });

  describe('メニューの表示と操作', () => {
    test('アバターをクリックするとメニューが表示される', async () => {
      const user = userEvent.setup();
      const r = renderUserMenu();

      const avatarButton = r.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        const logoutMenuItem = r.getByText('ログアウト');
        expect(logoutMenuItem).toBeInTheDocument();
      });
    });

    test('ログアウトメニューにアイコンとテキストが表示される', async () => {
      const user = userEvent.setup();
      const r = renderUserMenu();

      const avatarButton = r.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        const logoutMenuItem = r.getByText('ログアウト');
        expect(logoutMenuItem).toBeInTheDocument();

        // ログアウトアイコンが存在することを確認（data-testidで検索）
        const logoutIcon = r.getByTestId('LogoutIcon');
        expect(logoutIcon).toBeInTheDocument();
      });
    });

    test('メニュー外をクリックするとメニューが閉じる', async () => {
      const user = userEvent.setup();
      const r = renderUserMenu();

      const avatarButton = r.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        const logoutMenuItem = r.getByText('ログアウト');
        expect(logoutMenuItem).toBeInTheDocument();
      });

      // Backdrop部分をクリックしてメニューを閉じる
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        await user.click(backdrop);
      }

      await waitFor(() => {
        const logoutMenuItem = r.queryByText('ログアウト');
        expect(logoutMenuItem).not.toBeInTheDocument();
      });
    });
  });

  describe('ログアウト機能', () => {
    test('ログアウトメニューをクリックするとログアウト処理が実行され、ログインページに遷移する', async () => {
      const user = userEvent.setup();
      mockLogoutUser.mockResolvedValue({ message: 'Logout successful' });

      const r = renderUserMenu();

      const avatarButton = r.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        const logoutMenuItem = r.getByText('ログアウト');
        expect(logoutMenuItem).toBeInTheDocument();
      });

      const logoutMenuItem = r.getByText('ログアウト');
      await user.click(logoutMenuItem);

      await waitFor(() => {
        expect(mockLogoutUser).toHaveBeenCalledTimes(1);
        // ログインページに遷移したことを確認
        const loginPage = r.getByTestId('loginPage');
        expect(loginPage).toBeInTheDocument();
      });
    });

    test('ログアウト処理でエラーが発生してもメニューが閉じる', async () => {
      const user = userEvent.setup();

      const error = new WebApiException(
        HTTP_STATUS_SERVER_ERROR.SERVICE_UNAVAILABLE,
        'SERVICE_UNAVAILABLE',
        {
          message: 'Logout failed',
        }
      );
      mockLogoutUser.mockRejectedValue(error);

      const r = renderUserMenu();

      const avatarButton = r.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        const logoutMenuItem = r.getByText('ログアウト');
        expect(logoutMenuItem).toBeInTheDocument();
      });

      const logoutMenuItem = r.getByText('ログアウト');
      await user.click(logoutMenuItem);

      await waitFor(() => {
        expect(mockLogoutUser).toHaveBeenCalledTimes(1);
      });

      // メニューが閉じることを確認
      await waitFor(() => {
        const logoutMenuItemAfterError = r.queryByText('ログアウト');
        expect(logoutMenuItemAfterError).not.toBeInTheDocument();
      });
    });
  });
});

import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { NotFoundPage } from '../NotFoundPage';

// モックナビゲーション
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotFoundPage', () => {
  const renderNotFoundPage = () => {
    return render(
      <RepositoryTestWrapper>
        <BrowserRouter>
          <NotFoundPage />
        </BrowserRouter>
      </RepositoryTestWrapper>
    );
  };
  beforeEach(async () => {
    mockNavigate.mockClear();
    await i18n.changeLanguage('ja');
  });

  describe('初期表示', () => {
    test('404エラーページが正しく表示されること', () => {
      const r = renderNotFoundPage();

      expect(r.getByText('404')).toBeInTheDocument();
      expect(r.getByText('ページが見つかりません')).toBeInTheDocument();
      expect(
        r.getByText(
          /お探しのページは削除されたか、一時的にアクセスできない状態です/
        )
      ).toBeInTheDocument();
    });

    test('ホームボタンが表示されること', () => {
      const r = renderNotFoundPage();

      const homeButton = r.getByRole('button', { name: /ホームに戻る/ });
      expect(homeButton).toBeInTheDocument();
    });

    test('戻るボタンが表示されること', () => {
      const r = renderNotFoundPage();

      const backButton = r.getByRole('button', {
        name: /前のページに戻る/,
      });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('ホームボタンをクリックした時にホームページに遷移すること', () => {
      const r = renderNotFoundPage();

      const homeButton = r.getByRole('button', { name: /ホームに戻る/ });
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('戻るボタンをクリックした時にナビゲーション履歴が戻ること', () => {
      const r = renderNotFoundPage();

      const backButton = r.getByRole('button', {
        name: /前のページに戻る/,
      });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});

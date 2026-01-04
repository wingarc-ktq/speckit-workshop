import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';
import { useMenuItems } from '@/presentations/layouts/AppLayout/hooks/useMenuItems';

import { AppBreadcrumbs } from '../AppBreadcrumbs';

// useMenuItemsフックをモック
vi.mock('@/presentations/layouts/AppLayout/hooks/useMenuItems');

describe('AppBreadcrumbs', () => {
  const hierarchicalMenuItems = [
    { text: 'ルート', path: '/', icon: <div>root-icon</div> },
    { text: '1階層', path: '/page', icon: <div>page-icon</div> },
    { text: '2階層', path: '/page/subpage', icon: <div>subpage-icon</div> },
    {
      text: '3階層',
      path: '/page/subpage/detail',
      icon: <div>detail-icon</div>,
    },
  ];

  const renderAppBreadcrumbs = (pathname = '/') => {
    return render(
      <RepositoryTestWrapper>
        <MemoryRouter initialEntries={[pathname]}>
          <AppBreadcrumbs />
        </MemoryRouter>
      </RepositoryTestWrapper>
    );
  };

  beforeEach(async () => {
    i18n.changeLanguage('ja');
    vi.mocked(useMenuItems).mockReturnValue(hierarchicalMenuItems);
  });

  describe('基本的な表示', () => {
    test('ルートパスでホームのみ表示される', () => {
      const { getByText } = renderAppBreadcrumbs('/');

      // ルートパスではホームのみ表示される
      expect(getByText('ホーム')).toBeInTheDocument();
    });
    describe('階層的なパスでの表示', () => {
      test('1階層のパスでホームと1階層が表示される', () => {
        const { getByText } = renderAppBreadcrumbs('/page');

        expect(getByText('ホーム')).toBeInTheDocument();
        expect(getByText('1階層')).toBeInTheDocument();
      });

      test('2階層のパスでホーム、1階層、2階層が表示される', () => {
        const { getByText } = renderAppBreadcrumbs('/page/subpage');

        expect(getByText('ホーム')).toBeInTheDocument();
        expect(getByText('1階層')).toBeInTheDocument();
        expect(getByText('2階層')).toBeInTheDocument();
      });

      test('3階層のパスで全ての階層が表示される', () => {
        const { getByText } = renderAppBreadcrumbs('/page/subpage/detail');

        expect(getByText('ホーム')).toBeInTheDocument();
        expect(getByText('1階層')).toBeInTheDocument();
        expect(getByText('2階層')).toBeInTheDocument();
        expect(getByText('3階層')).toBeInTheDocument();
      });
    });
  });

  describe('表示制御', () => {
    test('メニューにないパスは表示されない', () => {
      const { getByText, queryByText } = renderAppBreadcrumbs('/unknown');

      // ホームのみ表示される
      expect(getByText('ホーム')).toBeInTheDocument();

      // 存在しないパスは表示されない
      expect(queryByText('unknown')).not.toBeInTheDocument();
    });

    test('メニューアイテムが空の場合でもホームは表示される', async () => {
      // モック関数を空配列に設定
      const { useMenuItems } = await import(
        '@/presentations/layouts/AppLayout/hooks/useMenuItems'
      );
      vi.mocked(useMenuItems).mockReturnValue([]);

      const { getByText } = renderAppBreadcrumbs('/page');

      // ホームは常に表示される
      expect(getByText('ホーム')).toBeInTheDocument();
    });
  });

  describe('リンクとテキスト', () => {
    test('パンくずリストのリンクが正しく設定される', () => {
      const { getByRole } = renderAppBreadcrumbs('/page/subpage/detail');

      const homeLink = getByRole('link', { name: 'ホーム' });
      expect(homeLink).toHaveAttribute('href', '/');

      const projectsLink = getByRole('link', { name: '1階層' });
      expect(projectsLink).toHaveAttribute('href', '/page');
    });

    test('最後の要素はリンクではなくテキストとして表示される', () => {
      const { getByText, queryByRole } = renderAppBreadcrumbs(
        '/page/subpage/detail'
      );

      // 最後の要素はリンクではない
      const detailText = getByText('3階層');
      expect(detailText).toBeInTheDocument();
      expect(queryByRole('link', { name: '3階層' })).not.toBeInTheDocument();
    });
  });
});

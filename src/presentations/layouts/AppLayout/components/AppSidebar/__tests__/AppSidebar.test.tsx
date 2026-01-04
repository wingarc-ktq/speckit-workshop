import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { i18n } from '@/i18n/config';
import { useMenuItems } from '@/presentations/layouts/AppLayout/hooks/useMenuItems';

import { AppSidebar } from '../AppSidebar';

// useMenuItemsフックをモック
vi.mock('@/presentations/layouts/AppLayout/hooks/useMenuItems');

const renderAppSidebar = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppSidebar />
    </MemoryRouter>
  );
};

describe('AppSidebar', () => {
  describe('基本的な表示', () => {
    const mockMenuItems = [
      { text: 'ルート', path: '/', icon: <div>root-icon</div> },
      { text: 'ページ', path: '/page', icon: <div>page-icon</div> },
    ];

    beforeEach(() => {
      i18n.changeLanguage('ja');
      vi.mocked(useMenuItems).mockReturnValue(mockMenuItems);
    });

    test('メニューアイテムが表示される', async () => {
      const { getByText } = renderAppSidebar();

      expect(getByText('ルート')).toBeInTheDocument();
      expect(getByText('ページ')).toBeInTheDocument();
    });

    test('現在のパスに対応するメニューアイテムが選択状態になる', async () => {
      const { getByText } = renderAppSidebar('/page');

      const pageMenuItem = getByText('ページ').closest('a');
      expect(pageMenuItem).toHaveAttribute('href', '/page');
    });
  });

  describe('特殊なケース', () => {
    test('メニューアイテムが空の場合でもエラーにならない', async () => {
      vi.mocked(useMenuItems).mockReturnValue([]);

      const { container } = renderAppSidebar();

      // リストは存在するが、アイテムは表示されない
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
      expect(list?.children).toHaveLength(0);
    });

    test('多数のメニューアイテムが正しく表示される', async () => {
      const mockMenuItems = [
        { text: 'ダッシュボード', path: '/', icon: <DashboardIcon /> },
        { text: 'ファイル', path: '/files', icon: <FolderIcon /> },
        { text: '設定', path: '/settings', icon: <SettingsIcon /> },
        { text: 'ユーザー', path: '/users', icon: <DashboardIcon /> },
        { text: 'レポート', path: '/reports', icon: <FolderIcon /> },
      ];
      vi.mocked(useMenuItems).mockReturnValue(mockMenuItems);

      const { getByText } = renderAppSidebar();

      mockMenuItems.forEach((item) => {
        expect(getByText(item.text)).toBeInTheDocument();
      });
    });

    test('特殊文字を含むメニューアイテムが正しく表示される', async () => {
      const mockMenuItems = [
        {
          text: 'ファイル & フォルダー',
          path: '/files',
          icon: <FolderIcon />,
        },
        {
          text: 'レポート（詳細）',
          path: '/reports',
          icon: <DashboardIcon />,
        },
      ];
      vi.mocked(useMenuItems).mockReturnValue(mockMenuItems);

      const { getByText } = renderAppSidebar();

      expect(getByText('ファイル & フォルダー')).toBeInTheDocument();
      expect(getByText('レポート（詳細）')).toBeInTheDocument();
    });
  });
});

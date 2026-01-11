import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { i18n } from '@/i18n/config';

import { AppSidebar } from '../AppSidebar';

describe('AppSidebar', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const renderAppSidebar = () => {
    return render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>
    );
  };

  describe('基本的な表示', () => {
    test('サイドバーが表示されること', () => {
      renderAppSidebar();

      const sidebar = screen.getByTestId('appSidebar');
      expect(sidebar).toBeInTheDocument();
    });

    test('サイドバーがpersistentモードで表示されること', () => {
      renderAppSidebar();

      const sidebar = screen.getByTestId('appSidebar');
      expect(sidebar).toHaveClass('MuiDrawer-root');
    });
  });

  describe('セクションコンポーネントの表示', () => {
    test('GeneralSectionが表示されること', () => {
      renderAppSidebar();

      const generalSection = screen.getByTestId('generalSection');
      expect(generalSection).toBeInTheDocument();
    });

    test('TagsSectionが表示されること', () => {
      renderAppSidebar();

      const tagsSection = screen.getByTestId('tagsSection');
      expect(tagsSection).toBeInTheDocument();
    });

    test('StorageSectionが表示されること', () => {
      renderAppSidebar();

      const storageSection = screen.getByTestId('storageSection');
      expect(storageSection).toBeInTheDocument();
    });

    test('全てのセクションが正しい順序で表示されること', () => {
      renderAppSidebar();

      const generalSection = screen.getByTestId('generalSection');
      const tagsSection = screen.getByTestId('tagsSection');
      const storageSection = screen.getByTestId('storageSection');

      // 全てのセクションが存在することを確認
      expect(generalSection).toBeInTheDocument();
      expect(tagsSection).toBeInTheDocument();
      expect(storageSection).toBeInTheDocument();

      // 順序を確認: GeneralSection → TagsSection → StorageSection
      const sidebar = screen.getByTestId('appSidebar');
      const sections = Array.from(
        sidebar.querySelectorAll('[data-testid$="Section"]')
      );

      expect(sections).toHaveLength(3);
      expect(sections[0]).toHaveAttribute('data-testid', 'generalSection');
      expect(sections[1]).toHaveAttribute('data-testid', 'tagsSection');
      expect(sections[2]).toHaveAttribute('data-testid', 'storageSection');
    });
  });

  describe('構造とレイアウト', () => {
    test('Drawerコンポーネントが正しい属性を持つこと', () => {
      renderAppSidebar();

      const sidebar = screen.getByTestId('appSidebar');

      // MUI Drawerのクラスが適用されていることを確認
      expect(sidebar).toHaveClass('MuiDrawer-root');

      // Paper要素が存在することを確認（Drawerの内部要素）
      const paper = sidebar.querySelector('.MuiDrawer-paper');
      expect(paper).toBeInTheDocument();
    });

    test('Toolbarが表示されること', () => {
      const { container } = renderAppSidebar();

      // MUI Toolbarのクラスが存在することを確認
      const toolbar = container.querySelector('.MuiToolbar-root');
      expect(toolbar).toBeInTheDocument();
    });
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { i18n } from '@/i18n/config';

import { TagsSection } from '../TagsSection';

const renderTagsSection = () => {
  return render(
    <MemoryRouter>
      <TagsSection />
    </MemoryRouter>
  );
};

describe('TagsSection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appSidebar.tags.title', () => {
      test('locale:ja "タグ" が表示される', () => {
        renderTagsSection();
        expect(screen.getByText('タグ')).toBeInTheDocument();
      });
    });
  });

  describe('初期表示', () => {
    test('セクションタイトルが表示されること', () => {
      renderTagsSection();
      expect(screen.getByText('タグ')).toBeInTheDocument();
    });

    test('追加ボタンが表示されること', () => {
      renderTagsSection();

      const addButton = screen.getByTestId('addTagButton');
      expect(addButton).toBeInTheDocument();
    });

    test.todo('タグリストが正しく表示されること');
  });
});

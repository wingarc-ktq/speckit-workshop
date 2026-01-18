import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { TagsSection } from '../TagsSection';

describe('TagsSection', () => {
  const mockGetTags = vi.fn(async () => mockTags);

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    mockGetTags.mockClear();
  });

  const renderTagsSection = async (initialUrl = '/') => {
    const r = render(
      <RepositoryTestWrapper
        override={{
          tags: {
            getTags: mockGetTags,
          },
        }}
        hasSuspense
      >
        <MemoryRouter initialEntries={[initialUrl]}>
          <TagsSection />
        </MemoryRouter>
      </RepositoryTestWrapper>
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appSidebar.tags.title', () => {
      test('locale:ja "タグ" が表示される', async () => {
        await renderTagsSection();

        expect(screen.getByText('タグ')).toBeInTheDocument();
      });
    });
  });

  describe('初期表示', () => {
    test('セクションタイトルが表示されること', async () => {
      await renderTagsSection();

      expect(screen.getByText('タグ')).toBeInTheDocument();
    });

    test('追加ボタンが表示されること', async () => {
      await renderTagsSection();

      const addButton = screen.getByTestId('addTagButton');
      expect(addButton).toBeInTheDocument();
    });

    test('タグリストが正しく表示されること', async () => {
      await renderTagsSection();

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    test('各タグが非選択状態で表示されること', async () => {
      await renderTagsSection();

      // 非選択状態のアイコンが表示されていることを確認
      const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
      expect(outlinedIcons).toHaveLength(3);
    });
  });

  describe('ユーザー操作', () => {
    test('タグをクリックできること', async () => {
      const user = userEvent.setup();
      await renderTagsSection();

      const importantTag = screen.getByText('Important');
      await user.click(importantTag);

      // クリックしても例外が発生しないこと
      expect(importantTag).toBeInTheDocument();
    });
  });

  describe('選択状態の表示', () => {
    test('URLパラメータで選択されているタグが選択状態で表示されること', async () => {
      await renderTagsSection('/?tags=tag-001');

      // 選択状態のアイコンが表示されることを確認
      const selectedIcons = screen.getAllByTestId('SellIcon');
      expect(selectedIcons).toHaveLength(1);

      // 非選択状態のアイコンも表示されることを確認
      const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
      expect(outlinedIcons).toHaveLength(2);
    });

    test('複数のタグが選択状態で表示されること', async () => {
      await renderTagsSection('/?tags=tag-001,tag-002');

      const selectedIcons = screen.getAllByTestId('SellIcon');
      expect(selectedIcons).toHaveLength(2);

      const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
      expect(outlinedIcons).toHaveLength(1);
    });
  });
});

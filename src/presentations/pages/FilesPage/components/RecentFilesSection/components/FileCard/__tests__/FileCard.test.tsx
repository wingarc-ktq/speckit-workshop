import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';

import { mockFile } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { DocumentFile } from '@/domain/models/file/type';
import { i18n } from '@/i18n/config';

import { FileCard } from '../FileCard';

describe('FileCard', () => {
  const getTags = vi.fn();
  const defaultOnView = vi.fn();

  const renderFileCard = async (props?: {
    file?: DocumentFile;
    onView?: (fileId: string) => void;
  }) => {
    const file = props?.file ?? mockFile;
    const onView = props?.onView ?? defaultOnView;

    const r = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          tags: {
            getTags: getTags,
          },
        }}
      >
        <FileCard file={file} onView={onView} />
      </RepositoryTestWrapper>
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    getTags.mockResolvedValue(mockTags);
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.recentFilesSection.fileCard.viewButton', () => {
      test('locale:ja "文書を見る" が表示される', async () => {
        await renderFileCard();

        const viewButton = screen.getByRole('button', { name: '文書を見る' });
        expect(viewButton).toBeInTheDocument();
      });
    });
  });

  describe('基本的な表示', () => {
    test('ファイル名が表示されること', async () => {
      await renderFileCard();

      await waitFor(() => {
        expect(screen.getByText(mockFile.name)).toBeInTheDocument();
      });
    });

    test('アップロード日時がyyyy/MM/dd形式で表示されること', async () => {
      await renderFileCard();

      // mockFileのuploadedAtは'2025-01-11T10:00:00Z'
      expect(screen.getByText('2025/01/11')).toBeInTheDocument();
    });

    test('ファイルアイコンが表示されること', async () => {
      await renderFileCard();

      // ファイルアイコンが表示されることを確認
      const fileIcon = screen.getByTestId('DescriptionIcon');
      expect(fileIcon).toBeInTheDocument();
    });

    test('ボタンにArrowOutwardIconが表示されること', async () => {
      await renderFileCard();

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      const icon = viewButton.querySelector(
        'svg[data-testid="ArrowOutwardIcon"]'
      );
      expect(icon).toBeInTheDocument();
    });
  });

  describe('TagChipsの表示', () => {
    test('タグが存在する場合、TagChipsが表示されること', async () => {
      const fileWithTags: DocumentFile = {
        ...mockFile,
        tagIds: ['tag-001'], // 「Important」タグ
      };

      await renderFileCard({ file: fileWithTags });

      // TagChipsコンポーネントが描画され、タグ名が表示される
      // tag-1 の name は「Important」
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    test('複数のタグがある場合、全てのタグが表示されること', async () => {
      const fileWithMultipleTags: DocumentFile = {
        ...mockFile,
        tagIds: ['tag-001', 'tag-002', 'tag-003'], // Important、Review、Urgent
      };

      await renderFileCard({ file: fileWithMultipleTags });

      await waitFor(() => {
        expect(screen.getByText('Important')).toBeInTheDocument();
      });
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    test('タグがない場合、TagChipsが表示されないこと', async () => {
      const fileWithoutTags: DocumentFile = {
        ...mockFile,
        tagIds: [],
      };

      await renderFileCard({ file: fileWithoutTags });

      // TagChipsコンポーネント自体が描画されないため、タグ名が表示されない
      expect(screen.queryByText('Important')).not.toBeInTheDocument();
      expect(screen.queryByText('Review')).not.toBeInTheDocument();
      expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('"文書を見る"ボタンをクリックするとonViewが呼び出されること', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();

      await renderFileCard({ onView });

      expect(onView).not.toHaveBeenCalled();

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      await user.click(viewButton);

      expect(onView).toHaveBeenCalledTimes(1);
    });

    test('"文書を見る"ボタンをクリックすると正しいファイルIDが渡されること', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      const customFile: DocumentFile = {
        ...mockFile,
        id: 'custom-file-id',
      };

      await renderFileCard({ file: customFile, onView });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      await user.click(viewButton);

      expect(onView).toHaveBeenCalledWith('custom-file-id');
    });

    test('onViewが未指定の場合、ボタンクリックでエラーが発生しないこと', async () => {
      const user = userEvent.setup();

      await renderFileCard({ onView: undefined });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      await expect(user.click(viewButton)).resolves.not.toThrow();
    });
  });

  describe('エッジケース', () => {
    test('ファイル名が長い場合でも表示されること', async () => {
      const fileWithLongName: DocumentFile = {
        ...mockFile,
        name: 'とても長いファイル名のドキュメント_非常に詳細な説明付き_バージョン1.2.3_最終版.pdf',
      };

      await renderFileCard({ file: fileWithLongName });

      expect(
        screen.getByText(
          'とても長いファイル名のドキュメント_非常に詳細な説明付き_バージョン1.2.3_最終版.pdf'
        )
      ).toBeInTheDocument();
    });

    test('descriptionがnullの場合でも正常に表示されること', async () => {
      const fileWithNullDescription: DocumentFile = {
        ...mockFile,
        description: null,
      };

      await renderFileCard({ file: fileWithNullDescription });

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('2025/01/11')).toBeInTheDocument();
    });

    test('異なるMIMEタイプのファイルでも表示されること', async () => {
      const excelFile: DocumentFile = {
        ...mockFile,
        id: 'excel-file',
        name: 'spreadsheet.xlsx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      await renderFileCard({ file: excelFile });

      expect(screen.getByText('spreadsheet.xlsx')).toBeInTheDocument();
    });
  });
});

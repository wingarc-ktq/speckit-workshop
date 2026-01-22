import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { FileInfo } from '@/adapters/generated/files';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { FileListItem } from '../FileListItem';

describe('FileListItem', () => {
  const mockFile: FileInfo = {
    id: 'file-1',
    name: 'テストファイル.pdf',
    size: 1024000,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    tagIds: ['tag-1'],
    downloadUrl: 'https://example.com/download/file-1',
  };

  const mockTags = [
    { id: 'tag-1', name: '重要', color: 'red' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-2', name: 'ドキュメント', color: 'blue' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ];

  const renderFileListItem = (props: {
    file?: FileInfo;
    onFileClick?: (fileId: string) => void;
  } = {}) => {
    const defaultProps = {
      file: mockFile,
      onFileClick: vi.fn(),
    };
    const mergedProps = { ...defaultProps, ...props };

    return {
      ...render(
        <RepositoryTestWrapper
          override={{
            files: {
              getTags: async () => ({ tags: mockTags }),
            },
          }}
        >
          <FileListItem {...mergedProps} />
        </RepositoryTestWrapper>
      ),
      onFileClick: mergedProps.onFileClick,
    };
  };

  test('ファイル名が表示されること', () => {
    renderFileListItem();

    expect(screen.getByText('テストファイル.pdf')).toBeInTheDocument();
  });

  test('ファイルサイズが表示されること', () => {
    renderFileListItem();

    expect(screen.getByText('1000 KB')).toBeInTheDocument();
  });

  test('アップロード日時が表示されること', () => {
    renderFileListItem();

    expect(screen.getByText('2024/01/15')).toBeInTheDocument();
  });

  test('タグが表示されること', async () => {
    renderFileListItem();

    await waitFor(() => {
      expect(screen.getByText('重要')).toBeInTheDocument();
    });
  });

  test('ファイルをクリックするとonFileClickが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onFileClick } = renderFileListItem();

    await user.click(screen.getByText('テストファイル.pdf'));

    expect(onFileClick).toHaveBeenCalledWith('file-1');
  });

  test('onFileClickがない場合はポインターカーソルにならないこと', () => {
    renderFileListItem({ onFileClick: undefined });

    const card = screen.getByText('テストファイル.pdf').closest('.MuiCard-root');
    expect(card).toHaveStyle({ cursor: 'default' });
  });

  test('タグが3つ以上ある場合は残りの数が表示されること', async () => {
    const fileWithManyTags: FileInfo = {
      ...mockFile,
      tagIds: ['tag-1', 'tag-2', 'tag-3', 'tag-4'],
    };
    const tagsWithMore = [
      ...mockTags,
      { id: 'tag-3', name: '仕様書', color: 'green' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      { id: 'tag-4', name: '報告書', color: 'yellow' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    ];

    render(
      <RepositoryTestWrapper
        override={{
          files: {
            getTags: async () => ({ tags: tagsWithMore }),
          },
        }}
      >
        <FileListItem file={fileWithManyTags} />
      </RepositoryTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('+1')).toBeInTheDocument();
    });
  });
});

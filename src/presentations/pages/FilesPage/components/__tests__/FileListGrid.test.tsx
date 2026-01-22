import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { FileInfo } from '@/adapters/generated/files';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { FileListGrid } from '../FileListGrid';

describe('FileListGrid', () => {
  const mockFiles: FileInfo[] = [
    {
      id: 'file-1',
      name: 'テストファイル1.pdf',
      size: 1024000,
      mimeType: 'application/pdf',
      uploadedAt: '2024-01-15T10:30:00Z',
      tagIds: [],
      downloadUrl: 'https://example.com/download/file-1',
    },
    {
      id: 'file-2',
      name: 'テストファイル2.docx',
      size: 2048000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: '2024-01-16T10:30:00Z',
      tagIds: [],
      downloadUrl: 'https://example.com/download/file-2',
    },
  ];

  const renderFileListGrid = (props: {
    files?: FileInfo[];
    isLoading?: boolean;
    onFileClick?: (fileId: string) => void;
  } = {}) => {
    const defaultProps = {
      files: mockFiles,
      isLoading: false,
      onFileClick: vi.fn(),
    };
    const mergedProps = { ...defaultProps, ...props };

    return {
      ...render(
        <RepositoryTestWrapper
          override={{
            files: {
              getTags: async () => ({ tags: [] }),
            },
          }}
        >
          <FileListGrid {...mergedProps} />
        </RepositoryTestWrapper>
      ),
      onFileClick: mergedProps.onFileClick,
    };
  };

  test('ローディング中はスピナーが表示されること', () => {
    renderFileListGrid({ isLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('ファイルがない場合はメッセージが表示されること', () => {
    renderFileListGrid({ files: [] });

    expect(screen.getByText('ファイルが見つかりません')).toBeInTheDocument();
  });

  test('ファイル一覧が表示されること', () => {
    renderFileListGrid();

    expect(screen.getByText('テストファイル1.pdf')).toBeInTheDocument();
    expect(screen.getByText('テストファイル2.docx')).toBeInTheDocument();
  });

  test('ファイルをクリックするとonFileClickが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onFileClick } = renderFileListGrid();

    await user.click(screen.getByText('テストファイル1.pdf'));

    expect(onFileClick).toHaveBeenCalledWith('file-1');
  });
});

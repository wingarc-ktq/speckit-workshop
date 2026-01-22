import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { FileInfo } from '@/adapters/generated/files';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { FileListTable } from '../FileListTable';

describe('FileListTable', () => {
  const mockFiles: FileInfo[] = [
    {
      id: 'file-1',
      name: 'テストファイル1.pdf',
      size: 1024000,
      mimeType: 'application/pdf',
      uploadedAt: '2024-01-15T10:30:00Z',
      tagIds: ['tag-1'],
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

  const mockTags = [
    { id: 'tag-1', name: '重要', color: 'red' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ];

  const renderFileListTable = (props: {
    files?: FileInfo[];
    isLoading?: boolean;
    onFileClick?: (fileId: string) => void;
    selectedFileIds?: string[];
    onSelectionChange?: (fileIds: string[]) => void;
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
              getTags: async () => ({ tags: mockTags }),
              deleteFile: async () => undefined,
            },
          }}
        >
          <FileListTable {...mergedProps} />
        </RepositoryTestWrapper>
      ),
      onFileClick: mergedProps.onFileClick,
      onSelectionChange: mergedProps.onSelectionChange,
    };
  };

  test('ローディング中はスピナーが表示されること', () => {
    renderFileListTable({ isLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('ファイルがない場合はメッセージが表示されること', () => {
    renderFileListTable({ files: [] });

    expect(screen.getByText('ファイルが見つかりません')).toBeInTheDocument();
  });

  test('テーブルヘッダーが表示されること', () => {
    renderFileListTable();

    expect(screen.getByText('ファイル名')).toBeInTheDocument();
    expect(screen.getByText('カテゴリー')).toBeInTheDocument();
    expect(screen.getByText('サイズ')).toBeInTheDocument();
  });

  test('ファイル一覧が表示されること', () => {
    renderFileListTable();

    expect(screen.getByText('テストファイル1.pdf')).toBeInTheDocument();
    expect(screen.getByText('テストファイル2.docx')).toBeInTheDocument();
  });

  test('ファイルサイズが表示されること', () => {
    renderFileListTable();

    // サイズカラムにファイルサイズが表示されることを確認
    const sizeElements = screen.getAllByText(/KB$/);
    expect(sizeElements.length).toBeGreaterThan(0);
  });

  test('タグが表示されること', async () => {
    renderFileListTable();

    await waitFor(() => {
      expect(screen.getByText('重要')).toBeInTheDocument();
    });
  });

  test('行をクリックするとonFileClickが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onFileClick } = renderFileListTable();

    await user.click(screen.getByText('テストファイル1.pdf'));

    expect(onFileClick).toHaveBeenCalledWith('file-1');
  });

  test('削除ボタンをクリックすると確認ダイアログが表示されること', async () => {
    const user = userEvent.setup();
    renderFileListTable();

    const deleteButtons = screen.getAllByLabelText('delete');
    await user.click(deleteButtons[0]);

    expect(screen.getByText('ファイルを削除しますか？')).toBeInTheDocument();
  });

  test('選択モードでチェックボックスが表示されること', () => {
    renderFileListTable({
      selectedFileIds: [],
      onSelectionChange: vi.fn(),
    });

    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  test('全選択チェックボックスをクリックすると全ファイルが選択されること', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderFileListTable({
      selectedFileIds: [],
      onSelectionChange,
    });

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(['file-1', 'file-2']);
  });
});

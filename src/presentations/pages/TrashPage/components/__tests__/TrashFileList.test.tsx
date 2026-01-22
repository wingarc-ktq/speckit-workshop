import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { TrashFileInfo } from '@/domain/models/files';

import { TrashFileList } from '../TrashFileList';

describe('TrashFileList', () => {
  const mockFiles: TrashFileInfo[] = [
    {
      id: 'file-1',
      name: '削除済みファイル1.pdf',
      deletedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'file-2',
      name: '削除済みファイル2.docx',
      deletedAt: '2024-01-16T10:30:00Z',
    },
  ];

  const defaultProps = {
    files: mockFiles,
    isLoading: false,
    onRestore: vi.fn(),
    onPermanentDelete: vi.fn(),
  };

  test('ローディング中はスピナーが表示されること', () => {
    render(<TrashFileList {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('ファイルがない場合はメッセージが表示されること', () => {
    render(<TrashFileList {...defaultProps} files={[]} />);

    expect(screen.getByText('ゴミ箱にファイルはありません')).toBeInTheDocument();
  });

  test('ファイル一覧が表示されること', () => {
    render(<TrashFileList {...defaultProps} />);

    expect(screen.getByText('削除済みファイル1.pdf')).toBeInTheDocument();
    expect(screen.getByText('削除済みファイル2.docx')).toBeInTheDocument();
  });

  test('削除日時が表示されること', () => {
    render(<TrashFileList {...defaultProps} />);

    expect(screen.getByText('2024/01/15 19:30')).toBeInTheDocument();
    expect(screen.getByText('2024/01/16 19:30')).toBeInTheDocument();
  });

  test('復元ボタンをクリックするとonRestoreが呼ばれること', async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn();
    render(<TrashFileList {...defaultProps} onRestore={onRestore} />);

    const restoreButtons = screen.getAllByRole('button', { name: '復元' });
    await user.click(restoreButtons[0]);

    expect(onRestore).toHaveBeenCalledWith(mockFiles[0]);
  });

  test('完全削除ボタンをクリックするとonPermanentDeleteが呼ばれること', async () => {
    const user = userEvent.setup();
    const onPermanentDelete = vi.fn();
    render(<TrashFileList {...defaultProps} onPermanentDelete={onPermanentDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: '完全削除' });
    await user.click(deleteButtons[0]);

    expect(onPermanentDelete).toHaveBeenCalledWith(mockFiles[0]);
  });

  test('削除中は復元ボタンが無効化されること', () => {
    render(<TrashFileList {...defaultProps} isDeleting={true} />);

    const restoreButtons = screen.getAllByRole('button', { name: '復元' });
    restoreButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  test('削除中は完全削除ボタンが無効化されること', () => {
    render(<TrashFileList {...defaultProps} isDeleting={true} />);

    const deleteButtons = screen.getAllByRole('button', { name: '完全削除' });
    deleteButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  test('復元中は復元ボタンが無効化されること', () => {
    render(<TrashFileList {...defaultProps} isRestoring={true} />);

    const restoreButtons = screen.getAllByRole('button', { name: '復元' });
    restoreButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});

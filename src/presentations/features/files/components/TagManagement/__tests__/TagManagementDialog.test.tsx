import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { TagManagementDialog } from '../TagManagementDialog';

describe('TagManagementDialog', () => {
  const mockTags = [
    { id: 'tag-1', name: '重要', color: 'red' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-2', name: 'ドキュメント', color: 'blue' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ];

  const renderTagManagementDialog = (props: { open?: boolean; onClose?: () => void } = {}) => {
    const defaultProps = {
      open: true,
      onClose: vi.fn(),
    };
    const mergedProps = { ...defaultProps, ...props };

    return {
      ...render(
        <RepositoryTestWrapper
          override={{
            files: {
              getTags: async () => ({ tags: mockTags }),
              deleteTag: async () => undefined,
              createTag: async (data: { name: string; color: string }) => ({
                id: 'new-tag-id',
                name: data.name,
                color: data.color,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              }),
              updateTag: async (data: { id: string; name: string; color: string }) => ({
                id: data.id,
                name: data.name,
                color: data.color,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              }),
            },
          }}
        >
          <TagManagementDialog {...mergedProps} />
        </RepositoryTestWrapper>
      ),
      onClose: mergedProps.onClose,
    };
  };

  test('ダイアログが開いている時にタイトルが表示されること', () => {
    renderTagManagementDialog();

    expect(screen.getByText('タグ管理')).toBeInTheDocument();
  });

  test('ダイアログが閉じている時に何も表示されないこと', () => {
    renderTagManagementDialog({ open: false });

    expect(screen.queryByText('タグ管理')).not.toBeInTheDocument();
  });

  test('タグ一覧が表示されること', async () => {
    renderTagManagementDialog();

    await waitFor(() => {
      expect(screen.getByText('重要')).toBeInTheDocument();
      expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    });
  });

  test('検索フィールドに入力するとタグがフィルタリングされること', async () => {
    const user = userEvent.setup();
    renderTagManagementDialog();

    await waitFor(() => {
      expect(screen.getByText('重要')).toBeInTheDocument();
    });

    const searchField = screen.getByPlaceholderText('タグを検索...');
    await user.type(searchField, '重要');

    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.queryByText('ドキュメント')).not.toBeInTheDocument();
  });

  test('新規作成ボタンをクリックするとCreateTagDialogが開くこと', async () => {
    const user = userEvent.setup();
    renderTagManagementDialog();

    const createButton = screen.getByText('新規作成');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('タグを作成')).toBeInTheDocument();
    });
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderTagManagementDialog();

    const closeButton = screen.getByText('閉じる');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('削除ボタンをクリックすると確認ダイアログが表示されること', async () => {
    const user = userEvent.setup();
    renderTagManagementDialog();

    await waitFor(() => {
      expect(screen.getByText('重要')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('delete');
    await user.click(deleteButtons[0]);

    expect(screen.getByText('タグを削除しますか？')).toBeInTheDocument();
  });
});

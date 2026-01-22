import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { TagInfo } from '@/domain/models/files';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { EditTagDialog } from '../EditTagDialog';

describe('EditTagDialog', () => {
  const mockTag: TagInfo = {
    id: 'tag-1',
    name: 'テストタグ',
    color: 'red',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const renderEditTagDialog = (
    props: {
      open?: boolean;
      tag?: TagInfo | null;
      onClose?: () => void;
    } = {}
  ) => {
    const defaultProps = {
      open: true,
      tag: mockTag,
      onClose: vi.fn(),
    };
    const mergedProps = { ...defaultProps, ...props };

    return {
      ...render(
        <RepositoryTestWrapper
          override={{
            files: {
              updateTag: async (data: { id: string; name: string; color: string }) => ({
                id: data.id,
                name: data.name,
                color: data.color,
              }),
            },
          }}
        >
          <EditTagDialog {...mergedProps} />
        </RepositoryTestWrapper>
      ),
      onClose: mergedProps.onClose,
    };
  };

  test('タグがnullの場合は何も表示されないこと', () => {
    const { container } = renderEditTagDialog({ tag: null });

    expect(container).toBeEmptyDOMElement();
  });

  test('ダイアログが開いている時にタイトルが表示されること', () => {
    renderEditTagDialog();

    expect(screen.getByText('タグを編集')).toBeInTheDocument();
  });

  test('タグの初期値がフォームに表示されること', () => {
    renderEditTagDialog();

    const nameInput = screen.getByRole('textbox', { name: /タグ名/i });
    expect(nameInput).toHaveValue('テストタグ');
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderEditTagDialog();

    const closeButton = screen.getByRole('button', { name: /閉じる/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('タグ名を変更して送信するとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderEditTagDialog();

    const nameInput = screen.getByRole('textbox', { name: /タグ名/i });
    await user.clear(nameInput);
    await user.type(nameInput, '更新タグ');

    const submitButton = screen.getByRole('button', { name: /保存/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  test('キャンセルボタンをクリックするとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderEditTagDialog();

    const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { CreateTagDialog } from '../CreateTagDialog';

describe('CreateTagDialog', () => {
  const renderCreateTagDialog = (
    props: {
      open?: boolean;
      onClose?: () => void;
      onCreated?: (tag: { id: string; name: string; color: string }) => void;
    } = {}
  ) => {
    const defaultProps = {
      open: true,
      onClose: vi.fn(),
      onCreated: vi.fn(),
    };
    const mergedProps = { ...defaultProps, ...props };

    return {
      ...render(
        <RepositoryTestWrapper
          override={{
            files: {
              createTag: async (data: { name: string; color: string }) => ({
                tag: {
                  id: 'new-tag-id',
                  name: data.name,
                  color: data.color,
                },
              }),
            },
          }}
        >
          <CreateTagDialog {...mergedProps} />
        </RepositoryTestWrapper>
      ),
      onClose: mergedProps.onClose,
      onCreated: mergedProps.onCreated,
    };
  };

  test('ダイアログが開いている時にタイトルが表示されること', () => {
    renderCreateTagDialog({ open: true });

    expect(screen.getByText('タグを作成')).toBeInTheDocument();
  });

  test('ダイアログが閉じている時に何も表示されないこと', () => {
    renderCreateTagDialog({ open: false });

    expect(screen.queryByText('タグを作成')).not.toBeInTheDocument();
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderCreateTagDialog();

    const closeButton = screen.getByRole('button', { name: /閉じる/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('タグ名を入力して送信するとonCreatedとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose, onCreated } = renderCreateTagDialog();

    const nameInput = screen.getByRole('textbox', { name: /タグ名/i });
    await user.type(nameInput, 'テストタグ');

    const submitButton = screen.getByRole('button', { name: /作成/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-tag-id',
          name: 'テストタグ',
        })
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  test('タグ名が空の場合は送信ボタンが無効化されること', () => {
    renderCreateTagDialog();

    const submitButton = screen.getByRole('button', { name: /作成/i });
    expect(submitButton).toBeDisabled();
  });

  test('キャンセルボタンをクリックするとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderCreateTagDialog();

    const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

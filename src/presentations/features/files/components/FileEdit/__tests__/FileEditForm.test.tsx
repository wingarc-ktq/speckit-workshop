import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { TagInfo } from '@/domain/models/files';

import { FileEditForm } from '../FileEditForm';

describe('FileEditForm', () => {
  const mockTags: TagInfo[] = [
    { id: 'tag-1', name: '重要', color: 'red', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'tag-2', name: 'ドキュメント', color: 'blue', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ];

  const defaultProps = {
    resetKey: 'file-1',
    initialName: 'テストファイル.pdf',
    initialDescription: 'テストの説明',
    initialTags: [] as TagInfo[],
    tagOptions: mockTags,
    onOpenCreateTag: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  test('ファイル名の初期値が表示されること', () => {
    render(<FileEditForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/ファイル名/i);
    expect(nameInput).toHaveValue('テストファイル.pdf');
  });

  test('説明の初期値が表示されること', () => {
    render(<FileEditForm {...defaultProps} />);

    const descriptionInput = screen.getByLabelText(/説明/i);
    expect(descriptionInput).toHaveValue('テストの説明');
  });

  test('ファイル名を変更して送信できること', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FileEditForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/ファイル名/i);
    await user.clear(nameInput);
    await user.type(nameInput, '新しいファイル名.pdf');

    const submitButton = screen.getByRole('button', { name: /保存/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '新しいファイル名.pdf',
      })
    );
  });

  test('ファイル名が空の場合はエラーが表示されること', async () => {
    const user = userEvent.setup();
    render(<FileEditForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/ファイル名/i);
    // ファイル名を空白のみに変更（isDirtyがtrueになる）
    await user.clear(nameInput);
    await user.type(nameInput, '   ');

    const submitButton = screen.getByRole('button', { name: /保存/i });
    await user.click(submitButton);

    expect(await screen.findByText('ファイル名は必須です')).toBeInTheDocument();
  });

  test('変更がない場合は保存ボタンが無効化されること', () => {
    render(<FileEditForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /保存/i });
    expect(submitButton).toBeDisabled();
  });

  test('キャンセルボタンをクリックするとonCancelが呼ばれること', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<FileEditForm {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('タグを作成ボタンをクリックするとonOpenCreateTagが呼ばれること', async () => {
    const user = userEvent.setup();
    const onOpenCreateTag = vi.fn();
    render(<FileEditForm {...defaultProps} onOpenCreateTag={onOpenCreateTag} />);

    const createTagButton = screen.getByRole('button', { name: /タグを作成/i });
    await user.click(createTagButton);

    expect(onOpenCreateTag).toHaveBeenCalledTimes(1);
  });

  test('ローディング中は入力が無効化されること', () => {
    render(<FileEditForm {...defaultProps} isLoading={true} />);

    const nameInput = screen.getByLabelText(/ファイル名/i);
    expect(nameInput).toBeDisabled();
  });
});
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { FileUploadDialog } from '../FileUploadDialog';

// タグのモックデータ
const mockTags = [
  { id: 'tag-1', name: '重要', color: '#ff0000' },
  { id: 'tag-2', name: '学校行事', color: '#00ff00' },
];

describe('FileUploadDialog', () => {
  const renderFileUploadDialog = (
    props: {
      open?: boolean;
      onClose?: () => void;
    } = {}
  ) => {
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
              uploadFile: async () => ({
                file: {
                  id: 'uploaded-file-id',
                  name: 'test.pdf',
                  size: 1024,
                  mimeType: 'application/pdf',
                  uploadedAt: new Date().toISOString(),
                },
              }),
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
          <FileUploadDialog {...mergedProps} />
        </RepositoryTestWrapper>
      ),
      onClose: mergedProps.onClose,
    };
  };

  test('ダイアログが開いている時にタイトルが表示されること', () => {
    renderFileUploadDialog({ open: true });

    expect(screen.getByText('おたよりを追加')).toBeInTheDocument();
  });

  test('ダイアログが閉じている時に何も表示されないこと', () => {
    renderFileUploadDialog({ open: false });

    expect(screen.queryByText('おたよりを追加')).not.toBeInTheDocument();
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderFileUploadDialog();

    const closeButtons = screen.getAllByRole('button');
    const closeIconButton = closeButtons.find(
      (btn) => btn.querySelector('[data-testid="CloseIcon"]') !== null
    );

    if (closeIconButton) {
      await user.click(closeIconButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  test('キャンセルボタンをクリックするとonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const { onClose } = renderFileUploadDialog();

    const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('ファイルが選択されていない場合はアップロードボタンが無効化されること', () => {
    renderFileUploadDialog();

    const uploadButton = screen.getByRole('button', { name: /アップロード/i });
    expect(uploadButton).toBeDisabled();
  });

  test('ドロップゾーンが表示されること', () => {
    renderFileUploadDialog();

    expect(screen.getByText('ファイルをドラッグ&ドロップ')).toBeInTheDocument();
    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
  });

  test('説明入力フィールドが表示されること', () => {
    renderFileUploadDialog();

    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument();
  });

  test('タグセクションが表示されること', () => {
    renderFileUploadDialog();

    expect(screen.getByText('タグ')).toBeInTheDocument();
    expect(screen.getByText('＋ タグを作成')).toBeInTheDocument();
  });

  test('タグ作成ボタンをクリックするとタグ作成ダイアログが開くこと', async () => {
    const user = userEvent.setup();
    renderFileUploadDialog();

    const createTagButton = screen.getByText('＋ タグを作成');
    await user.click(createTagButton);

    await waitFor(() => {
      expect(screen.getByText('タグを作成')).toBeInTheDocument();
    });
  });

  test('対応フォーマットの説明が表示されること', () => {
    renderFileUploadDialog();

    expect(
      screen.getByText(/対応形式: PDF, JPG, PNG（最大10MB、最大20ファイル）/i)
    ).toBeInTheDocument();
  });

  test('説明フィールドに入力できること', async () => {
    const user = userEvent.setup();
    renderFileUploadDialog();

    const descriptionField = screen.getByLabelText(/説明/i);
    await user.type(descriptionField, 'テスト説明文');

    expect(descriptionField).toHaveValue('テスト説明文');
  });

  test('タグ選択のプレースホルダーが表示されること', () => {
    renderFileUploadDialog();

    expect(screen.getByPlaceholderText('タグを選択...')).toBeInTheDocument();
  });
});

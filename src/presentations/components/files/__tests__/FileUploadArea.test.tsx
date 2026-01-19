import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { FileUploadArea } from '../FileUploadArea';

describe('FileUploadArea', () => {
  const renderFileUploadArea = (props = {}) => {
    return render(
      <RepositoryTestWrapper>
        <FileUploadArea {...props} />
      </RepositoryTestWrapper>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('ドラッグ&ドロップゾーンが表示されること', () => {
    renderFileUploadArea();
    expect(screen.getByText(/ファイルをドラッグ&ドロップ/)).toBeInTheDocument();
  });

  test('ドラッグオーバー時にドラッグ状態がアクティブになること', async () => {
    const { container } = renderFileUploadArea();
    const user = userEvent.setup();
    
    const dropzone = container.querySelector('[data-testid="dropzone"]');
    expect(dropzone).not.toHaveClass('drag-active');

    if (dropzone) {
      await user.hover(dropzone);
      // ドラッグオーバー状態の確認
      expect(dropzone).toHaveClass('drag-active');
    }
  });

  test('ファイル選択後にプレビューが表示されること', async () => {
    renderFileUploadArea();
    const user = userEvent.setup();

    const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  test('複数ファイル選択が対応していること', async () => {
    renderFileUploadArea();
    const user = userEvent.setup();

    const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
    const files = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      new File(['content3'], 'file3.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    ];

    await user.upload(fileInput, files);

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.docx')).toBeInTheDocument();
      expect(screen.getByText('file3.xlsx')).toBeInTheDocument();
    });
  });

  test('20ファイルを超える選択は拒否されること', async () => {
    renderFileUploadArea();
    const user = userEvent.setup();

    const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
    const files = Array.from({ length: 21 }, (_, i) =>
      new File([`content${i}`], `file${i}.pdf`, { type: 'application/pdf' })
    );

    await user.upload(fileInput, files);

    await waitFor(() => {
      expect(screen.getByText(/最大20ファイルまで選択できます/)).toBeInTheDocument();
    });
  });

  test('タグセレクタが表示されること', () => {
    renderFileUploadArea();
    expect(screen.getByLabelText(/タグを選択/)).toBeInTheDocument();
  });

  test('アップロードボタンがファイル選択後に有効になること', async () => {
    renderFileUploadArea();
    const user = userEvent.setup();

    const uploadButton = screen.getByRole('button', { name: /アップロード/ });
    expect(uploadButton).toBeDisabled();

    const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(uploadButton).toBeEnabled();
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { FileUploadArea } from '../FileUploadArea';

describe('FileUploadAreaのファイル形式検証', () => {
  const renderFileUploadArea = () => {
    return render(
      <RepositoryTestWrapper>
        <FileUploadArea />
      </RepositoryTestWrapper>
    );
  };

  const supportedFormats = [
    { name: 'document.pdf', type: 'application/pdf' },
    { name: 'document.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'spreadsheet.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { name: 'image.jpg', type: 'image/jpeg' },
    { name: 'image.png', type: 'image/png' },
  ];

  const unsupportedFormats = [
    { name: 'document.txt', type: 'text/plain' },
    { name: 'archive.zip', type: 'application/zip' },
    { name: 'video.mp4', type: 'video/mp4' },
    { name: 'document.doc', type: 'application/msword' },
  ];

  test.concurrent.each(supportedFormats)(
    '$nameは受け入れられること',
    async ({ name, type }) => {
      renderFileUploadArea();
      const user = userEvent.setup();

      const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
      const file = new File(['content'], name, { type });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });

      // エラーメッセージが表示されないことを確認
      expect(screen.queryByText(/サポートされていないファイル形式です/)).not.toBeInTheDocument();
    }
  );

  test.concurrent.each(unsupportedFormats)(
    '$nameは拒否されること',
    async ({ name, type }) => {
      renderFileUploadArea();
      const user = userEvent.setup();

      const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
      const file = new File(['content'], name, { type });

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/サポートされていないファイル形式です/)).toBeInTheDocument();
      });
    }
  );

  test('10MBを超えるファイルは拒否されること', async () => {
    renderFileUploadArea();
    const user = userEvent.setup();

    const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    const file = new File([largeBuffer], 'large.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/ファイルサイズは10MB以下にしてください/)).toBeInTheDocument();
    });
  });

  test('10MB以下のファイルは受け入れられること', async () => {
    renderFileUploadArea();
    const user = userEvent.setup();

    const fileInput = screen.getByLabelText(/ファイルを選択/) as HTMLInputElement;
    const buffer = Buffer.alloc(5 * 1024 * 1024); // 5MB
    const file = new File([buffer], 'medium.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('medium.pdf')).toBeInTheDocument();
    });

    expect(screen.queryByText(/ファイルサイズは10MB以下にしてください/)).not.toBeInTheDocument();
  });
});

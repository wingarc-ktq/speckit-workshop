import { render, screen } from '@testing-library/react';

import type { FileInfo } from '@/adapters/generated/files';

import { FilePreview } from '../FilePreview';

describe('FilePreview', () => {
  const createMockFile = (overrides: Partial<FileInfo> = {}): FileInfo => ({
    id: 'file-1',
    name: 'test-file',
    size: 1024,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    tagIds: [],
    downloadUrl: 'https://example.com/download/file-1',
    ...overrides,
  });

  test('画像ファイルの場合にimgタグが表示されること', () => {
    const file = createMockFile({
      mimeType: 'image/png',
      name: 'test-image.png',
      downloadUrl: 'https://example.com/download/image.png',
    });
    render(<FilePreview file={file} />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/download/image.png');
    expect(img).toHaveAttribute('alt', 'test-image.png');
  });

  test('jpeg画像の場合にimgタグが表示されること', () => {
    const file = createMockFile({
      mimeType: 'image/jpeg',
      name: 'test-image.jpg',
    });
    render(<FilePreview file={file} />);

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('gif画像の場合にimgタグが表示されること', () => {
    const file = createMockFile({
      mimeType: 'image/gif',
      name: 'test-image.gif',
    });
    render(<FilePreview file={file} />);

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('プレビュー不可のファイルの場合にメッセージが表示されること', () => {
    const file = createMockFile({
      mimeType: 'application/octet-stream',
      name: 'test-file.bin',
    });
    render(<FilePreview file={file} />);

    expect(screen.getByText('このファイル形式はプレビューできません')).toBeInTheDocument();
    expect(screen.getByText('ダウンロードボタンからファイルをダウンロードしてください')).toBeInTheDocument();
    expect(screen.getByTestId('InsertDriveFileIcon')).toBeInTheDocument();
  });

  test('テキストファイルの場合にプレビュー不可メッセージが表示されること', () => {
    const file = createMockFile({
      mimeType: 'text/plain',
      name: 'readme.txt',
    });
    render(<FilePreview file={file} />);

    expect(screen.getByText('このファイル形式はプレビューできません')).toBeInTheDocument();
  });

  test('Excelファイルの場合にプレビュー不可メッセージが表示されること', () => {
    const file = createMockFile({
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      name: 'data.xlsx',
    });
    render(<FilePreview file={file} />);

    expect(screen.getByText('このファイル形式はプレビューできません')).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { repositoryComposition } from '@/adapters/repositories';
import type { Document } from '@/domain/models/document';
import { FileDetailsModal } from '../FileDetailsModal';

vi.mock('../PDFViewer', () => ({
  PDFViewer: ({ fileUrl }: { fileUrl: string }) => (
    <div data-testid="pdf-viewer-mock">pdf:{fileUrl}</div>
  ),
}));

vi.mock('../ImageViewer', () => ({
  ImageViewer: ({ src }: { src: string }) => (
    <div data-testid="image-viewer-mock">img:{src}</div>
  ),
}));

describe('FileDetailsModal', () => {
  const baseDocument: Document = {
    id: 'doc-001',
    fileName: '請求書_20250110.pdf',
    fileSize: 2048576,
    fileFormat: 'pdf',
    uploadedAt: '2025-01-10T08:30:00Z',
    updatedAt: '2025-01-10T08:30:00Z',
    uploadedByUserId: 'user-123',
    tags: [
      {
        id: 'tag-001',
        name: '請求書',
        color: 'error',
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-10T08:00:00Z',
        createdByUserId: 'user-123',
      },
    ],
    isDeleted: false,
    deletedAt: null,
  };

  const setup = async (override?: Partial<Document>) => {
    vi.spyOn(repositoryComposition.document, 'getDocumentById').mockResolvedValue({
      ...baseDocument,
      ...override,
    });
    vi.spyOn(repositoryComposition.document, 'getDownloadUrl').mockReturnValue(
      'http://example.com/download'
    );

    render(
      <RepositoryTestWrapper>
        <FileDetailsModal open documentId="doc-001" onClose={vi.fn()} />
      </RepositoryTestWrapper>
    );

    await waitFor(() => {
      expect(repositoryComposition.document.getDocumentById).toHaveBeenCalled();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('文書のメタデータとタグを表示する', async () => {
    await setup();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: '請求書_20250110.pdf' })
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/2.0 MB/)).toBeInTheDocument();
    expect(screen.getByText('請求書')).toBeInTheDocument();
  });

  test('PDF形式の場合はPDFプレビューを表示する', async () => {
    await setup();

    await waitFor(() => {
      expect(screen.getByTestId('pdf-viewer-mock')).toBeInTheDocument();
    });
  });

  test('ダウンロードボタンを押下するとAPIを呼び出す', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('file', { status: 200 }));
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    const createObjectURLMock = vi.fn(() => 'blob:mock');
    const revokeMock = vi.fn();
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    (URL as any).createObjectURL = createObjectURLMock;
    (URL as any).revokeObjectURL = revokeMock;

    await setup();

    const user = userEvent.setup();
    await user.click(screen.getByTestId('download-button'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://example.com/download');
    });

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeMock).toHaveBeenCalled();

    clickMock.mockRestore();
    (URL as any).createObjectURL = originalCreate;
    (URL as any).revokeObjectURL = originalRevoke;
  });

  test('未対応形式の場合はプレビュー未対応メッセージを表示する', async () => {
    await setup({ fileFormat: 'docx', fileName: '契約書.docx' });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: '契約書.docx' })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('このファイル形式のプレビューは未対応です。')
    ).toBeInTheDocument();
  });
});

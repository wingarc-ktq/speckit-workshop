import { render, screen, waitFor } from '@testing-library/react';

import type { FileInfo } from '@/adapters/generated/files';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';

import { FileMetadata } from '../FileMetadata';

describe('FileMetadata', () => {
  const mockFile: FileInfo = {
    id: 'file-1',
    name: 'テストファイル.pdf',
    size: 1024000,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    tagIds: ['tag-1'],
    downloadUrl: 'https://example.com/download/file-1',
    description: 'これはテストファイルの説明です',
  };

  const renderFileMetadata = (file: FileInfo) => {
    return render(
      <RepositoryTestWrapper
        override={{
          files: {
            getTags: async () => ({
              tags: [
                { id: 'tag-1', name: '重要', color: 'red' },
                { id: 'tag-2', name: 'ドキュメント', color: 'blue' },
              ],
            }),
          },
        }}
      >
        <FileMetadata file={file} />
      </RepositoryTestWrapper>
    );
  };

  test('ファイル名が表示されること', () => {
    renderFileMetadata(mockFile);

    expect(screen.getByText('ファイル名')).toBeInTheDocument();
    expect(screen.getByText('テストファイル.pdf')).toBeInTheDocument();
  });

  test('ファイルサイズが表示されること', () => {
    renderFileMetadata(mockFile);

    expect(screen.getByText('サイズ')).toBeInTheDocument();
    expect(screen.getByText('1000 KB')).toBeInTheDocument();
  });

  test('MIMEタイプが表示されること', () => {
    renderFileMetadata(mockFile);

    expect(screen.getByText('ファイル形式')).toBeInTheDocument();
    expect(screen.getByText('application/pdf')).toBeInTheDocument();
  });

  test('アップロード日時が表示されること', () => {
    renderFileMetadata(mockFile);

    expect(screen.getByText('アップロード日時')).toBeInTheDocument();
  });

  test('説明が表示されること', () => {
    renderFileMetadata(mockFile);

    expect(screen.getByText('説明')).toBeInTheDocument();
    expect(screen.getByText('これはテストファイルの説明です')).toBeInTheDocument();
  });

  test('説明がない場合は説明セクションが表示されないこと', () => {
    const fileWithoutDescription = { ...mockFile, description: undefined };
    renderFileMetadata(fileWithoutDescription);

    expect(screen.queryByText('説明')).not.toBeInTheDocument();
  });

  test('タグが表示されること', async () => {
    renderFileMetadata(mockFile);

    await waitFor(() => {
      expect(screen.getByText('タグ')).toBeInTheDocument();
      expect(screen.getByText('重要')).toBeInTheDocument();
    });
  });

  test('タグがない場合はタグセクションが表示されないこと', () => {
    const fileWithoutTags = { ...mockFile, tagIds: [] };
    renderFileMetadata(fileWithoutTags);

    expect(screen.queryByText('タグ')).not.toBeInTheDocument();
  });
});

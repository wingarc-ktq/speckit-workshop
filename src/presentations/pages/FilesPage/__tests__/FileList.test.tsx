import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestQueryClient } from '@/__fixtures__/testUtils';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { FileInfo } from '@/adapters/generated/files';
import type { TagInfo } from '@/domain/models/files';

import { FilesPage } from '../FilesPage';

type FilesRepositoryOverrides = {
  getFiles?: () => Promise<{ files: FileInfo[]; total: number; page: number; limit: number }>;
};

const mockFiles: FileInfo[] = [
  {
    id: 'file-1',
    name: 'テストファイル1.pdf',
    size: 1024000,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    tagIds: ['tag-1'],
    downloadUrl: 'https://example.com/download/file-1',
  },
  {
    id: 'file-2',
    name: 'テストファイル2.docx',
    size: 2048000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2024-01-16T10:30:00Z',
    tagIds: [],
    downloadUrl: 'https://example.com/download/file-2',
  },
];

const mockTags: TagInfo[] = [
  {
    id: 'tag-1',
    name: '重要',
    color: 'red',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const renderFilesPage = (overrides: FilesRepositoryOverrides = {}) => {
  const queryClient = createTestQueryClient();

  const repositories = {
    files: {
      getFiles: overrides.getFiles ?? (async () => ({ files: mockFiles, total: 2, page: 1, limit: 10 })),
      getTags: async () => ({ tags: mockTags }),
      getTrash: async () => ({ files: [] }),
      uploadFile: async () => ({ file: mockFiles[0] }),
      getFile: async () => ({ file: mockFiles[0] }),
      deleteFile: async () => undefined,
      restoreFile: async () => undefined,
      permanentlyDeleteFile: async () => undefined,
      createTag: async () => ({ tag: mockTags[0] }),
      updateTag: async () => ({ tag: mockTags[0] }),
      deleteTag: async () => undefined,
      updateFile: async () => ({ file: mockFiles[0] }),
    },
  };

  return render(
    <RepositoryTestWrapper override={repositories} queryClient={queryClient}>
      <FilesPage />
    </RepositoryTestWrapper>
  );
};

describe('FileList', () => {
  test('テーブルビュー/グリッドビューを切り替えられること', async () => {
    const user = userEvent.setup();
    renderFilesPage();

    await screen.findByText('テストファイル1.pdf');
    expect(screen.getByRole('table')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'グリッド表示' }));

    await waitFor(() => {
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  test('ローディング中はスピナーが表示されること', async () => {
    let resolveGetFiles: (value: { files: FileInfo[]; total: number; page: number; limit: number }) => void;
    const getFilesPromise = new Promise<{ files: FileInfo[]; total: number; page: number; limit: number }>((resolve) => {
      resolveGetFiles = resolve;
    });

    renderFilesPage({
      getFiles: () => getFilesPromise,
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    resolveGetFiles!({ files: mockFiles, total: 2, page: 1, limit: 10 });

    await screen.findByText('テストファイル1.pdf');
  });

  test('空の状態が表示されること', async () => {
    renderFilesPage({
      getFiles: async () => ({ files: [], total: 0, page: 1, limit: 10 }),
    });

    await screen.findByText('ファイルが見つかりません');
  });

  test('エラー状態が表示されること', async () => {
    renderFilesPage({
      getFiles: async () => {
        throw new Error('Network Error');
      },
    });

    await screen.findByText('ファイル一覧の取得に失敗しました。');
  });
});

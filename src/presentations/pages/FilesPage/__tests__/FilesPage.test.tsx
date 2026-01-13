import { render, screen, waitFor } from '@testing-library/react';

import { mockFileListResponse } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { FilesPage } from '../FilesPage';

describe('FilesPage', () => {
  const getFiles = vi.fn();
  const getTags = vi.fn();

  const renderFilePage = async () => {
    const r = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          files: {
            getFiles: getFiles,
          },
          tags: {
            getTags: getTags,
          },
        }}
      >
        <FilesPage />
      </RepositoryTestWrapper>
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    getFiles.mockResolvedValue(mockFileListResponse);
    getTags.mockResolvedValue(mockTags);
  });

  describe('基本的な表示', () => {
    test('FilesPageが表示されること', async () => {
      await renderFilePage();

      expect(screen.getByTestId('filesPage')).toBeInTheDocument();
    });

    test('RecentFilesSectionが表示されること', async () => {
      await renderFilePage();

      expect(screen.getByTestId('recentFilesSection')).toBeInTheDocument();
    });

    test('UploadSectionが表示されること', async () => {
      await renderFilePage();

      expect(screen.getByTestId('uploadSection')).toBeInTheDocument();
    });

    test('MyFilesSectionが表示されること', async () => {
      await renderFilePage();

      expect(screen.getByTestId('myFilesSection')).toBeInTheDocument();
    });
  });
});

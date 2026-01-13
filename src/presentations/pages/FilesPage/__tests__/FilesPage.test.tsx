import { render, screen } from '@testing-library/react';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { FilesPage } from '../FilesPage';

describe('FilesPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const renderFilePage = () => {
    return render(
      <RepositoryTestWrapper>
        <FilesPage />
      </RepositoryTestWrapper>
    );
  };

  describe('基本的な表示', () => {
    test('FilesPageが表示されること', () => {
      renderFilePage();

      expect(screen.getByTestId('filesPage')).toBeInTheDocument();
    });

    test('UploadSectionが表示されること', () => {
      renderFilePage();

      expect(screen.getByTestId('uploadSection')).toBeInTheDocument();
    });

    test('UploadSectionのタイトルが表示されること', () => {
      renderFilePage();

      expect(screen.getByText('ファイルをアップロード')).toBeInTheDocument();
    });
  });
});

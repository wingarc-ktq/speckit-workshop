import { render, screen, waitFor } from '@testing-library/react';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import {
  createFile,
  drop,
} from '../components/FileUploadZone/__tests__/testHelpers';
import { UploadSection } from '../UploadSection';

describe('UploadSection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const uploadFile = vi.fn();

  const renderComponent = () => {
    return render(
      <RepositoryTestWrapper
        override={{
          files: {
            uploadFile: uploadFile,
          },
        }}
      >
        <UploadSection />
      </RepositoryTestWrapper>
    );
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.uploadSection.title', () => {
      test('locale:ja "ファイルをアップロード" が表示される', () => {
        renderComponent();

        expect(screen.getByText('ファイルをアップロード')).toBeInTheDocument();
      });
    });
  });

  describe('基本的な表示', () => {
    test('タイトルが表示されること', () => {
      renderComponent();

      expect(screen.getByText('ファイルをアップロード')).toBeInTheDocument();
    });

    test('FileUploadZoneが表示されること', () => {
      renderComponent();

      expect(screen.getByTestId('dragAndDropArea')).toBeInTheDocument();
    });

    test('初期状態ではエラーメッセージが表示されないこと', () => {
      renderComponent();

      const alerts = screen.queryAllByRole('alert');
      expect(alerts).toHaveLength(0);
    });

    test('初期状態ではFileUploadListが表示されないこと', () => {
      renderComponent();

      // FileUploadListは空配列の場合nullを返すため、表示されない
      const uploadList = screen.queryByTestId('fileUploadList');
      expect(uploadList).not.toBeInTheDocument();
    });
  });

  describe('子コンポーネントの表示', () => {
    test('FileUploadZoneコンポーネントが表示されること', () => {
      renderComponent();

      expect(screen.getByTestId('dragAndDropArea')).toBeInTheDocument();
    });

    test('ファイル選択後にFileUploadListが表示されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      await waitFor(() => {
        expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
      });
    });
  });
});

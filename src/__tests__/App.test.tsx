import { render, waitFor } from '@testing-library/react';

import { i18n } from '@/i18n/config';

import App from '../App';

describe('App', () => {
  const output = async () => {
    const result = render(<App />);
    return result;
  };

  describe('document.titleの確認', () => {
    describe('言語によってタイトルが変更される', () => {
      test('日本語のタイトルが表示される', async () => {
        i18n.changeLanguage('ja');
        await output();
        await waitFor(() => {
          expect(document.title).toBe('UIプロトタイプ');
        });
      });
      test('英語のタイトルが表示される', async () => {
        i18n.changeLanguage('en');
        await output();
        await waitFor(() => {
          expect(document.title).toBe('ui-prototype');
        });
      });
    });
  });
});

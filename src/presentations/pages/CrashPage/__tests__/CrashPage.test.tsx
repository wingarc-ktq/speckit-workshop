import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { i18n } from '@/i18n/config';

import { CrashPage } from '../CrashPage';

import type { RenderResult } from '@testing-library/react';

describe('CrashPage', () => {
  const resetErrorBoundary = vi.fn();
  const errorMessage = 'error';
  const testError = new Error(errorMessage);

  const output = () =>
    render(
      <MemoryRouter>
        <CrashPage error={testError} resetErrorBoundary={resetErrorBoundary} />
      </MemoryRouter>
    );

  let r: RenderResult;

  beforeEach(async () => await i18n.changeLanguage('ja'));

  describe('多言語リソース', () => {
    describe('i18n: crashPage.title', () => {
      const text =
        'ページを表示できませんでした。ページを更新してもう一度お試しください。';
      test(`locale:ja "${text}"が表示される`, () => {
        r = output();
        expect(r.getByText(text)).toBeInTheDocument();
      });
    });

    describe('i18n: actions.reloadPage', () => {
      const text = 'ページを更新する';
      test(`locale:ja "${text}"が表示される`, () => {
        r = output();
        expect(r.getByText(text)).toBeInTheDocument();
      });
    });
  });

  describe('エラーメッセージの表示', () => {
    test('error.messageが表示される', () => {
      r = output();
      expect(r.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('ボタンの動作チェック', () => {
    test('ボタンをクリックするとresetErrorBoundaryが呼ばれる', async () => {
      const user = userEvent.setup();
      r = output();
      await user.click(r.getByTestId('reloadButton'));
      expect(resetErrorBoundary).toHaveBeenCalledOnce();
    });
  });
});

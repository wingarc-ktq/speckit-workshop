import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ApplicationException } from '@/domain/errors';
import { NetworkException } from '@/domain/errors';
import { i18n } from '@/i18n/config';

import { AppErrorDialog } from '../AppErrorDialog';

describe('AppErrorDialog', () => {
  const renderAppErrorDialog = (
    error?: ApplicationException | null,
    title?: string,
    children?: React.ReactNode
  ) => {
    const onClose = vi.fn();

    const result = render(
      <AppErrorDialog error={error} onClose={onClose} title={title}>
        {children}
      </AppErrorDialog>
    );

    return { ...result, onClose };
  };
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  test('エラーがnullの場合は何も表示されないこと', () => {
    const r = renderAppErrorDialog(null);
    expect(r.queryByTestId('appErrorDialog')).not.toBeInTheDocument();
  });

  test('カスタムタイトルが設定されている場合にそのタイトルが表示されること', () => {
    const error = new NetworkException('Network error');
    const customTitle = 'カスタムエラータイトル';

    const r = renderAppErrorDialog(error, customTitle);

    expect(r.getByText(customTitle)).toBeInTheDocument();
  });

  test('childrenが設定されている場合にそのコンテンツが表示されること', () => {
    const error = new NetworkException('Network error');
    const customContent = 'カスタムエラーメッセージ';

    const r = renderAppErrorDialog(error, undefined, customContent);

    expect(r.getByText(customContent)).toBeInTheDocument();
  });

  test('メッセージに改行コードがある場合は、<br />に置き換わること', () => {
    const customContent = 'Network error\nPlease try again later.';
    const error = new NetworkException('Network error');

    const r = renderAppErrorDialog(error, undefined, customContent);

    expect(r.getByTestId('errorMessage')).toContainHTML('<br />');
  });

  test('メッセージが文字列以外でも表示されること', () => {
    const customContent = (
      <>
        Network error
        <br />
        Please try again later.
      </>
    );
    const error = new NetworkException('Network error');

    const r = renderAppErrorDialog(error, undefined, customContent);

    expect(r.getByTestId('errorMessage')).toContainHTML('<br />');
  });

  test('OKボタンをクリックした時にonCloseが呼ばれること', async () => {
    const user = userEvent.setup();
    const error = new NetworkException('Network error');

    const { getByTestId, onClose } = renderAppErrorDialog(error);

    const okButton = getByTestId('okButton');
    await user.click(okButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { i18n } from '@/i18n/config';

import { HomePage } from '../HomePage';

const renderHomePage = () => {
  return render(<HomePage />);
};

describe('HomePage', () => {
  beforeEach(() => {
    i18n.changeLanguage('ja');
  });

  test('メインタイトルが表示される', () => {
    const r = renderHomePage();

    const heading = r.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('ダッシュボード');
  });

  test('ウェルカムメッセージが表示される', () => {
    const r = renderHomePage();

    const welcomeMessage = r.getByText(
      'Dashboardへようこそ。こちらがメインのダッシュボードページです。'
    );
    expect(welcomeMessage).toBeInTheDocument();
  });

  test('システム概要セクションが表示される', () => {
    const r = renderHomePage();

    const overviewTitle = r.getByText('システム概要');
    expect(overviewTitle).toBeInTheDocument();

    const overviewDescription = r.getByText(
      'モダンなウェブアプリケーションの構成を作ってみているところです。'
    );
    expect(overviewDescription).toBeInTheDocument();
  });
});

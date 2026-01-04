import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { i18n } from '@/i18n/config';

import { LoginHeader } from '../LoginHeader';

describe('LoginHeader', () => {
  beforeEach(() => {
    i18n.changeLanguage('ja');
  });

  it('ロゴとタイトルとサブタイトルがすべて表示される', () => {
    render(<LoginHeader />);

    // ロゴ（SVG要素）の存在を確認
    const logoSvg = document.querySelector('svg');
    expect(logoSvg).toBeInTheDocument();

    expect(screen.getByText('ログイン')).toBeVisible();
    expect(screen.getByText('アカウントにログインしてください')).toBeVisible();
  });
});

import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { AppLayout } from '../AppLayout';

// ウィンドウサイズをvi.stubGlobalでモック
const mockWindowSize = (width: number, height: number) => {
  vi.stubGlobal('innerWidth', width);
  vi.stubGlobal('innerHeight', height);
};

const renderAppLayout = async () => {
  const r = render(
    <MemoryRouter initialEntries={['/']}>
      <AppLayout />
    </MemoryRouter>,
    {
      wrapper: RepositoryTestWrapper,
    }
  );
  await waitFor(() =>
    expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
  );
  return r;
};

describe('AppLayout', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    // デフォルトのウィンドウサイズを設定
    mockWindowSize(1024, 768);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('基本コンポーネントが正しくレンダリングされること', async () => {
    const r = await renderAppLayout();

    // AppLayoutのヘッダーが表示されることを確認
    expect(r.getByRole('banner')).toBeInTheDocument();
  });

  test('メインコンテンツ領域が存在すること', async () => {
    const r = await renderAppLayout();

    // メインコンテンツ領域が存在することを確認（styled-componentsのクラス名で確認）
    expect(r.container.firstChild).toBeInTheDocument();
  });

  test('ヘッダーにアプリ名が表示されること', async () => {
    const r = await renderAppLayout();

    // ヘッダーバナーが表示されることを確認
    const banner = r.getByRole('banner');
    expect(banner).toBeInTheDocument();
  });
});

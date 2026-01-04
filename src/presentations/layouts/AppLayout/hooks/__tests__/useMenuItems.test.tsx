import { type ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

import { en } from '@/i18n/locales/en';
import { ja } from '@/i18n/locales/ja';

import { useMenuItems } from '..';

// テスト用のi18nインスタンスを作成
const createTestI18n = (lng = 'ja') => {
  const testI18n = i18n.createInstance();
  testI18n.init({
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ja: {
        translation: ja,
      },
      en: {
        translation: en,
      },
    },
  });
  return testI18n;
};

// テスト用のWrapper関数
const createWrapper = (i18nInstance: typeof i18n) => {
  return ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
  );
};

describe('useMenuItems', () => {
  test.concurrent('日本語でメニューアイテムが正しく生成される', async () => {
    const testI18n = createTestI18n('ja');
    const wrapper = createWrapper(testI18n);

    const { result } = renderHook(() => useMenuItems(), { wrapper });

    const menuItems = result.current;

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].text).toBe('ダッシュボード');
    expect(menuItems[0].path).toBe('/');
    expect(menuItems[0].icon).toBeDefined();
  });

  test.concurrent('英語でメニューアイテムが正しく生成される', async () => {
    const testI18n = createTestI18n('en');
    const wrapper = createWrapper(testI18n);

    const { result } = renderHook(() => useMenuItems(), { wrapper });

    const menuItems = result.current;

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].text).toBe('Dashboard');
    expect(menuItems[0].path).toBe('/');
    expect(menuItems[0].icon).toBeDefined();
  });

  test.concurrent('メニューアイテムの構造が正しい', async () => {
    const testI18n = createTestI18n('ja');
    const wrapper = createWrapper(testI18n);

    const { result } = renderHook(() => useMenuItems(), { wrapper });

    const menuItems = result.current;

    expect(menuItems[0]).toHaveProperty('text');
    expect(menuItems[0]).toHaveProperty('path');
    expect(menuItems[0]).toHaveProperty('icon');
    expect(typeof menuItems[0].text).toBe('string');
    expect(typeof menuItems[0].path).toBe('string');
  });
});

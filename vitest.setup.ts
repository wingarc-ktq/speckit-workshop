import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { i18n } from './src/i18n/config';

// テスト環境では日本語を使用
i18n.changeLanguage('ja');

// react-pdf のモック（DOMMatrix がテスト環境で定義されていないため）
vi.mock('react-pdf', () => ({
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: () => null,
  pdfjs: {
    GlobalWorkerOptions: { workerSrc: '' },
    version: '0.0.0',
  },
}));

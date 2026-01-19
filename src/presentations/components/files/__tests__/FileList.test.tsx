import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { FileInfo } from '@/adapters/generated/files';

import { FileList } from '../FileList';

// テストデータのモック
const mockFiles: FileInfo[] = [
  {
    id: 'file-1',
    name: 'Document 1.pdf',
    size: 1024 * 100,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2025-01-15T10:00:00Z').toISOString(),
    downloadUrl: 'https://example.com/download/file-1',
    tagIds: ['tag-1'],
  },
  {
    id: 'file-2',
    name: 'Document 2.xlsx',
    size: 1024 * 200,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadedAt: new Date('2025-01-14T10:00:00Z').toISOString(),
    downloadUrl: 'https://example.com/download/file-2',
    tagIds: ['tag-2'],
  },
];

// i18nextのモック
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'fileList.headers.name': 'ファイル名',
        'fileList.headers.tags': 'タグ',
        'fileList.headers.uploadedAt': 'アップロード日時',
        'fileList.headers.size': 'サイズ',
        'fileList.headers.uploader': 'アップロード者',
        'fileList.empty.title': 'ファイルがありません',
        'fileList.empty.message': 'ファイルをアップロードしてください',
        'fileList.error.title': 'エラーが発生しました',
        'fileList.error.message': 'ファイル一覧を取得できませんでした',
        'fileList.search.noResults': '検索結果がありません',
        'fileList.search.noResultsMessage': '検索条件に合致するファイルがありません',
      };
      return translations[key] || key;
    },
  }),
}));

import { vi } from 'vitest';

describe('FileList', () => {
  it('ファイル一覧が正しくレンダリングされること', () => {
    render(<FileList files={mockFiles} />);

    // テーブルが表示される
    expect(screen.getByRole('table')).toBeInTheDocument();

    // ファイル名が表示される
    expect(screen.getByText('Document 1.pdf')).toBeInTheDocument();
    expect(screen.getByText('Document 2.xlsx')).toBeInTheDocument();
  });

  it('ファイルが0件の場合は空状態メッセージが表示されること', () => {
    render(<FileList files={[]} />);

    // 空状態メッセージが表示される
    expect(screen.getByText('ファイルがありません')).toBeInTheDocument();
  });

  it('検索中に0件の場合は検索結果がないメッセージが表示されること', () => {
    render(<FileList files={[]} isSearching={true} />);

    // 検索結果がないメッセージが表示される
    expect(screen.getByText('検索結果がありません')).toBeInTheDocument();
  });

  it('ローディング状態ではスケルトンが表示されること', () => {
    const { container } = render(
      <FileList files={[]} isLoading={true} />
    );

    // スケルトンローディングが表示される
    // スケルトンはMUIの内部実装なので、テーブルの存在で確認
    expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('エラー状態ではエラーメッセージが表示されること', () => {
    const errorMessage = 'ファイルを取得できませんでした';
    render(
      <FileList 
        files={[]} 
        isError={true} 
        error={new Error(errorMessage)}
      />
    );

    // エラーメッセージが表示される
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('検索キーワードが複数ファイルに渡されること', () => {
    render(
      <FileList 
        files={mockFiles} 
        searchQuery="Document"
      />
    );

    // 両方のファイルが表示される
    expect(screen.getByText('Document 1.pdf')).toBeInTheDocument();
    expect(screen.getByText('Document 2.xlsx')).toBeInTheDocument();
  });

  it('テーブルのヘッダーが正しく表示されること', () => {
    render(<FileList files={mockFiles} />);

    // ヘッダーが表示される
    expect(screen.getByText('ファイル名')).toBeInTheDocument();
    expect(screen.getByText('タグ')).toBeInTheDocument();
    expect(screen.getByText('アップロード日時')).toBeInTheDocument();
  });
});

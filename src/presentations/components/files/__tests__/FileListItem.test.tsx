import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { FileInfo } from '@/adapters/generated/files';

import { FileListItem } from '../FileListItem';

// テストデータのモック
const mockFile: FileInfo = {
  id: 'test-file-1',
  name: 'Sample Document.pdf',
  size: 1024 * 100, // 100KB
  mimeType: 'application/pdf',
  uploadedAt: new Date('2025-01-15T10:00:00Z').toISOString(),
  downloadUrl: 'https://example.com/download/test-file-1',
  tagIds: ['tag-1', 'tag-2'],
};

describe('FileListItem', () => {
  it('ファイル情報が正しく表示されること', () => {
    render(<FileListItem file={mockFile} />);

    // ファイル名が表示される
    expect(screen.getByText(/Sample Document/)).toBeInTheDocument();

    // ファイルサイズが表示される
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('タグが正しく表示されること', () => {
    render(<FileListItem file={mockFile} />);

    // タグが表示される
    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('契約書')).toBeInTheDocument();
  });

  it('アップロード日時が正しくフォーマットされて表示されること', () => {
    render(<FileListItem file={mockFile} />);

    // 日時がJP形式で表示される
    expect(screen.getByText(/2025\/01\/15/)).toBeInTheDocument();
  });

  it('検索キーワードがハイライトされること', () => {
    const { container } = render(
      <FileListItem file={mockFile} searchQuery="Sample" />
    );

    // ハイライト要素（黄色背景）が存在するか確認
    const highlightedElement = container.querySelector('span[style*="backgroundColor"]');
    expect(highlightedElement).toBeInTheDocument();
  });

  it('検索キーワードがない場合はハイライトされないこと', () => {
    const { container } = render(
      <FileListItem file={mockFile} searchQuery="" />
    );

    // ハイライト要素が存在しない
    const highlightedElement = container.querySelector('span[style*="fbbf24"]');
    expect(highlightedElement).not.toBeInTheDocument();
  });

  it('検索キーワードがマッチしない場合はハイライトされないこと', () => {
    const { container } = render(
      <FileListItem file={mockFile} searchQuery="NonexistentKeyword" />
    );

    // テキストは表示されるがハイライト要素は存在しない
    expect(screen.getByText(/Sample Document/)).toBeInTheDocument();
    const highlightedElement = container.querySelector('span[style*="fbbf24"]');
    expect(highlightedElement).not.toBeInTheDocument();
  });

  it('ファイルがタグを持たない場合は正しく表示されること', () => {
    const fileWithoutTags: FileInfo = {
      ...mockFile,
      tagIds: [],
    };

    render(<FileListItem file={fileWithoutTags} />);

    // ファイル名は表示される
    expect(screen.getByText(/Sample Document/)).toBeInTheDocument();

    // タグは表示されない
    expect(screen.queryByText('完了')).not.toBeInTheDocument();
  });

  it('大きなファイルサイズが正しくフォーマットされること', () => {
    const largeFile: FileInfo = {
      ...mockFile,
      size: 1024 * 1024 * 500, // 500MB
    };

    render(<FileListItem file={largeFile} />);

    // ファイルサイズがMB単位で表示される
    expect(screen.getByText(/500.*MB/)).toBeInTheDocument();
  });

  it('小さいファイルサイズが正しくフォーマットされること', () => {
    const smallFile: FileInfo = {
      ...mockFile,
      size: 512, // 512B
    };

    render(<FileListItem file={smallFile} />);

    // ファイルサイズがB単位で表示される
    expect(screen.getByText(/512.*B/)).toBeInTheDocument();
  });
});

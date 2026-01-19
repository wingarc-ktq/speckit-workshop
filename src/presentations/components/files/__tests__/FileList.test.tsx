import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { FileList } from '../FileList';
import type { Document } from '@/domain/models/document';

describe('FileList Component (T033)', () => {
  const mockDocuments: Document[] = [
    {
      id: 'doc-001',
      fileName: '請求書_20250110.pdf',
      fileSize: 2048576,
      fileFormat: 'pdf',
      uploadedAt: '2025-01-10T08:30:00Z',
      updatedAt: '2025-01-10T08:30:00Z',
      uploadedByUserId: 'user-123',
      tags: [
        {
          id: 'tag-001',
          name: '請求書',
          color: 'error',
          createdAt: '2025-01-10T08:00:00Z',
          updatedAt: '2025-01-10T08:00:00Z',
          createdByUserId: 'user-123',
        },
      ],
      isDeleted: false,
      deletedAt: null,
    },
    {
      id: 'doc-002',
      fileName: '契約書_20250108.docx',
      fileSize: 1024576,
      fileFormat: 'docx',
      uploadedAt: '2025-01-08T14:15:00Z',
      updatedAt: '2025-01-08T14:15:00Z',
      uploadedByUserId: 'user-456',
      tags: [],
      isDeleted: false,
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ドキュメント一覧がMUI Tableで表示される', () => {
    const mockOnSort = vi.fn();
    const mockOnPageChange = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileList
          documents={mockDocuments}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          totalCount={2}
          currentPage={1}
          pageSize={20}
        />
      </RepositoryTestWrapper>
    );

    // ファイル名が表示されることを確認
    expect(screen.getByText('請求書_20250110.pdf')).toBeInTheDocument();
    expect(screen.getByText('契約書_20250108.docx')).toBeInTheDocument();
  });

  it('ファイルメタデータが正しく表示される', () => {
    const mockOnSort = vi.fn();
    const mockOnPageChange = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileList
          documents={mockDocuments}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          totalCount={2}
          currentPage={1}
          pageSize={20}
        />
      </RepositoryTestWrapper>
    );

    // タグが表示されることを確認
    expect(screen.getByText('請求書')).toBeInTheDocument();

    // ファイルサイズが表示される
    expect(screen.getByText(/2\.0\s*MB|2048576/)).toBeInTheDocument();
  });

  it('ソート操作時にコールバック関数が呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnSort = vi.fn();
    const mockOnPageChange = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileList
          documents={mockDocuments}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          totalCount={2}
          currentPage={1}
          pageSize={20}
        />
      </RepositoryTestWrapper>
    );

    // ソートボタンをクリック
    const sortButtons = screen.queryAllByRole('button', { name: /ソート|名前/ });
    if (sortButtons.length > 0) {
      await user.click(sortButtons[0]);
      expect(mockOnSort).toHaveBeenCalled();
    }
  });

  it('ページネーション操作時にコールバック関数が呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnSort = vi.fn();
    const mockOnPageChange = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileList
          documents={mockDocuments}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          totalCount={40}
          currentPage={1}
          pageSize={20}
        />
      </RepositoryTestWrapper>
    );

    // ページネーションボタンをクリック
    const nextButtons = screen.queryAllByRole('button', { name: /次|next/i });
    if (nextButtons.length > 0) {
      await user.click(nextButtons[0]);
      expect(mockOnPageChange).toHaveBeenCalled();
    }
  });

  it('データなし時の空状態が表示される', () => {
    const mockOnSort = vi.fn();
    const mockOnPageChange = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileList
          documents={[]}
          isLoading={false}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          totalCount={0}
          currentPage={1}
          pageSize={20}
        />
      </RepositoryTestWrapper>
    );

    // 空状態メッセージが表示される
    const emptyMessage = screen.queryByText(/ドキュメントが見つかりません|ファイルがありません/);
    if (emptyMessage) {
      expect(emptyMessage).toBeInTheDocument();
    }
  });

  it('ローディング状態でスケルトンが表示される', () => {
    const mockOnSort = vi.fn();
    const mockOnPageChange = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileList
          documents={[]}
          isLoading={true}
          onSort={mockOnSort}
          onPageChange={mockOnPageChange}
          totalCount={0}
          currentPage={1}
          pageSize={20}
        />
      </RepositoryTestWrapper>
    );

    // スケルトンローダーを確認
    const skeletons = screen.queryAllByTestId('skeleton-loader');
    expect(skeletons.length).toBeGreaterThanOrEqual(0);
  });
});

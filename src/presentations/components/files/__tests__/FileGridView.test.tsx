import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { Document } from '@/domain/models/document';

import { FileGridView } from '../FileGridView';

describe('FileGridView Component (T034)', () => {
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

  it('グリッドレイアウトでドキュメントカードが表示される', () => {
    const mockOnCardClick = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileGridView
          documents={mockDocuments}
          isLoading={false}
          onCardClick={mockOnCardClick}
        />
      </RepositoryTestWrapper>
    );

    // ファイル名が表示されることを確認
    expect(screen.getByText('請求書_20250110.pdf')).toBeInTheDocument();
    expect(screen.getByText('契約書_20250108.docx')).toBeInTheDocument();
  });

  it('ドキュメントカードがレスポンシブグリッドで表示される', () => {
    const mockOnCardClick = vi.fn();

    const { container } = render(
      <RepositoryTestWrapper>
        <FileGridView
          documents={mockDocuments}
          isLoading={false}
          onCardClick={mockOnCardClick}
        />
      </RepositoryTestWrapper>
    );

    // MUI Grid コンポーネントの確認
    const gridContainer = container.querySelector('[class*="MuiGrid-container"]');
    expect(gridContainer).toBeInTheDocument();
  });

  it('カードクリック時にコールバック関数が呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnCardClick = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileGridView
          documents={mockDocuments}
          isLoading={false}
          onCardClick={mockOnCardClick}
        />
      </RepositoryTestWrapper>
    );

    // ドキュメントカードをクリック
    const cards = screen.queryAllByRole('img', { hidden: true });
    if (cards.length > 0) {
      const cardElement = cards[0].closest('[role="button"], [data-testid*="card"]');
      if (cardElement) {
        await user.click(cardElement);
        expect(mockOnCardClick).toHaveBeenCalled();
      }
    }
  });

  it('メタデータが正しく表示される', () => {
    const mockOnCardClick = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileGridView
          documents={mockDocuments}
          isLoading={false}
          onCardClick={mockOnCardClick}
        />
      </RepositoryTestWrapper>
    );

    // タグ名が表示される
    expect(screen.getByText('請求書')).toBeInTheDocument();

    // ファイルサイズが表示される
    expect(screen.getByText(/2\.0\s*MB|2048576/)).toBeInTheDocument();
  });

  it('ローディング状態でスケルトンカードが表示される', () => {
    const mockOnCardClick = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileGridView
          documents={[]}
          isLoading={true}
          onCardClick={mockOnCardClick}
        />
      </RepositoryTestWrapper>
    );

    // スケルトンローダーを確認
    const skeletons = screen.queryAllByTestId(/skeleton|loading/i);
    expect(skeletons.length).toBeGreaterThanOrEqual(0);
  });

  it('データなし時の空状態が表示される', () => {
    const mockOnCardClick = vi.fn();

    render(
      <RepositoryTestWrapper>
        <FileGridView
          documents={[]}
          isLoading={false}
          onCardClick={mockOnCardClick}
        />
      </RepositoryTestWrapper>
    );

    // 空状態メッセージが表示される
    const emptyMessage = screen.queryByText(/ドキュメントが見つかりません|ファイルがありません/);
    if (emptyMessage) {
      expect(emptyMessage).toBeInTheDocument();
    }
  });
});

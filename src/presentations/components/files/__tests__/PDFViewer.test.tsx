import { useEffect } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, beforeEach, test, vi } from 'vitest';

import { PDFViewer } from '../PDFViewer';

interface DocumentProps {
  children: React.ReactNode;
  onLoadSuccess?: (data: { numPages: number }) => void;
  onLoadError?: (error: Error) => void;
  file?: string;
}

interface PageProps {
  pageNumber: number;
}

vi.mock('react-pdf', () => {
  return {
    Document: ({ children, onLoadSuccess, onLoadError, file }: DocumentProps) => {
      useEffect(() => {
        if (file === 'error') {
          onLoadError?.(new Error('load error'));
        } else {
          onLoadSuccess?.({ numPages: 3 });
        }
      }, [file, onLoadError, onLoadSuccess]);

      if (file === 'error') {
        return <div data-testid="mock-document-error">error</div>;
      }

      return <div data-testid="mock-document">{children}</div>;
    },
    Page: ({ pageNumber }: PageProps) => (
      <div data-testid="mock-page">page-{pageNumber}</div>
    ),
    pdfjs: { GlobalWorkerOptions: { workerSrc: '' }, version: '4.0.0' },
  };
});

describe('PDFViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('PDFの1ページ目を表示し、ページ数を表示する', async () => {
    render(<PDFViewer fileUrl="http://example.com/sample.pdf" />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-page')).toHaveTextContent('page-1');
      expect(screen.getByTestId('page-indicator')).toHaveTextContent('1/3');
    });
  });

  test('次ページ・前ページのナビゲーションが動作する', async () => {
    render(<PDFViewer fileUrl="http://example.com/sample.pdf" />);

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText('次のページ')).toBeEnabled();
    });

    await user.click(screen.getByLabelText('次のページ'));
    expect(screen.getByTestId('mock-page')).toHaveTextContent('page-2');
    expect(screen.getByTestId('page-indicator')).toHaveTextContent('2/3');

    await user.click(screen.getByLabelText('前のページ'));
    expect(screen.getByTestId('mock-page')).toHaveTextContent('page-1');
  });

  test('読み込みエラー時にメッセージを表示する', async () => {
    render(<PDFViewer fileUrl="error" />);

    await waitFor(() => {
      expect(
        screen.getByText('PDFプレビューを読み込めませんでした')
      ).toBeInTheDocument();
    });
  });
});

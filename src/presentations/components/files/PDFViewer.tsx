import { useEffect, useRef, useState } from 'react';

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';

// Setup PDF worker using local file
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export interface PDFViewerProps {
  fileUrl: string;
  height?: number;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, height = 480 }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setPageNumber(1);
    setNumPages(null);
    setError(null);
  }, [fileUrl]);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    setError('PDFプレビューを読み込めませんでした');
  };

  const canGoPrev = pageNumber > 1;
  const canGoNext = numPages ? pageNumber < numPages : false;

  return (
    <Box data-testid="pdf-viewer">
      {error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : (
        <>
          <PdfDocument
            file={fileUrl}
            loading={<Skeleton data-testid="pdf-loading" variant="rectangular" height={height} />}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
          >
            <Page
              pageNumber={pageNumber}
              height={height}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </PdfDocument>
          {numPages && numPages > 1 ? (
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" mt={1}>
              <IconButton
                aria-label="前のページ"
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev}
                size="small"
              >
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" data-testid="page-indicator">
                {pageNumber}/{numPages}
              </Typography>
              <IconButton
                aria-label="次のページ"
                onClick={() => setPageNumber((prev) => (numPages ? Math.min(numPages, prev + 1) : prev))}
                disabled={!canGoNext}
                size="small"
              >
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : null}
        </>
      )}
    </Box>
  );
};

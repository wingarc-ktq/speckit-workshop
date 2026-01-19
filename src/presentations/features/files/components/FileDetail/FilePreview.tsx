import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import type { FileInfo } from '@/adapters/generated/files';

// PDF.jsのワーカーを設定
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FilePreviewProps {
  file: FileInfo;
}

/**
 * ファイルプレビューコンポーネント
 * PDF、画像ファイルの場合はプレビューを表示
 * それ以外はアイコンとメッセージを表示
 */
export const FilePreview = ({ file }: FilePreviewProps) => {
  const { mimeType, downloadUrl, name } = file;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // PDFファイルの場合
  if (mimeType === 'application/pdf') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 600,
          bgcolor: 'grey.100',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'auto',
          p: 2,
        }}
      >
        <Document
          file={downloadUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
              }}
            >
              <CircularProgress />
            </Box>
          }
          error={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                minHeight: 400,
              }}
            >
              <InsertDriveFileIcon sx={{ fontSize: 80, color: 'grey.400' }} />
              <Typography variant="body1" color="text.secondary">
                PDFの読み込みに失敗しました
              </Typography>
            </Box>
          }
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => (
              <Box key={`page_${index + 1}`} sx={{ mb: 2 }}>
                <Page
                  pageNumber={index + 1}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  width={Math.min(window.innerWidth * 0.5, 800)}
                />
              </Box>
            ))}
        </Document>
        {numPages && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            全{numPages}ページ
          </Typography>
        )}
      </Box>
    );
  }

  // 画像ファイルの場合
  if (mimeType.startsWith('image/')) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          p: 2,
        }}
      >
        <img
          src={downloadUrl}
          alt={name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    );
  }

  // プレビュー不可のファイル
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        gap: 2,
      }}
    >
      <InsertDriveFileIcon sx={{ fontSize: 80, color: 'grey.400' }} />
      <Typography variant="body1" color="text.secondary">
        このファイル形式はプレビューできません
      </Typography>
      <Typography variant="caption" color="text.secondary">
        ダウンロードボタンからファイルをダウンロードしてください
      </Typography>
    </Box>
  );
};

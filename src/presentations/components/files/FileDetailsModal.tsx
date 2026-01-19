import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useMemo } from 'react';

import { repositoryComposition } from '@/adapters/repositories';
import { useDownloadFile } from '@/presentations/hooks/mutations/useDownloadFile';
import { useFileDetails } from '@/presentations/hooks/queries/useFileDetails';

import { ImageViewer } from './ImageViewer';
import { PDFViewer } from './PDFViewer';

export interface FileDetailsModalProps {
  open: boolean;
  documentId?: string;
  onClose: () => void;
}

const formatFileSize = (bytes: number) => {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  open,
  documentId,
  onClose,
}) => {
  const { data: document, isLoading } = useFileDetails(documentId, {
    enabled: open,
  });

  const downloadMutation = useDownloadFile();

  // Mock PDF data (base64 encoded minimal PDF)
  const MOCK_PDF_BASE64 = `JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVu
ZG9ibjoyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj5lbmRvYmoK
MyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0Yx
IDQgMCBSPj4+Pi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNSAwIFI+PmVuZG9i
ago0IDAgb2JqPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj5l
bmRvYmoKNSAwIG9iajw8L0xlbmd0aCAzOD4+c3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihIZWxsbyBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNzggMDAwMDAgbiAKMDAwMDAwMDM4MiAwMDAwMCBuIAp0cmFpbGVyPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDY3CiUlRU9G`;

  const downloadUrl = useMemo(() => {
    if (!document) return undefined;
    
    // For PDF files, return data URI
    if (document.fileFormat === 'pdf') {
      return `data:application/pdf;base64,${MOCK_PDF_BASE64.replace(/\n/g, '')}`;
    }
    
    // For other files, use the API endpoint
    return repositoryComposition.document.getDownloadUrl(document.id);
  }, [document]);

  const handleDownload = async () => {
    if (!document) return;
    await downloadMutation.mutateAsync({
      id: document.id,
      fileName: document.fileName,
    });
  };

  const renderPreview = () => {
    if (!document || !downloadUrl) return null;

    if (document.fileFormat === 'pdf') {
      return <PDFViewer fileUrl={downloadUrl} />;
    }

    if (document.fileFormat === 'jpg' || document.fileFormat === 'png') {
      return <ImageViewer src={downloadUrl} alt={document.fileName} />;
    }

    return (
      <Typography variant="body2" color="text.secondary">
        このファイル形式のプレビューは未対応です。
      </Typography>
    );
  };

  const renderSkeleton = () => (
    <Stack spacing={2}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" height={240} />
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      data-testid="file-details-modal"
    >
      <DialogTitle>{document?.fileName ?? 'ファイル詳細'}</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          renderSkeleton()
        ) : document ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" fontWeight="bold">
                {document.fileName}
              </Typography>
              <Chip
                label={document.fileFormat.toUpperCase()}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                サイズ: {formatFileSize(document.fileSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                更新日: {formatDateTime(document.updatedAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                アップロード者: {document.uploadedByUserId}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {document.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  color={tag.color}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>

            <Divider />

            <Box data-testid="preview-area">{renderPreview()}</Box>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            文書が見つかりません。
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
        <Button
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          disabled={!document || downloadMutation.isPending}
          variant="contained"
          color="primary"
          data-testid="download-button"
        >
          ダウンロード
        </Button>
      </DialogActions>
    </Dialog>
  );
};

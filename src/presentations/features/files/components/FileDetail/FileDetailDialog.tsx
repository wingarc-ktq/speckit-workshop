import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import { downloadFile } from '@/domain/utils/fileDownload';
import { DeleteConfirmDialog } from '@/presentations/components/dialogs';
import { useDeleteFile } from '@/presentations/hooks/mutations/useDeleteFile';
import { useFileDetail } from '@/presentations/hooks/queries/useFileDetail';

import { FileEditDialog } from '../FileEdit/FileEditDialog';
import { FileMetadata } from './FileMetadata';
import { FilePreview } from './FilePreview';

interface FileDetailDialogProps {
  fileId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * ファイル詳細表示ダイアログ
 */
export const FileDetailDialog = ({
  fileId,
  open,
  onClose,
}: FileDetailDialogProps) => {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const deleteMutation = useDeleteFile();

  React.useEffect(() => {
    if (!open) {
      setEditOpen(false);
      setDeleteOpen(false);
    }
  }, [open]);

  // ファイル詳細情報を取得
  const { data: file, isLoading, error } = useFileDetail(fileId ?? undefined, open);

  // ダウンロードハンドラー
  const handleDownload = () => {
    if (file) {
      downloadFile(file.downloadUrl, file.name);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: fullScreen ? '100%' : '90vh' },
      }}
    >
      {/* ヘッダー */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 1 }}>
        <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file?.name ?? 'ファイル詳細'}
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setEditOpen(true)}
          disabled={!file}
          sx={{ flexShrink: 0 }}
        >
          編集
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
          disabled={!file}
          sx={{ flexShrink: 0 }}
        >
          削除
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!file}
          sx={{ flexShrink: 0 }}
        >
          ダウンロード
        </Button>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ flexShrink: 0 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* コンテンツ */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {isLoading && (
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
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              ファイルの読み込みに失敗しました
            </Alert>
          </Box>
        )}

        {file && (
          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* プレビューエリア */}
            <Box
              sx={{
                flex: { xs: 1, md: 2 },
                borderRight: { md: 1 },
                borderColor: { md: 'divider' },
                overflow: 'auto',
              }}
            >
              <FilePreview file={file} />
            </Box>

            {/* メタデータエリア */}
            <Box
              sx={{
                flex: { xs: 1, md: 1 },
                overflow: 'auto',
                bgcolor: 'background.paper',
              }}
            >
              <FileMetadata file={file} />
            </Box>
          </Box>
        )}
      </DialogContent>

      <FileEditDialog open={editOpen} file={file ?? null} onClose={() => setEditOpen(false)} />
      <DeleteConfirmDialog
        open={deleteOpen}
        title="ファイルを削除しますか？"
        description={file?.name}
        confirmLabel="削除"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!file) return;
          await deleteMutation.mutateAsync(file.id);
          setDeleteOpen(false);
          onClose();
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </Dialog>
  );
};

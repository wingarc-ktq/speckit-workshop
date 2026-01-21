import React, { useCallback, useEffect } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

import type { FileId } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { useDownloadFile } from '@/presentations/hooks/queries/files/useDownloadFile';
import { useFileById } from '@/presentations/hooks/queries/files/useFileById';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';

import { FileInfo } from './components/FileInfo';
import { FilePreview } from './components/FilePreview';
import * as S from './styled';

interface FileDetailDialogProps {
  fileId: FileId | null;
  open: boolean;
  onClose: () => void;
}

const FileDetailDialogContent: React.FC<{
  fileId: FileId;
  onClose: () => void;
}> = ({ fileId, onClose }) => {
  const { t } = useTranslation();
  const { mutateAsync: downloadFile } = useDownloadFile();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const { data: file } = useFileById(fileId);
  const { data: tags } = useTags();

  const fileTags = tags.filter((tag) => file.tagIds.includes(tag.id));

  // ファイルをダウンロードしてプレビュー用URLを作成
  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      try {
        const blob = await downloadFile(fileId);
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load preview:', error);
      }
    };

    loadPreview();

    // クリーンアップ: Object URLを解放
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, downloadFile]);

  const handleDownloadClick = useCallback(async () => {
    try {
      const blob = await downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [fileId, file.name, downloadFile]);

  return (
    <>
      <DialogTitle>
        <S.DialogTitleContainer>
          <S.Title>{t(tKeys.filesPage.fileDetailDialog.title)}</S.Title>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label={t(tKeys.filesPage.fileDetailDialog.close)}
          >
            <CloseIcon />
          </IconButton>
        </S.DialogTitleContainer>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <FilePreview
            mimeType={file.mimeType}
            downloadUrl={file.downloadUrl}
            fileName={file.name}
            previewUrl={previewUrl}
          />
          <FileInfo file={file} tags={fileTags} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t(tKeys.filesPage.fileDetailDialog.close)}
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadClick}
        >
          {t(tKeys.filesPage.fileDetailDialog.download)}
        </Button>
      </DialogActions>
    </>
  );
};

export const FileDetailDialog: React.FC<FileDetailDialogProps> = ({
  fileId,
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {fileId && <FileDetailDialogContent fileId={fileId} onClose={onClose} />}
    </Dialog>
  );
};

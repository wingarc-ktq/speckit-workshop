import { useCallback, useState } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';

import type { CreateDocumentRequest } from '@/domain/models/document';
import { validateFiles, type FileValidationError } from '@/domain/models/document/DocumentError';
import type { Tag } from '@/domain/models/tag';
import { TagSelector } from '@/presentations/components/tags/TagSelector';
import { useFileUpload } from '@/presentations/hooks/mutations/useFileUpload';

import { FileUploadError } from './FileUploadError';

export interface FileUploadAreaProps {
  onUploadSuccess?: () => void;
  onUploadError?: (error: Error) => void;
}

const DropzoneBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.mode === 'light'
    ? theme.palette.grey[50]
    : theme.palette.grey[900],
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'light'
      ? theme.palette.primary.light
      : theme.palette.primary.dark,
  },
  '&.drag-active': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const FilePreviewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

/**
 * ファイルアップロードエリアコンポーネント
 * react-dropzoneを使用したドラッグ&ドロップ対応ファイルアップロード
 */
export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const { mutate: uploadFile, isPending } = useFileUpload();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDragActive(false);

    // ファイル検証
    const errors = validateFiles(acceptedFiles);
    setValidationErrors(errors);

    if (errors.length === 0) {
      setSelectedFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearErrors = () => {
    setValidationErrors([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      for (const file of selectedFiles) {
        // アップロード進捗開始
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 0,
        }));

        // ファイルアップロード実行
        const request: CreateDocumentRequest = {
          file,
          tagIds: selectedTags.map((tag) => tag.id),
        };

        uploadFile(request, {
          onSuccess: () => {
            // 成功時は進捗を100に
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: 100,
            }));
          },
          onError: (error) => {
            onUploadError?.(error);
          },
        });
      }

      // アップロード成功時の処理
      setShowSuccessNotification(true);
      setSelectedFiles([]);
      setSelectedTags([]);
      setUploadProgress({});
      onUploadSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('アップロードに失敗しました');
      onUploadError?.(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Stack spacing={3}>
        {/* バリデーションエラー表示 */}
        {validationErrors.length > 0 && (
          <FileUploadError errors={validationErrors} onDismiss={handleClearErrors} />
        )}

        {/* ドラッグ&ドロップゾーン */}
        <DropzoneBox
          {...getRootProps()}
          className={dragActive ? 'drag-active' : ''}
          data-testid="dropzone"
        >
          <input {...getInputProps()} aria-label="ファイルを選択" />
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mb: 1,
            }}
          />
          <Typography variant="h6" gutterBottom>
            ファイルをドラッグ&ドロップ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            またはクリックして選択（最大20ファイル、各10MB以下）
          </Typography>
        </DropzoneBox>

        {/* ファイル選択後のプレビュー */}
        {selectedFiles.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">
              選択ファイル（{selectedFiles.length}個）
            </Typography>
            {selectedFiles.map((file, index) => (
              <FilePreviewCard key={`${file.name}-${index}`}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    '&:last-child': { pb: 1 },
                  }}
                >
                  <Box flex={1}>
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>

                    {/* アップロード進捗バー */}
                    {uploadProgress[file.name] !== undefined && (
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress[file.name]}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleRemoveFile(index)}
                    disabled={isPending}
                  >
                    削除
                  </Button>
                </CardContent>
              </FilePreviewCard>
            ))}
          </Stack>
        )}

        {/* タグセレクタ */}
        <TagSelector
          value={selectedTags}
          onChange={setSelectedTags}
          disabled={isPending}
        />

        {/* アップロードボタン */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isPending}
          startIcon={<CloudUploadIcon />}
        >
          {isPending ? 'アップロード中...' : 'アップロード'}
        </Button>
      </Stack>

      {/* 成功通知 */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={6000}
        onClose={() => setShowSuccessNotification(false)}
        message="ファイルをアップロードしました"
      />
    </Container>
  );
};

export default FileUploadArea;

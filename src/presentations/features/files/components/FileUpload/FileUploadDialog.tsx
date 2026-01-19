import React, { useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { TagInfo } from '@/domain/models/files';
import { useFileUpload } from '@/presentations/hooks/mutations/useFileUpload';
import { useTags } from '@/presentations/hooks/queries/useTags';

import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadProgress } from './FileUploadProgress';
import { CreateTagDialog } from '../TagManagement/CreateTagDialog';

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({ open, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagInfo[]>([]);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, 'uploading' | 'success' | 'error'>
  >({});

  const { data: tagsData } = useTags();
  const uploadMutation = useFileUpload();

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setValidationErrors([]);
  };

  const handleValidationError = (errors: string[]) => {
    setValidationErrors(errors);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // 各ファイルをアップロード
    for (const file of selectedFiles) {
      setUploadStatus((prev) => ({ ...prev, [file.name]: 'uploading' }));
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      try {
        // プログレスシミュレーション（実際のAPIでは進捗を取得）
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[file.name] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [file.name]: current + 10 };
          });
        }, 100);

        await uploadMutation.mutateAsync({
          file,
          description,
          tagIds: selectedTags.map((tag) => tag.id),
        });

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'success' }));
      } catch (error) {
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }));
      }
    }

    // すべて成功したらダイアログを閉じる
    setTimeout(() => {
      const allSuccess = Object.values(uploadStatus).every((status) => status === 'success');
      if (allSuccess) {
        handleClose();
      }
    }, 1000);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setDescription('');
    setSelectedTags([]);
    setCreateTagOpen(false);
    setValidationErrors([]);
    setUploadProgress({});
    setUploadStatus({});
    onClose();
  };

  const handleTagCreated = (tag: TagInfo) => {
    setSelectedTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
  };

  const isUploading = Object.values(uploadStatus).some((status) => status === 'uploading');
  const hasUploaded = Object.keys(uploadStatus).length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          m: { xs: 2, sm: 3 },
          maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#7e2a0c', fontSize: { xs: '1.1rem', md: '1.25rem' } }}
          >
            おたよりを追加
          </Typography>
          <IconButton onClick={handleClose} disabled={isUploading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
          {/* バリデーションエラー表示 */}
          {validationErrors.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 1,
              }}
            >
              {validationErrors.map((error, index) => (
                <Typography key={index} variant="body2" sx={{ color: '#dc2626' }}>
                  • {error}
                </Typography>
              ))}
            </Box>
          )}

          {/* ファイル選択 */}
          {!hasUploaded && (
            <FileUploadDropzone
              onFilesSelected={handleFilesSelected}
              onValidationError={handleValidationError}
              selectedFiles={selectedFiles}
            />
          )}

          {/* アップロード進捗 */}
          {hasUploaded && (
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                アップロード進捗
              </Typography>
              {selectedFiles.map((file) => (
                <FileUploadProgress
                  key={file.name}
                  fileName={file.name}
                  progress={uploadProgress[file.name] || 0}
                  status={uploadStatus[file.name] || 'uploading'}
                />
              ))}
            </Box>
          )}

          {/* 説明入力 */}
          {!hasUploaded && (
            <TextField
              label="説明（オプション）"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ffd6a7' },
                },
              }}
            />
          )}

          {/* タグ選択 */}
          {!hasUploaded && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#7e2a0c' }}>
                  タグ
                </Typography>
                <Button
                  size="small"
                  onClick={() => setCreateTagOpen(true)}
                  disabled={isUploading}
                  sx={{ color: '#ff6900', fontWeight: 'bold' }}
                >
                  ＋ タグを作成
                </Button>
              </Box>

              <Autocomplete
                multiple
                options={tagsData?.tags || []}
                getOptionLabel={(option) => option.name}
                value={selectedTags}
                onChange={(_, newValue) => setSelectedTags(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={undefined}
                    placeholder="タグを選択..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#ffd6a7' },
                      },
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.name}
                        {...tagProps}
                        sx={{
                          bgcolor: '#e0e7ff',
                          color: '#4338ca',
                          fontWeight: 'bold',
                        }}
                      />
                    );
                  })
                }
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={handleClose} disabled={isUploading}>
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading || hasUploaded}
          sx={{
            bgcolor: '#ff6900',
            '&:hover': { bgcolor: '#e65f00' },
            '&.Mui-disabled': { bgcolor: '#d1d5db' },
          }}
        >
          {isUploading ? 'アップロード中...' : 'アップロード'}
        </Button>
      </DialogActions>

      <CreateTagDialog
        open={createTagOpen}
        onClose={() => setCreateTagOpen(false)}
        onCreated={handleTagCreated}
      />
    </Dialog>
  );
};

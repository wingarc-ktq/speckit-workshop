import React, { useRef } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useFileDragAndDrop } from '@/presentations/hooks/useFileDragAndDrop';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_COUNT = 20;

interface FileUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onValidationError: (errors: string[]) => void;
  selectedFiles?: File[];
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  onFilesSelected,
  onValidationError,
  selectedFiles = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleFileInputChange } =
    useFileDragAndDrop({
      allowedTypes: ALLOWED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
      maxCount: MAX_FILE_COUNT,
      onFilesSelected,
      onValidationError,
    });

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      {/* ドロップゾーン */}
      <Box
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? '#ff6900' : '#ffd6a7',
          borderRadius: 2,
          bgcolor: isDragging ? '#fff7ed' : '#fffbf5',
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#ff6900',
            bgcolor: '#fff7ed',
          },
        }}
        onClick={handleButtonClick}
      >
        <CloudUploadIcon sx={{ fontSize: 64, color: '#ff6900', mb: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ color: '#7e2a0c', fontWeight: 'bold' }}>
          ファイルをドラッグ&ドロップ
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          または
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 1,
            bgcolor: '#ff6900',
            '&:hover': { bgcolor: '#e65f00' },
          }}
        >
          ファイルを選択
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2, color: '#6b7280' }}>
          対応形式: PDF, JPG, PNG（最大10MB、最大20ファイル）
        </Typography>
      </Box>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_FILE_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* 選択されたファイルのプレビュー */}
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#7e2a0c', fontWeight: 'bold' }}>
            選択されたファイル ({selectedFiles.length}件)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedFiles.map((file, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: '#f9fafb',
                  borderRadius: 1,
                  border: '1px solid #e5e7eb',
                }}
              >
                <Typography variant="body2" sx={{ color: '#374151' }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

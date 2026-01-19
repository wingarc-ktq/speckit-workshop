import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import type { TrashFileInfo } from '@/domain/models/files';

interface TrashFileListProps {
  files: TrashFileInfo[];
  isLoading: boolean;
  onRestore: (file: TrashFileInfo) => void;
  onPermanentDelete: (file: TrashFileInfo) => void;
  isDeleting?: boolean;
  isRestoring?: boolean;
}

export const TrashFileList: React.FC<TrashFileListProps> = ({
  files,
  isLoading,
  onRestore,
  onPermanentDelete,
  isDeleting = false,
  isRestoring = false,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          ゴミ箱にファイルはありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {files.map((file) => (
        <Box
          key={file.id}
          sx={{
            border: '2px solid #bedbff',
            borderRadius: 2,
            p: 2,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ color: '#1c398e', fontWeight: 'bold', mb: 0.5 }}>
              ファイル名
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#101828' }}>
              {file.name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#1c398e', fontWeight: 'bold', mb: 0.5 }}>
              削除日時
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#364153' }}>
              {new Date(file.deletedAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#1c398e', fontWeight: 'bold', mb: 1 }}>
              操作
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onRestore(file)}
                disabled={isRestoring || isDeleting}
                sx={{ flex: 1 }}
              >
                復元
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => onPermanentDelete(file)}
                disabled={isDeleting}
                sx={{ flex: 1 }}
              >
                完全削除
              </Button>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

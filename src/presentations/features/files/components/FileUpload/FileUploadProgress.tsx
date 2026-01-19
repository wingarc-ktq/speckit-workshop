import React from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

interface FileUploadProgressProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  fileName,
  progress,
  status,
  error,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
          {fileName}
        </Typography>
        {status === 'success' && <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />}
        {status === 'error' && <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />}
        {status === 'uploading' && (
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {progress}%
          </Typography>
        )}
      </Box>

      {status === 'uploading' && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#ff6900',
            },
          }}
        />
      )}

      {status === 'error' && error && (
        <Typography variant="caption" sx={{ color: '#ef4444' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

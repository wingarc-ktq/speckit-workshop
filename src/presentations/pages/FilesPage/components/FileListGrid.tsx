import React from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import type { FileInfo } from '@/adapters/generated/files';

import { FileListItem } from './FileListItem';

interface FileListGridProps {
  files: FileInfo[];
  isLoading: boolean;
}

export const FileListGrid: React.FC<FileListGridProps> = ({ files, isLoading }) => {
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
          ファイルが見つかりません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {files.map((file) => (
          <Grid
            key={file.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >
            <FileListItem file={file} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

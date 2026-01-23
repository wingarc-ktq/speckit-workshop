import React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import type { FileInfo } from '@/adapters/generated/files';
import { FileListGridSkeleton } from '@/presentations/components/LoadingSkeletons';

import { FileListItem } from './FileListItem';

interface FileListGridProps {
  files: FileInfo[];
  isLoading: boolean;
  onFileClick?: (fileId: string) => void;
}

export const FileListGrid: React.FC<FileListGridProps> = ({ files, isLoading, onFileClick }) => {
  if (isLoading) {
    return <FileListGridSkeleton items={8} />;
  }

  if (files.length === 0) {
    return (
      <Box sx={{ p: 8, textAlign: 'center' }} data-testid="empty-state">
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
            <FileListItem file={file} onFileClick={onFileClick} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

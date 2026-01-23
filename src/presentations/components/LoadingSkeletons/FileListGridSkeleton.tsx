import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

interface FileListGridSkeletonProps {
  items?: number;
}

export const FileListGridSkeleton: React.FC<FileListGridSkeletonProps> = ({ items = 8 }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {Array.from({ length: items }).map((_, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >
            <Card sx={{ height: '100%', border: '2px solid #ffd6a7', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Skeleton variant="rounded" width={40} height={40} />
                  <Skeleton variant="text" width="60%" />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                  <Skeleton variant="rounded" width={50} height={20} />
                  <Skeleton variant="rounded" width={60} height={20} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton variant="text" width={60} />
                  <Skeleton variant="text" width={100} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

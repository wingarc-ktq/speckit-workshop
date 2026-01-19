import React from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import Box from '@mui/material/Box';

interface FileIconProps {
  size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        bgcolor: '#ffedd4',
        borderRadius: 1,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DescriptionIcon sx={{ fontSize: size * 0.6, color: '#f97316' }} />
    </Box>
  );
};

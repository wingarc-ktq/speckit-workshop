import { useState } from 'react';

import { Box, Skeleton, Typography } from '@mui/material';

export interface ImageViewerProps {
  src: string;
  alt?: string;
  maxHeight?: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = 'preview',
  maxHeight = 360,
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <Box data-testid="image-viewer">
      {status === 'loading' && (
        <Skeleton
          data-testid="image-skeleton"
          variant="rectangular"
          height={maxHeight}
          sx={{ borderRadius: 1, mb: 1 }}
        />
      )}
      {status === 'error' ? (
        <Typography variant="body2" color="text.secondary">
          プレビューを表示できませんでした
        </Typography>
      ) : (
        <Box
          component="img"
          src={src}
          alt={alt}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          sx={{
            maxHeight,
            width: '100%',
            objectFit: 'contain',
            display: status === 'loaded' ? 'block' : 'none',
            borderRadius: 1,
          }}
        />
      )}
    </Box>
  );
};

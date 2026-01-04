import React from 'react';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingOverlayProps {
  /** ローディング表示の制御 */
  open: boolean;
}

/**
 * 共通ローディングオーバーレイコンポーネント
 * フルスクリーンでローディング表示を行う
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ open }) => {
  return (
    <Backdrop
      open={open}
      data-testid="loading-overlay"
      sx={(theme) => ({
        color: '#fff',
        zIndex: theme.zIndex.modal + 1,
      })}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

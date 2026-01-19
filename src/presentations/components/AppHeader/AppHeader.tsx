import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export const AppHeader: React.FC = () => {
  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        background: 'linear-gradient(135deg, #FF9800 0%, #FB8C00 100%)',
        height: 64,
        zIndex: (theme) => theme.zIndex.appBar,
        borderRadius: 2,
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          <MenuBookIcon sx={{ fontSize: 32, color: 'white' }} />
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.25rem',
                lineHeight: 1.2,
              }}
            >
              きょうしつポスト
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.75rem',
                display: 'block',
                lineHeight: 1,
              }}
            >
              先生と保護者の方々よりよ資料
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          sx={{
            bgcolor: 'white',
            color: '#FF9800',
            fontWeight: 600,
            px: 2,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          ごみ箱
        </Button>
      </Toolbar>
    </AppBar>
  );
};

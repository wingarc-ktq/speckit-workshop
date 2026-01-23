import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from '@mui/icons-material/List';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { UserMenu } from '@/presentations/layouts/AppLayout/components/AppHeader/components';

interface AppHeaderProps {
  showTrashButton?: boolean;
  onToggleView?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showTrashButton = true,
  onToggleView,
}) => {
  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        position: { xs: 'static', md: 'fixed' },
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
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onToggleView && (
            <Button
              variant="contained"
              startIcon={showTrashButton ? <DeleteIcon /> : <ListIcon />}
              onClick={onToggleView}
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
              {showTrashButton ? 'ごみ箱' : '一覧へ'}
            </Button>
          )}
          <Box sx={{ '& button': { color: 'white' }, '& svg': { color: 'white' } }}>
            <UserMenu />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const LayoutRoot = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#FFFBF5',
}));

export const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    marginTop: '64px', // デスクトップのみヘッダーの高さ分のマージン
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

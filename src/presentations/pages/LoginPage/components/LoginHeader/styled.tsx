import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const LoginHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(1),
}));

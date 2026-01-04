import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const FormButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.common.white,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
  transition: 'all 0.2s ease-in-out',
}));

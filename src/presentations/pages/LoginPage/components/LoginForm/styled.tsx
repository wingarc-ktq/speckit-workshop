import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const LoginFormContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const FormFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

export const RememberMeSection = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

export const ForgotPasswordSection = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

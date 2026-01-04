import type React from 'react';

import Alert, { type AlertProps } from '@mui/material/Alert';
import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const Root: React.FC<BoxProps> = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

export const Main: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  width: '100%',
}));

export const LogoArea: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const ContentArea: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.action.hover,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  width: '90%',
  maxWidth: 800,
}));

export const ErrorMessage: React.FC<AlertProps> = styled(Alert)(
  ({ theme }) => ({
    margin: theme.spacing(3),
    width: '100%',
  })
);

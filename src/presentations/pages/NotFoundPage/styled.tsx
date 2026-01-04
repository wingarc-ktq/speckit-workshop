import type React from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import Button, { type ButtonProps } from '@mui/material/Button';
import Container, { type ContainerProps } from '@mui/material/Container';
import { alpha, styled } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export const NotFoundContainer: React.FC<ContainerProps> = styled(Container)(
  () => ({
    maxWidth: 'md',
  })
);

export const ContentBox: React.FC<BoxProps> = styled(Box)(() => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  paddingY: 8,
}));

export const ErrorIconContainer: React.FC<BoxProps> = styled(Box)(() => ({
  position: 'relative',
  marginBottom: 4,
}));

export const ErrorNumber: React.FC<TypographyProps> = styled(Typography)(
  ({ theme }) => ({
    '&.MuiTypography-root': {
      ...theme.typography.h1,
      fontSize: '8rem',
      fontWeight: 900,
      color: alpha(theme.palette.primary.main, 0.1),
      lineHeight: 1,
      userSelect: 'none',
      [theme.breakpoints.up('md')]: {
        fontSize: '12rem',
      },
    },
  })
);

export const ErrorTitle: React.FC<TypographyProps> = styled(Typography)(
  ({ theme }) => ({
    '&.MuiTypography-root': {
      ...theme.typography.h4,
      fontWeight: 700,
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(2),
    },
  })
);

export const ErrorDescription: React.FC<TypographyProps> = styled(Typography)(
  ({ theme }) => ({
    '&.MuiTypography-root': {
      ...theme.typography.body1,
      marginBottom: theme.spacing(4),
      maxWidth: '500px',
      lineHeight: 1.6,
      color: theme.palette.text.secondary,
    },
  })
);

export const ActionBox: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: '400px',
  justifyContent: 'center',
  '@media (max-width: 600px)': {
    flexDirection: 'column',
  },
}));

export const HomeButton: React.FC<ButtonProps> = styled(Button)(() => ({
  paddingY: 1.5,
  paddingX: 3,
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  textDecoration: 'none',
  flex: '1 1 auto',
  minWidth: '160px',
  '@media (max-width: 600px)': {
    width: '100%',
  },
}));

export const BackButton: React.FC<ButtonProps> = styled(Button)(() => ({
  paddingY: 1.5,
  paddingX: 3,
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  flex: '1 1 auto',
  minWidth: '160px',
  '@media (max-width: 600px)': {
    width: '100%',
  },
}));

export const FloatingDecoration1: React.FC<BoxProps> = styled(Box)(
  ({ theme }) => ({
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: `linear-gradient(45deg, ${alpha(
      theme.palette.primary.main,
      0.1
    )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
    zIndex: -1,
    animation: 'float 6s ease-in-out infinite',
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-20px)' },
    },
  })
);

export const FloatingDecoration2: React.FC<BoxProps> = styled(Box)(
  ({ theme }) => ({
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.secondary.main,
      0.1
    )}, ${alpha(theme.palette.primary.main, 0.1)})`,
    zIndex: -1,
    animation: 'float 4s ease-in-out infinite 2s',
  })
);

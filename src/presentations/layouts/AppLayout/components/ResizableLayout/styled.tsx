import type React from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const ResizableContainer: React.FC<BoxProps> = styled(Box)({
  display: 'flex',
  height: '100%',
  position: 'relative',
  width: '100%',
});

interface SidebarWrapperProps {
  width: number;
  open: boolean;
}

export const SidebarWrapper: React.FC<BoxProps & SidebarWrapperProps> = styled(
  Box
)<SidebarWrapperProps>(({ theme, width, open }) => ({
  width,
  flexShrink: 0,
  overflow: 'hidden',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: open ? 0 : `-${width}px`,
}));

export const ResizeHandle: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 4,
  backgroundColor: 'transparent',
  cursor: 'col-resize',
  borderRight: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['border-color'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    borderRight: `2px solid ${theme.palette.primary.main}`,
  },
  '&:active': {
    borderRight: `2px solid ${theme.palette.primary.dark}`,
  },
}));

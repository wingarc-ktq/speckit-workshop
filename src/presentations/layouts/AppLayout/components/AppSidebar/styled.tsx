import Box, { type BoxProps } from '@mui/material/Box';
import Drawer, { type DrawerProps } from '@mui/material/Drawer';
import ListItem, { type ListItemProps } from '@mui/material/ListItem';
import ListItemButton, {
  type ListItemButtonProps,
} from '@mui/material/ListItemButton';
import { styled } from '@mui/material/styles';
import { NavLink, type NavLinkProps } from 'react-router-dom';

export const SidebarDrawer: React.FC<DrawerProps> = styled(Drawer)(() => ({
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    border: 'none',
    position: 'relative',
    height: '100vh',
  },
  ['@media (min-width: 900px)']: {
    flexShrink: 0,
  },
}));

export const SidebarContent: React.FC<BoxProps> = styled(Box)(() => ({
  overflow: 'auto',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const NavigationListItem: React.FC<ListItemProps> = styled(ListItem)(
  ({ theme }) => ({
    marginBottom: theme.spacing(1),
  })
);

export const NavigationLink: React.FC<NavLinkProps> = styled(NavLink)(() => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
}));

export const NavigationButton: React.FC<ListItemButtonProps> = styled(
  ListItemButton,
  {
    shouldForwardProp: (prop) => prop !== 'component',
  }
)(({ theme }) => ({
  borderRadius: theme.spacing(2),

  '&.Mui-selected': {
    color: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

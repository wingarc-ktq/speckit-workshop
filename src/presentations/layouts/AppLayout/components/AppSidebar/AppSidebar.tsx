import React from 'react';

import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';

import { useMenuItems } from '../../hooks';

import * as S from './styled';

export const AppSidebar: React.FC = () => {
  const menuItems = useMenuItems();

  return (
    <S.SidebarDrawer
      data-testid="appSidebar"
      variant="persistent"
      anchor="left"
      open
    >
      <Toolbar />
      <S.SidebarContent>
        <List>
          {menuItems.map((item) => (
            <S.NavigationListItem key={item.text} disablePadding>
              <S.NavigationLink to={item.path}>
                {({ isActive }: { isActive: boolean }) => (
                  <S.NavigationButton selected={isActive}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </S.NavigationButton>
                )}
              </S.NavigationLink>
            </S.NavigationListItem>
          ))}
        </List>
      </S.SidebarContent>
    </S.SidebarDrawer>
  );
};

import React from 'react';

import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Logo } from '@/presentations/ui';

import { UserMenu } from './components';
import * as S from './styled';

interface AppHeaderProps {
  onMenuToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuToggle }) => {
  return (
    <S.HeaderAppBar
      enableColorOnDark
      position="fixed"
      elevation={0}
      color="inherit"
    >
      <Toolbar>
        {/* Left Side */}
        <S.HeaderContent>
          <IconButton
            edge="start"
            data-testid="toggleButton"
            onClick={onMenuToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo and App Name */}
          <S.LogoSection>
            <Logo size={32} />
            <Typography
              variant="h6"
              component="span"
              sx={{ fontWeight: 'bold', color: 'inherit' }}
            >
              UI Proto
            </Typography>
          </S.LogoSection>
        </S.HeaderContent>

        {/* Right Side */}
        <S.HeaderActions>
          <UserMenu />
        </S.HeaderActions>
      </Toolbar>
    </S.HeaderAppBar>
  );
};

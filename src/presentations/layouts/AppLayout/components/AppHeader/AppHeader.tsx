import React, { useState } from 'react';

import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';

import { Logo } from '@/presentations/ui';

import { UserMenu } from './components';
import * as S from './styled';

interface AppHeaderProps {
  onMenuToggle: () => void;
  onSearch?: (keyword: string) => void;
  onViewChange?: (view: 'list' | 'grid') => void;
  onUploadClick?: () => void;
  onFilterClick?: () => void;
  currentView?: 'list' | 'grid';
  showDocumentTools?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuToggle,
  onSearch,
  onViewChange,
  onUploadClick,
  onFilterClick,
  currentView = 'list',
  showDocumentTools = false,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchKeyword(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'list' | 'grid' | null
  ) => {
    if (newView !== null && onViewChange) {
      onViewChange(newView);
    }
  };

  return (
    <S.HeaderAppBar
      enableColorOnDark
      position="fixed"
      elevation={0}
      color="inherit"
    >
      <Toolbar sx={{ gap: 0, justifyContent: 'space-between' }}>
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
              文書管理
            </Typography>
          </S.LogoSection>
        </S.HeaderContent>

        {/* Center - Document Management Tools */}
        {showDocumentTools && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {/* Search Bar */}
            <TextField
              value={searchKeyword}
              onChange={handleSearchChange}
              placeholder="文書を検索..."
              size="small"
              sx={{
                minWidth: 300,
                backgroundColor: 'background.paper',
                borderRadius: 1,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Filter Button */}
            {onFilterClick && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<FilterListIcon />}
                onClick={onFilterClick}
              >
                絞り込み
              </Button>
            )}

            {/* View Toggle */}
            {onViewChange && (
              <ToggleButtonGroup
                value={currentView}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <ToggleButton value="list" aria-label="リスト表示">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="グリッド表示">
                  <ViewModuleIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Upload Button */}
            {onUploadClick && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={onUploadClick}
              >
                アップロード
              </Button>
            )}
          </Box>
        )}

        {/* Right Side */}
        <S.HeaderActions>
          <UserMenu />
        </S.HeaderActions>
      </Toolbar>
    </S.HeaderAppBar>
  );
};

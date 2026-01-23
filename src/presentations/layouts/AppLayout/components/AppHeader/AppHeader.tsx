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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 }, 
              flex: 1,
              flexWrap: 'wrap',
            }}
          >
            {/* Search Bar */}
            <TextField
              value={searchKeyword ?? ''}
              onChange={handleSearchChange}
              placeholder={isMobile ? "検索..." : "文書を検索..."}
              size="small"
              sx={{
                minWidth: { xs: 120, sm: 200, md: 300 },
                backgroundColor: 'background.paper',
                borderRadius: 1,
                flex: { xs: 1, md: 'none' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Filter Button - Icon on mobile, Text on desktop */}
            {onFilterClick && (
              isMobile ? (
                <IconButton
                  color="primary"
                  onClick={onFilterClick}
                  data-testid="filter-button-mobile"
                  title="絞り込み"
                  size="small"
                >
                  <FilterListIcon />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FilterListIcon />}
                  onClick={onFilterClick}
                  data-testid="filter-button-desktop"
                >
                  絞り込み
                </Button>
              )
            )}

            {/* View Toggle */}
            {onViewChange && (
              <ToggleButtonGroup
                value={currentView ?? 'list'}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <ToggleButton value="list" aria-label="リスト表示">
                  <ViewListIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="グリッド表示">
                  <ViewModuleIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Upload Button - Icon on mobile, Text on desktop */}
            {onUploadClick && (
              isMobile ? (
                <IconButton
                  color="primary"
                  onClick={onUploadClick}
                  data-testid="upload-button-mobile"
                  title="アップロード"
                  size="small"
                >
                  <CloudUploadIcon />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={onUploadClick}
                  data-testid="upload-button-desktop"
                >
                  アップロード
                </Button>
              )
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

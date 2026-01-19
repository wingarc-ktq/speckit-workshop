import React from 'react';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

interface FileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FileSearchBar: React.FC<FileSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'ファイル名やタグで検索...',
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      sx={{
        maxWidth: 496,
        '& .MuiOutlinedInput-root': {
          bgcolor: '#fffbf5',
          borderRadius: 3,
          '& fieldset': { borderColor: '#ffd6a7' },
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#8b7355' }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              aria-label="検索をクリア"
              onClick={handleClear}
              edge="end"
              size="small"
              sx={{ color: '#8b7355' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

import { Box, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useCallback, useState, useRef } from 'react';

interface SearchBarProps {
  onSearch?: (keyword: string) => void;
  placeholder?: string;
}

/**
 * SearchBar コンポーネント
 * 文書検索用の入力バー
 *
 * @component
 * @example
 * ```tsx
 * <SearchBar
 *   onSearch={handleSearch}
 *   placeholder="文書を検索..."
 * />
 * ```
 */
export function SearchBar({
  onSearch,
  placeholder = '文書を検索...',
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      // デバウンス処理
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onSearch?.(value);
      }, 300);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchValue('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        data-testid="search-bar"
        sx={{
          backgroundColor: '#fff',
          borderRadius: 1,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#999' }} />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <button
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                data-testid="search-clear-button"
              >
                ✕
              </button>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import type { SelectChangeEvent } from '@mui/material/Select';

interface SortControlProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

/**
 * SortControl コンポーネント
 * 文書一覧のソート条件を選択
 *
 * @component
 * @example
 * ```tsx
 * <SortControl
 *   sortBy="fileName"
 *   sortOrder="asc"
 *   onSortChange={handleSortChange}
 * />
 * ```
 */
export function SortControl({ sortBy, sortOrder, onSortChange }: SortControlProps) {
  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    const newSortBy = event.target.value;
    onSortChange(newSortBy, sortOrder);
    // localStorage に保存
    localStorage.setItem('documentSortBy', newSortBy);
  };

  const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
    const newSortOrder = event.target.value as 'asc' | 'desc';
    onSortChange(sortBy, newSortOrder);
    // localStorage に保存
    localStorage.setItem('documentSortOrder', newSortOrder);
  };

  return (
    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 } }}>
        <InputLabel id="sort-by-label">ソート</InputLabel>
        <Select
          labelId="sort-by-label"
          value={sortBy}
          label="ソート"
          onChange={handleSortByChange}
          data-testid="sort-by-select"
        >
          <MenuItem value="fileName">ファイル名</MenuItem>
          <MenuItem value="uploadedAt">アップロード日時</MenuItem>
          <MenuItem value="fileSize">ファイルサイズ</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 100 } }}>
        <InputLabel id="sort-order-label">順序</InputLabel>
        <Select
          labelId="sort-order-label"
          value={sortOrder}
          label="順序"
          onChange={handleSortOrderChange}
          data-testid="sort-order-select"
        >
          <MenuItem value="asc">昇順</MenuItem>
          <MenuItem value="desc">降順</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

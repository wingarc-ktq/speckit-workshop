import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { TagColor } from '@/domain/models/files';

interface TagColorPickerProps {
  value: TagColor;
  onChange: (color: TagColor) => void;
}

const COLOR_OPTIONS: Array<{ value: TagColor; label: string }> = [
  { value: 'blue', label: '青' },
  { value: 'red', label: '赤' },
  { value: 'yellow', label: '黄' },
  { value: 'green', label: '緑' },
  { value: 'purple', label: '紫' },
  { value: 'orange', label: 'オレンジ' },
  { value: 'gray', label: 'グレー' },
];

const COLOR_MAP: Record<TagColor, string> = {
  blue: '#2196F3',
  red: '#F44336',
  yellow: '#FFC107',
  green: '#4CAF50',
  purple: '#9C27B0',
  orange: '#FF9800',
  gray: '#9E9E9E',
};

/**
 * タグカラーピッカーコンポーネント
 * プリセットカラーから選択
 */
export const TagColorPicker = ({ value, onChange }: TagColorPickerProps) => {
  return (
    <Box>
      <Typography variant="body2" gutterBottom fontWeight="medium">
        カラー
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {COLOR_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const chipProps = {
            label: option.label,
            onClick: () => onChange(option.value),
            icon: isSelected ? <CheckIcon fontSize="small" /> : undefined,
            sx: {
              bgcolor: COLOR_MAP[option.value],
              color: 'white',
              fontWeight: isSelected ? 'bold' : 'normal',
              '&:hover': {
                bgcolor: COLOR_MAP[option.value],
                opacity: 0.8,
              },
            },
          };
          return <Chip key={option.value} {...chipProps} />;
        })}
      </Stack>
    </Box>
  );
};

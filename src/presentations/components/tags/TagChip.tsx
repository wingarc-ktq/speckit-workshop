import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Tag, TagColor } from '@/domain/models/tag';

const TAG_COLOR_MAP: Record<TagColor, { main: string; contrastText: string }> = {
  primary: { main: '#1e88e5', contrastText: '#ffffff' },
  secondary: { main: '#9c27b0', contrastText: '#ffffff' },
  error: { main: '#e64a19', contrastText: '#ffffff' },
  success: { main: '#2e7d32', contrastText: '#ffffff' },
  warning: { main: '#f57c00', contrastText: '#ffffff' },
  info: { main: '#0288d1', contrastText: '#ffffff' },
};

export interface TagChipProps {
  tag: Tag;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  tone?: 'document' | 'progress';
  selected?: boolean;
  count?: number;
}

/**
 * TagChip コンポーネント
 * タグを Material-UI Chip で表示し、色のマッピングを提供
 */
export function TagChip({
  tag,
  onDelete,
  onClick,
  variant,
  size = 'small',
  tone = 'document',
  selected = false,
  count,
}: TagChipProps) {
  const palette = TAG_COLOR_MAP[tag.color];
  const effectiveVariant = variant ?? (tone === 'progress' ? (selected ? 'filled' : 'outlined') : 'outlined');

  const label = count !== undefined ? `${tag.name} ${count}` : tag.name;

  const styles =
    effectiveVariant === 'filled'
      ? {
          backgroundColor: palette.main,
          color: palette.contrastText,
          fontWeight: 700,
        }
      : {
          borderColor: palette.main,
          color: palette.main,
          fontWeight: 700,
          backgroundColor: selected ? alpha(palette.main, 0.08) : 'transparent',
        };

  return (
    <Chip
      label={label}
      variant={effectiveVariant}
      size={size}
      onDelete={onDelete}
      onClick={onClick}
      sx={{
        px: 1.5,
        height: 32,
        borderWidth: 1.5,
        ...styles,
      }}
      data-testid={`tag-chip-${tag.id}`}
    />
  );
}

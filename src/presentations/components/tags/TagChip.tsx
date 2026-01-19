import { Chip } from '@mui/material';
import type { Tag } from '@/domain/models/tag';

interface TagChipProps {
  tag: Tag;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

/**
 * TagChip コンポーネント
 * タグを Material-UI Chip で表示し、色のマッピングを提供
 *
 * @component
 * @example
 * ```tsx
 * <TagChip
 *   tag={tag}
 *   onDelete={handleDelete}
 *   variant="filled"
 *   size="small"
 * />
 * ```
 */
export function TagChip({ tag, onDelete, onClick, variant = 'outlined', size = 'small' }: TagChipProps) {
  return (
    <Chip
      label={tag.name}
      color={tag.color}
      variant={variant}
      size={size}
      onDelete={onDelete}
      onClick={onClick}
      sx={{
        fontWeight: 500,
      }}
      data-testid={`tag-chip-${tag.id}`}
    />
  );
}

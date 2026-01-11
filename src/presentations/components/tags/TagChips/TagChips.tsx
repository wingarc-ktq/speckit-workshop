import Chip, { type ChipProps } from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import type { Tag, TagColor } from '@/domain/models/tag';

interface TagChipsProps {
  tags: Tag[];
  size?: 'small' | 'medium';
  max?: number;
  onDelete?: (tagId: string) => void;
  onClick?: (tag: Tag) => void;
}

/**
 * TagChips コンポーネント
 *
 * タグのリストをChipコンポーネントで表示する共通UIコンポーネント
 *
 * @example
 * ```tsx
 * <TagChips tags={tags} size="small" />
 * <TagChips tags={tags} onDelete={handleDelete} max={5} />
 * ```
 */
export const TagChips = ({
  tags,
  size = 'medium',
  max,
  onDelete,
  onClick,
}: TagChipsProps) => {
  // 最大表示数による制限
  const displayTags = max && tags.length > max ? tags.slice(0, max) : tags;
  const remainingCount = max && tags.length > max ? tags.length - max : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {displayTags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          color={getChipColor(tag.color)}
          size={size}
          onDelete={onDelete ? () => onDelete(tag.id) : undefined}
          onClick={onClick ? () => onClick(tag) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <Chip label={`+${remainingCount}`} size={size} variant="outlined" />
      )}
    </Stack>
  );
};

/**
 * タグの色をMUIのChipカラーに変換
 */
const getChipColor = (color: TagColor): ChipProps['color'] => {
  const colorMap: Record<TagColor, ChipProps['color']> = {
    blue: 'info',
    red: 'error',
    yellow: 'warning',
    green: 'success',
    purple: 'secondary',
    orange: 'warning',
    gray: 'default',
  };

  return colorMap[color];
};

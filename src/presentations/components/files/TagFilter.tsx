import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { useTags } from '@/presentations/hooks/queries';

interface TagFilterProps {
  selectedTagIds?: string[];
  onTagsChange?: (tagIds: string[]) => void;
}

/**
 * TagFilter コンポーネント
 * タグによるフィルタリング機能を提供
 *
 * @component
 * @example
 * ```tsx
 * <TagFilter
 *   selectedTagIds={['tag1', 'tag2']}
 *   onTagsChange={handleTagsChange}
 * />
 * ```
 */
export function TagFilter({ selectedTagIds = [], onTagsChange }: TagFilterProps) {
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2">タグ</Typography>
        <CircularProgress size={20} />
      </Box>
    );
  }

  const handleTagToggle = (tagId: string) => {
    let newSelectedTagIds: string[];
    if (selectedTagIds.includes(tagId)) {
      newSelectedTagIds = selectedTagIds.filter((id) => id !== tagId);
    } else {
      newSelectedTagIds = [...selectedTagIds, tagId];
    }
    onTagsChange?.(newSelectedTagIds);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#fafafa',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
        flexWrap: 'wrap',
      }}
      data-testid="tag-filter"
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, width: '100%', marginBottom: 1 }}>
        タグ
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
        {tags && tags.length > 0 ? (
          tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onClick={() => handleTagToggle(tag.id)}
              variant={selectedTagIds.includes(tag.id) ? 'filled' : 'outlined'}
              color={selectedTagIds.includes(tag.id) ? 'primary' : 'default'}
              data-testid={`tag-chip-${tag.id}`}
            />
          ))
        ) : (
          <Typography variant="body2" sx={{ color: '#999' }}>
            タグなし
          </Typography>
        )}
      </Box>
    </Box>
  );
}

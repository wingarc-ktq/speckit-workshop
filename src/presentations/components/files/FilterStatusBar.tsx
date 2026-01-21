import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import type { Tag } from '@/domain/models/tag';
import { TagChip } from '@/presentations/components/tags/TagChip';

const PROGRESS_TAG_NAMES = ['完了', '未完了', '進行中'];

interface FilterStatusBarProps {
  selectedTags: Tag[];
  onRemoveTag: (tagId: string) => void;
  onClearAll: () => void;
}

/**
 * FilterStatusBar コンポーネント
 * 選択中のタグフィルターを表示し、個別削除や全削除が可能
 *
 * @component
 * @example
 * ```tsx
 * <FilterStatusBar
 *   selectedTags={selectedTags}
 *   onRemoveTag={handleRemoveTag}
 *   onClearAll={handleClearAll}
 * />
 * ```
 */
export function FilterStatusBar({ selectedTags, onRemoveTag, onClearAll }: FilterStatusBarProps) {
  if (selectedTags.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1.5,
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
        flexWrap: 'wrap',
      }}
      data-testid="filter-status-bar"
    >
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
        フィルター適用中:
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1 }}>
        {selectedTags.map((tag) => {
          const isProgress = PROGRESS_TAG_NAMES.includes(tag.name);
          const tone = isProgress ? 'progress' : 'document';
          const variant = isProgress ? 'filled' : 'outlined';

          return (
            <TagChip
              key={tag.id}
              tag={tag}
              tone={tone}
              variant={variant}
              selected
              size="small"
              onDelete={() => onRemoveTag(tag.id)}
              data-testid={`filter-chip-${tag.id}`}
            />
          );
        })}
      </Box>

      <Button
        size="small"
        onClick={onClearAll}
        sx={{ textTransform: 'none', fontWeight: 500 }}
        data-testid="clear-all-filters-button"
      >
        すべてクリア
      </Button>
    </Box>
  );
}

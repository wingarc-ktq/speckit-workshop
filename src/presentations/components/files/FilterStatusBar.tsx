import { Box, Chip, Typography, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Tag } from '@/domain/models/tag';

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
        {selectedTags.map((tag) => (
          <Chip
            key={tag.id}
            label={tag.name}
            color={tag.color}
            size="small"
            onDelete={() => onRemoveTag(tag.id)}
            deleteIcon={<CloseIcon />}
            sx={{ fontWeight: 500 }}
            data-testid={`filter-chip-${tag.id}`}
          />
        ))}
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

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import type { Tag } from '@/domain/models/tag';
import { TagChip } from '@/presentations/components/tags/TagChip';
import { useTags } from '@/presentations/hooks/queries';

const DOCUMENT_TAG_NAMES = ['請求書', '契約書', '議事録', '提案書', '見積書', '仕様書', 'マニュアル'];
const PROGRESS_TAG_NAMES = ['完了', '未完了', '進行中'];

interface TagFilterProps {
  selectedTagIds?: string[];
  onTagsChange?: (tagIds: string[]) => void;
  tagCounts?: Record<string, number>;
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
export function TagFilter({ selectedTagIds = [], onTagsChange, tagCounts = {} }: TagFilterProps) {
  const { data: tags, isLoading } = useTags();

  const { documentTags, progressTags, uncategorizedTags } = useMemo(() => {
    if (!tags) {
      return { documentTags: [], progressTags: [], uncategorizedTags: [] };
    }

    const docs = tags.filter((tag) => DOCUMENT_TAG_NAMES.includes(tag.name));
    const progresses = tags.filter((tag) => PROGRESS_TAG_NAMES.includes(tag.name));
    const uncategorized = tags.filter(
      (tag) => !DOCUMENT_TAG_NAMES.includes(tag.name) && !PROGRESS_TAG_NAMES.includes(tag.name)
    );

    return { documentTags: docs, progressTags: progresses, uncategorizedTags: uncategorized };
  }, [tags]);

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

  const renderChip = (
    tag: Pick<Tag, 'id' | 'name' | 'color'>,
    group: 'document' | 'progress' | 'uncategorized'
  ) => {
    const isSelected = selectedTagIds.includes(tag.id);
    const variant = group === 'progress' ? (isSelected ? 'filled' : 'outlined') : 'outlined';

    return (
      <TagChip
        key={tag.id}
        tag={tag as Tag}
        variant={variant}
        tone={group === 'progress' ? 'progress' : 'document'}
        selected={isSelected}
        count={tagCounts[tag.id] ?? 0}
        onClick={() => handleTagToggle(tag.id)}
      />
    );
  };

  const hasAnyTags = Boolean(tags && tags.length > 0);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        flexDirection: 'column',
        padding: '12px',
        backgroundColor: '#fafafa',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
      }}
      data-testid="tag-filter"
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        タグ
      </Typography>

      {hasAnyTags ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#555' }}>
              ドキュメント種別
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {documentTags.length > 0
                ? documentTags.map((tag) => renderChip(tag, 'document'))
                : uncategorizedTags.map((tag) => renderChip(tag, 'document'))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#555' }}>
              進捗ステータス
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {progressTags.length > 0 ? (
                progressTags.map((tag) => renderChip(tag, 'progress'))
              ) : (
                <Typography variant="body2" sx={{ color: '#999' }}>
                  ステータスタグなし
                </Typography>
              )}
            </Box>
          </Box>
        </>
      ) : (
        <Typography variant="body2" sx={{ color: '#999' }}>
          タグなし
        </Typography>
      )}
    </Box>
  );
}

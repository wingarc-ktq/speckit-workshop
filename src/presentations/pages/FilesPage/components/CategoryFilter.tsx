import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import type { TagInfo } from '@/domain/models/files/TagInfo';

interface CategoryFilterProps {
  tags: TagInfo[];
  selectedTags: string[];
  onTagClick: (tagId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  tags,
  selectedTags,
  onTagClick,
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#0d542b', fontWeight: 'bold', mb: 2, fontSize: 16 }}>
        カテゴリーで絞り込み
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            label={tag.name}
            onClick={() => onTagClick(tag.id)}
            variant={selectedTags.includes(tag.id) ? 'filled' : 'outlined'}
            sx={{
              borderColor: selectedTags.includes(tag.id) ? tag.color : '#d1d5dc',
              bgcolor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
              color: selectedTags.includes(tag.id) ? 'white' : '#364153',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: selectedTags.includes(tag.id) ? tag.color : 'rgba(0,0,0,0.04)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

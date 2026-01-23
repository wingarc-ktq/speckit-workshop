import React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import { DateRangeFilter, TagFilter } from '@/presentations/components';

export interface FilterDialogProps {
  open: boolean;
  selectedTagIds: string[];
  tagCounts: Record<string, number>;
  startDate: string;
  endDate: string;
  onClose: () => void;
  onTagsChange: (tagIds: string[]) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  selectedTagIds,
  tagCounts,
  startDate,
  endDate,
  onClose,
  onTagsChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>絞り込み</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <TagFilter selectedTagIds={selectedTagIds} onTagsChange={onTagsChange} tagCounts={tagCounts} />
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

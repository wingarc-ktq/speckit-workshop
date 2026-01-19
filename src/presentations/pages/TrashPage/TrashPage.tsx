import React, { useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { TrashFileInfo } from '@/domain/models/files';
import { DeleteConfirmDialog } from '@/presentations/components/dialogs';
import { usePermanentlyDeleteFile } from '@/presentations/hooks/mutations/usePermanentlyDeleteFile';
import { useRestoreFile } from '@/presentations/hooks/mutations/useRestoreFile';
import { useTrash } from '@/presentations/hooks/queries/useTrash';

import { TrashFileList } from './components/TrashFileList';

export const TrashPage: React.FC = () => {
  const { data, isLoading } = useTrash();
  const restoreMutation = useRestoreFile();
  const permanentlyDeleteMutation = usePermanentlyDeleteFile();

  const [deleteTarget, setDeleteTarget] = useState<TrashFileInfo | null>(null);

  const handleRestore = async (file: TrashFileInfo) => {
    await restoreMutation.mutateAsync(file.id);
  };

  const handlePermanentDelete = (file: TrashFileInfo) => {
    setDeleteTarget(file);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await permanentlyDeleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const trashFiles = data?.files ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '2px solid',
          borderColor: '#ffd6a7',
          borderRadius: 2,
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon sx={{ fontSize: 28, color: '#7e2a0c' }} />
          <Box>
            <Typography variant="h4" sx={{ color: '#7e2a0c', fontWeight: 'bold', fontSize: 24 }}>
              ごみ箱
            </Typography>
            <Typography variant="body2" sx={{ color: '#f54900' }}>
              {trashFiles.length}件
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '2px solid',
          borderColor: '#bedbff',
          borderRadius: 2,
          bgcolor: 'white',
          overflow: 'hidden',
        }}
      >
        <TrashFileList
          files={trashFiles}
          isLoading={isLoading}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          isDeleting={permanentlyDeleteMutation.isPending}
          isRestoring={restoreMutation.isPending}
        />
      </Paper>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="完全削除しますか？"
        description={deleteTarget?.name}
        confirmLabel="完全削除"
        isLoading={permanentlyDeleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

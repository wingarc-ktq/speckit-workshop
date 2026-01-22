import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import type { TagInfo } from '@/domain/models/files';
import { TagForm } from '@/presentations/components/forms/TagForm';
import { useUpdateTag } from '@/presentations/hooks/mutations/useUpdateTag';

interface EditTagDialogProps {
  open: boolean;
  tag: TagInfo | null;
  onClose: () => void;
}

export const EditTagDialog = ({ open, tag, onClose }: EditTagDialogProps) => {
  const updateTagMutation = useUpdateTag();

  if (!tag) return null;

  const handleSubmit = async (data: { name: string; color: TagInfo['color'] }) => {
    await updateTagMutation.mutateAsync({
      id: tag.id,
      name: data.name,
      color: data.color,
    });
    onClose();
  };

  const errorMessage =
    updateTagMutation.error instanceof Error ? updateTagMutation.error.message : undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            タグを編集
          </Typography>
          <IconButton onClick={onClose} disabled={updateTagMutation.isPending} aria-label="閉じる">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <TagForm
          initialName={tag.name}
          initialColor={tag.color}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel={updateTagMutation.isPending ? '保存中...' : '保存'}
          isLoading={updateTagMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

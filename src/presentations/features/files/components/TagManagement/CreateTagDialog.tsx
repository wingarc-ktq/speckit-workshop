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
import { useCreateTag } from '@/presentations/hooks/mutations/useCreateTag';

interface CreateTagDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (tag: TagInfo) => void;
}

export const CreateTagDialog = ({ open, onClose, onCreated }: CreateTagDialogProps) => {
  const createTagMutation = useCreateTag();

  const handleSubmit = async (data: { name: string; color: TagInfo['color'] }) => {
    const tag = await createTagMutation.mutateAsync({
      name: data.name,
      color: data.color,
    });

    onCreated?.(tag);
    onClose();
  };

  const errorMessage =
    createTagMutation.error instanceof Error ? createTagMutation.error.message : undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            タグを作成
          </Typography>
          <IconButton onClick={onClose} disabled={createTagMutation.isPending}>
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
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel={createTagMutation.isPending ? '作成中...' : '作成'}
          isLoading={createTagMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

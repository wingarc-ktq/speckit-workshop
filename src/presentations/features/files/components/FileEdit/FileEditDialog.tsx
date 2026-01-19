import { useMemo, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import type { FileInfo, TagInfo } from '@/domain/models/files';
import { useUpdateFile } from '@/presentations/hooks/mutations/useUpdateFile';
import { useTags } from '@/presentations/hooks/queries/useTags';

import { CreateTagDialog } from '../TagManagement/CreateTagDialog';
import { FileEditForm } from './FileEditForm';

interface FileEditDialogProps {
  open: boolean;
  file: FileInfo | null;
  onClose: () => void;
}

export const FileEditDialog = ({ open, file, onClose }: FileEditDialogProps) => {
  const { data: tagsData } = useTags();
  const updateFileMutation = useUpdateFile();

  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [createdTag, setCreatedTag] = useState<TagInfo | null>(null);

  const availableTags = useMemo(() => tagsData?.tags ?? [], [tagsData?.tags]);

  const initialTags = useMemo(() => {
    if (!file) return [];
    const tagsById = new Map(availableTags.map((tag) => [tag.id, tag]));
    return file.tagIds
      .map((id) => tagsById.get(id))
      .filter((tag): tag is TagInfo => Boolean(tag));
  }, [availableTags, file]);

  if (!file) return null;

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    tagIds: string[];
  }) => {
    await updateFileMutation.mutateAsync({
      id: file.id,
      name: data.name,
      description: data.description,
      tagIds: data.tagIds,
    });
    onClose();
  };

  const handleClose = () => {
    setCreateTagOpen(false);
    setCreatedTag(null);
    onClose();
  };

  const handleTagCreated = (tag: TagInfo) => {
    setCreatedTag(tag);
    setCreateTagOpen(false);
  };

  const errorMessage =
    updateFileMutation.error instanceof Error ? updateFileMutation.error.message : undefined;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ファイル情報を編集
          </Typography>
          <IconButton onClick={handleClose} disabled={updateFileMutation.isPending}>
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

        <FileEditForm
          resetKey={file.id}
          initialName={file.name}
          initialDescription={file.description}
          initialTags={initialTags}
          tagOptions={availableTags}
          createdTag={createdTag}
          onOpenCreateTag={() => setCreateTagOpen(true)}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel={updateFileMutation.isPending ? '保存中...' : '保存'}
          isLoading={updateFileMutation.isPending}
        />
      </DialogContent>

      <CreateTagDialog
        open={createTagOpen}
        onClose={() => setCreateTagOpen(false)}
        onCreated={handleTagCreated}
      />
    </Dialog>
  );
};

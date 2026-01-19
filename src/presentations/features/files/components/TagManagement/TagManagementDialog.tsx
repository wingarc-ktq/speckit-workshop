import { useMemo, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { TagInfo } from '@/domain/models/files';
import { TAG_COLOR_PALETTE } from '@/domain/models/files/TagInfo';
import { useDeleteTag } from '@/presentations/hooks/mutations/useDeleteTag';
import { useTags } from '@/presentations/hooks/queries/useTags';

import { CreateTagDialog } from './CreateTagDialog';
import { EditTagDialog } from './EditTagDialog';

interface TagManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TagManagementDialog = ({ open, onClose }: TagManagementDialogProps) => {
  const { data: tagsData, isLoading } = useTags();
  const deleteTagMutation = useDeleteTag();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TagInfo | null>(null);
  const [search, setSearch] = useState('');

  const filteredTags = useMemo(() => {
    const tags = tagsData?.tags ?? [];
    if (!search.trim()) return tags;
    const s = search.trim().toLowerCase();
    return tags.filter((t) => t.name.toLowerCase().includes(s));
  }, [tagsData?.tags, search]);

  const handleClose = () => {
    setCreateOpen(false);
    setEditingTag(null);
    setDeleteTarget(null);
    setSearch('');
    onClose();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTagMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const deleteErrorMessage =
    deleteTagMutation.error instanceof Error ? deleteTagMutation.error.message : undefined;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LabelIcon sx={{ color: '#7e2a0c' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7e2a0c' }}>
              タグ管理
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={deleteTagMutation.isPending}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="タグを検索..."
              fullWidth
            />
            <Button
              variant="contained"
              onClick={() => setCreateOpen(true)}
              sx={{ bgcolor: '#ff6900', '&:hover': { bgcolor: '#e65f00' }, fontWeight: 'bold' }}
            >
              新規作成
            </Button>
          </Box>

          {deleteErrorMessage && <Alert severity="error">{deleteErrorMessage}</Alert>}

          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              読み込み中...
            </Typography>
          ) : filteredTags.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              タグがありません
            </Typography>
          ) : (
            <List dense sx={{ border: '1px solid #eee', borderRadius: 1 }}>
              {filteredTags.map((tag) => {
                const palette = TAG_COLOR_PALETTE[tag.color];
                return (
                  <ListItem key={tag.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            label={tag.name}
                            sx={{
                              bgcolor: palette.main,
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {tag.id}
                          </Typography>
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => setEditingTag(tag)}
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => setDeleteTarget(tag)}
                        disabled={deleteTagMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose}>閉じる</Button>
      </DialogActions>

      <CreateTagDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditTagDialog open={!!editingTag} tag={editingTag} onClose={() => setEditingTag(null)} />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>タグを削除しますか？</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {deleteTarget?.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteTagMutation.isPending}>
            キャンセル
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteTagMutation.isPending}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

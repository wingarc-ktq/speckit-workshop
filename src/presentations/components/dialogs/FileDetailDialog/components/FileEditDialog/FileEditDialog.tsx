import React, { useCallback, useEffect, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

import type { FileId, UpdateFileRequest } from '@/domain/models/file';
import type { Tag } from '@/domain/models/tag';
import { tKeys } from '@/i18n/tKeys';
import { TagSelector } from '@/presentations/components/tags/TagSelector/TagSelector';
import { useFileById } from '@/presentations/hooks/queries/files/useFileById';
import { useUpdateFile } from '@/presentations/hooks/queries/files/useUpdateFile';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';

interface FileEditDialogProps {
  fileId: FileId | null;
  open: boolean;
  onClose: () => void;
}

const FileEditDialogContent: React.FC<{
  fileId: FileId;
  onClose: () => void;
}> = ({ fileId, onClose }) => {
  const { t } = useTranslation();
  const { data: file } = useFileById(fileId);
  const { data: allTags } = useTags();
  const { mutate: updateFile, isPending } = useUpdateFile();

  // フォームの状態
  const [fileName, setFileName] = useState(file.name);
  const [description, setDescription] = useState(file.description ?? '');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // 初期値の設定
  useEffect(() => {
    setFileName(file.name);
    setDescription(file.description ?? '');
    const fileTags = allTags.filter((tag) => file.tagIds.includes(tag.id));
    setSelectedTags(fileTags);
  }, [file, allTags]);

  // バリデーション
  const isFileNameValid = fileName.trim().length > 0 && fileName.length <= 255;
  const isDescriptionValid = description.length <= 500;
  const isFormValid = isFileNameValid && isDescriptionValid;

  const handleSave = useCallback(() => {
    if (!isFormValid) return;

    const request: UpdateFileRequest = {
      name: fileName.trim(),
      description: description.trim() || undefined,
      tagIds: selectedTags.map((tag) => tag.id),
    };

    updateFile(
      { fileId, request },
      {
        onSuccess: onClose,
      }
    );
  }, [
    fileId,
    fileName,
    description,
    selectedTags,
    updateFile,
    onClose,
    isFormValid,
  ]);

  return (
    <>
      <DialogTitle>{t(tKeys.filesPage.fileEditDialog.title)}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <TextField
            label={t(tKeys.filesPage.fileEditDialog.fileName)}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            error={!isFileNameValid}
            helperText={
              !isFileNameValid
                ? t(tKeys.filesPage.fileEditDialog.fileNameError)
                : undefined
            }
            required
            fullWidth
            autoFocus
          />

          <TextField
            label={t(tKeys.filesPage.fileEditDialog.description)}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!isDescriptionValid}
            helperText={
              !isDescriptionValid
                ? t(tKeys.filesPage.fileEditDialog.descriptionError)
                : `${description.length}/500`
            }
            multiline
            rows={4}
            fullWidth
          />

          <TagSelector
            label={t(tKeys.filesPage.fileEditDialog.tags)}
            value={selectedTags}
            options={allTags}
            onChange={setSelectedTags}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t(tKeys.common.cancel)}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleSave}
          disabled={!isFormValid || isPending}
        >
          {t(tKeys.common.save)}
        </Button>
      </DialogActions>
    </>
  );
};

export const FileEditDialog: React.FC<FileEditDialogProps> = ({
  fileId,
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {fileId && <FileEditDialogContent fileId={fileId} onClose={onClose} />}
    </Dialog>
  );
};

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { TagInfo } from '@/domain/models/files';
import { TAG_COLOR_PALETTE } from '@/domain/models/files/TagInfo';

interface FileEditFormProps {
  resetKey: string;
  initialName: string;
  initialDescription?: string;
  initialTags: TagInfo[];
  tagOptions: TagInfo[];
  createdTag?: TagInfo | null;
  onOpenCreateTag: () => void;
  onSubmit: (data: { name: string; description?: string; tagIds: string[] }) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export const FileEditForm = ({
  resetKey,
  initialName,
  initialDescription,
  initialTags,
  tagOptions,
  createdTag,
  onOpenCreateTag,
  onSubmit,
  onCancel,
  submitLabel = '保存',
  isLoading = false,
}: FileEditFormProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');
  const [selectedTags, setSelectedTags] = useState<TagInfo[]>(initialTags);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription ?? '');
    setSelectedTags(initialTags);
    setErrors({});
  }, [resetKey]);

  useEffect(() => {
    if (!createdTag) return;
    setSelectedTags((prev) => (prev.some((t) => t.id === createdTag.id) ? prev : [...prev, createdTag]));
  }, [createdTag]);

  const mergedTagOptions = useMemo(() => {
    const optionMap = new Map<string, TagInfo>();
    tagOptions.forEach((tag) => optionMap.set(tag.id, tag));
    selectedTags.forEach((tag) => optionMap.set(tag.id, tag));
    return Array.from(optionMap.values());
  }, [tagOptions, selectedTags]);

  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'ファイル名は必須です';
    }
    if (value.trim().length > 255) {
      return 'ファイル名は255文字以内にしてください';
    }
    return undefined;
  };

  const validateDescription = (value: string): string | undefined => {
    if (value.length > 500) {
      return '説明は500文字以内にしてください';
    }
    return undefined;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nameError = validateName(name);
    const descriptionError = validateDescription(description);

    if (nameError || descriptionError) {
      setErrors({ name: nameError, description: descriptionError });
      return;
    }

    setErrors({});
    onSubmit({
      name: name.trim(),
      description: description.trim() ? description.trim() : undefined,
      tagIds: selectedTags.map((tag) => tag.id),
    });
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setName(value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDescription(value);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: validateDescription(value) }));
    }
  };

  const initialTagIds = useMemo(
    () => initialTags.map((tag) => tag.id).sort(),
    [initialTags]
  );

  const selectedTagIds = useMemo(
    () => selectedTags.map((tag) => tag.id).sort(),
    [selectedTags]
  );

  const isDirty =
    name.trim() !== initialName.trim() ||
    (description.trim() || '') !== (initialDescription ?? '').trim() ||
    initialTagIds.join(',') !== selectedTagIds.join(',');

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label="ファイル名"
          value={name}
          onChange={handleNameChange}
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
          autoFocus
          disabled={isLoading}
          inputProps={{ maxLength: 255 }}
        />

        <TextField
          label="説明（オプション）"
          value={description}
          onChange={handleDescriptionChange}
          error={!!errors.description}
          helperText={errors.description}
          multiline
          rows={3}
          fullWidth
          disabled={isLoading}
          inputProps={{ maxLength: 500 }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#7e2a0c' }}>
              タグ
            </Typography>
            <Button
              size="small"
              onClick={onOpenCreateTag}
              disabled={isLoading}
              sx={{ color: '#ff6900', fontWeight: 'bold' }}
            >
              ＋ タグを作成
            </Button>
          </Box>

          <Autocomplete
            multiple
            options={mergedTagOptions}
            getOptionLabel={(option) => option.name}
            value={selectedTags}
            onChange={(_, newValue) => setSelectedTags(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="タグを選択..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#ffd6a7' },
                  },
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const palette = TAG_COLOR_PALETTE[option.color];
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option.name}
                    {...tagProps}
                    sx={{
                      bgcolor: palette.main,
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                );
              })
            }
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button onClick={onCancel} disabled={isLoading}>
              キャンセル
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isLoading || !isDirty}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

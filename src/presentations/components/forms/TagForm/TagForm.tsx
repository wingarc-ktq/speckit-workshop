import { useState, type ChangeEvent, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

import type { TagColor } from '@/domain/models/files';
import { TagColorPicker } from '../TagColorPicker';

interface TagFormProps {
  initialName?: string;
  initialColor?: TagColor;
  onSubmit: (data: { name: string; color: TagColor }) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

/**
 * タグ作成/編集フォームコンポーネント
 */
export const TagForm = ({
  initialName = '',
  initialColor = 'blue',
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: TagFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<TagColor>(initialColor);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return t('filesPage.tags.nameRequired');
    }
    if (value.length > 50) {
      return t('filesPage.tags.nameMaxLength');
    }
    return undefined;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }

    setErrors({});
    onSubmit({ name: name.trim(), color });
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    // リアルタイムバリデーション
    if (errors.name) {
      const nameError = validateName(newName);
      setErrors({ name: nameError });
    }
  };

  const defaultSubmitLabel = t('actions.create');
  const cancelLabel = t('actions.cancel');
  const tagNameLabel = t('filesPage.tags.label');

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label={tagNameLabel}
          value={name}
          onChange={handleNameChange}
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
          autoFocus
          disabled={isLoading}
          inputProps={{ maxLength: 50 }}
        />

        <TagColorPicker value={color} onChange={setColor} />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button onClick={onCancel} disabled={isLoading}>
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !name.trim()}
          >
            {submitLabel ?? defaultSubmitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

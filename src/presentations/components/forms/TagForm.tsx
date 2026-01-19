import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import type { TagColor } from '@/adapters/generated/files';
import { TagColorPicker } from './TagColorPicker';

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
  submitLabel = '作成',
  isLoading = false,
}: TagFormProps) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<TagColor>(initialColor);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'タグ名は必須です';
    }
    if (value.length > 50) {
      return 'タグ名は50文字以内にしてください';
    }
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }

    setErrors({});
    onSubmit({ name: name.trim(), color });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // リアルタイムバリデーション
    if (errors.name) {
      const nameError = validateName(newName);
      setErrors({ name: nameError });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label="タグ名"
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
              キャンセル
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !name.trim()}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

import { useMemo } from 'react';
import {
  Autocomplete,
  Chip,
  TextField,
} from '@mui/material';
import type { AutocompleteProps } from '@mui/material';
import type { Tag } from '@/domain/models/tag';
import { useTags } from '@/presentations/hooks/queries';

interface BaseTagSelectorProps {
  /** 選択されたタグ */
  value?: Tag[];
  /** 変更時のコールバック */
  onChange?: (tags: Tag[]) => void;
  /** ラベル */
  label?: string;
  /** プレースホルダー */
  placeholder?: string;
  /** 必須フラグ */
  required?: boolean;
  /** 読み取り専用フラグ */
  readOnly?: boolean;
  /** エラーフラグ */
  error?: boolean;
  /** エラーメッセージ */
  helperText?: string;
}

export type TagSelectorProps = BaseTagSelectorProps &
  Omit<
    AutocompleteProps<Tag, true, false, false>,
    'options' | 'renderInput' | 'renderTags' | 'onChange' | 'value'
  >;

/**
 * タグセレクタコンポーネント
 * Material-UI Autocomplete を使用した複数タグ選択
 */
export const TagSelector: React.FC<TagSelectorProps> = ({
  value = [],
  onChange,
  label,
  placeholder,
  required = false,
  readOnly = false,
  error = false,
  helperText,
  ...props
}) => {
  const { data: tags = [], isLoading } = useTags();

  const displayLabel = label || 'タグ';
  const displayPlaceholder = placeholder || 'タグを選択...';

  const memoTags = useMemo(() => tags, [tags]);

  return (
    <Autocomplete
      multiple
      options={memoTags}
      value={value}
      onChange={(_, newValue) => {
        onChange?.(newValue as Tag[]);
      }}
      disabled={readOnly || isLoading}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={displayLabel}
          placeholder={displayPlaceholder}
          required={required}
          error={error}
          helperText={helperText}
          disabled={readOnly}
        />
      )}
      renderTags={(tags, getTagProps) =>
        tags.map((tag, index) => (
          <Chip
            label={tag.name}
            color={tag.color}
            variant="outlined"
            {...getTagProps({ index })}
            disabled={readOnly}
          />
        ))
      }
      {...props}
    />
  );
};

export default TagSelector;

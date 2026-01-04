import React from 'react';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';
import { FormField } from '@/presentations/ui';

import { usePasswordVisibility } from './hooks';

import type { TextFieldProps } from '@mui/material/TextField';

/**
 * パスワード入力フィールド（表示切り替え機能付き）
 */
export const PasswordField: React.FC<TextFieldProps> = (props) => {
  const { t } = useTranslation();
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

  return (
    <FormField
      {...props}
      size="medium"
      label={t(tKeys.loginPage.form.password)}
      placeholder={t(tKeys.loginPage.form.passwordPlaceholder)}
      type={showPassword ? 'text' : 'password'}
      required
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="togglePasswordVisibility"
                onClick={togglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

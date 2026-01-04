import { useState } from 'react';

/**
 * パスワード表示切り替えのカスタムフック
 */
export const usePasswordVisibility = (initialVisible: boolean = false) => {
  const [showPassword, setShowPassword] = useState(initialVisible);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return {
    showPassword,
    togglePasswordVisibility,
  };
};

import { useTranslation } from 'react-i18next';
import { tKeys } from './tKeys';

/**
 * 型安全な翻訳フック
 */
export function useTypedTranslation() {
  const { t, i18n } = useTranslation();

  return {
    t,
    i18n,
    tKeys,
  };
}

import * as z from 'zod';

const LOCALE_LOADERS = {
  ja: () => import('zod/v4/locales/ja.js'),
  en: () => import('zod/v4/locales/en.js'),
};

type ZodLocale = keyof typeof LOCALE_LOADERS;

/**
 * 指定されたロケールのZodロケールを読み込む
 * @param locale - 読み込むロケール（例: 'ja', 'en'）
 */
export async function loadZodLocale(locale: string) {
  const code = toZodLocaleCode(locale);
  const loader = LOCALE_LOADERS[code];
  const { default: zodLocale } = await loader();
  z.config(zodLocale());
}

/**
 * 言語コードをZodのロケールコードに変換する
 * @param lng - 言語コード（例: 'ja', 'en', 'en-US'）
 * @returns Zodのロケールコード（'ja'または'en'）。対応しない場合は'ja'を返す。
 */
function toZodLocaleCode(lng: string): ZodLocale {
  switch (lng) {
    case 'ja':
      return 'ja';
    case 'en':
    case 'en-US':
      return 'en';
    default:
      return 'ja';
  }
}

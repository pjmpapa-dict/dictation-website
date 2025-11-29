import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 支持的語言列表
export const locales = ['zh-HK', 'zh-CN', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // 獲取請求的語言
  let locale = await requestLocale;

  // 驗證請求的語言是否支持
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'zh-HK'; // 默認語言
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

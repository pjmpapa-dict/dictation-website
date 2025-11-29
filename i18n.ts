import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 支持的語言列表
export const locales = ['zh-HK', 'zh-CN', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // 驗證請求的語言是否支持
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // 所有支持的語言
  locales,

  // 默認語言
  defaultLocale: 'zh-HK',

  // 語言檢測策略
  localeDetection: true,
});

export const config = {
  // 匹配所有路徑，除了 api、_next/static、_next/image、favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

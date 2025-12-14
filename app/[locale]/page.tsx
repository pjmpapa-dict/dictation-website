import { unstable_setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Enable static rendering
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            默書啦喂
          </h1>
          <div className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            網站維護中
          </div>
        </div>

        {/* Main Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              網站正在更新中
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              我們正在對網站進行優化和內容更新，<br />
              以為您提供更好的使用體驗。
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-500 mb-4">
              預計很快就會回來，感謝您的耐心等待！
            </p>
          </div>
        </div>

        {/* App Download */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-lg font-medium mb-3">
            App 仍然正常運作
          </p>
          <p className="text-blue-100 mb-4">
            您可以繼續使用「默書啦喂」App 進行學習
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://apps.apple.com/hk/app/默書啦喂/id6737578520"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors shadow-md"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          <p>© 2025 默書啦喂. 保留所有權利。</p>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useTranslations } from 'next-intl';

export default function Pricing() {
  const t = useTranslations('pricing');

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('free.name')}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-primary-500">{t('free.price')}</span>
              <span className="text-gray-600 ml-2">{t('free.period')}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {(t.raw('free.features') as string[]).map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <a href="#download" className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
              {t('free.cta')}
            </a>
          </div>

          {/* Personal Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-primary-500 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {t('personal.popular')}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('personal.name')}
            </h3>
            <div className="mb-2">
              <span className="text-4xl font-bold text-primary-500">{t('personal.price')}</span>
              <span className="text-gray-600 ml-2">{t('personal.period')}</span>
            </div>
            <div className="mb-6">
              <span className="text-sm text-gray-500">
                {t('personal.yearlyPrice')} {t('personal.yearlyPeriod')}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              {(t.raw('personal.features') as string[]).map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <a href="#download" className="block w-full text-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              {t('personal.cta')}
            </a>
          </div>

          {/* Family Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('family.name')}
            </h3>
            <div className="mb-2">
              <span className="text-4xl font-bold text-primary-500">{t('family.price')}</span>
              <span className="text-gray-600 ml-2">{t('family.period')}</span>
            </div>
            <div className="mb-6">
              <span className="text-sm text-gray-500">
                {t('family.yearlyPrice')} {t('family.yearlyPeriod')}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              {(t.raw('family.features') as string[]).map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <a href="#download" className="block w-full text-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              {t('family.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

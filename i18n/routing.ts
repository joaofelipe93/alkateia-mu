import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['br', 'en'],
  defaultLocale: 'br',
  localeDetection: false,
  localePrefix: 'never', // sem prefixo na URL, usa cookie
})

export const locales = ['en', 'es'] as const;
export const defaultLocale = 'en';

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same pathname, a
  // single external path can be provided.
  '/': '/',
  '/about': '/about',
  '/menu': '/menu',
  '/reservations': '/reservations',
  '/order-online': '/order-online',

  // If locales use different paths, you can
  // specify each external path per locale.
  // Example (Commented out as not needed for current structure):
  // '/about': {
  //   en: '/about',
  //   es: '/nosotros'
  // }
};

// Use the default: `always`
export const localePrefix = undefined;

export type AppPathnames = keyof typeof pathnames;

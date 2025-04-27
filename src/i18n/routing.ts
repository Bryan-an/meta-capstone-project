/**
 * List of supported locales in the application.
 * Using `as const` ensures type safety.
 */
export const locales = ['en', 'es'] as const;

/**
 * The default locale to use when no locale is specified or matched.
 */
export const defaultLocale = 'en';

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
/**
 * Defines mapping between internal route paths and potentially localized
 * external paths.
 *
 * @remarks
 * Currently, all paths are the same across locales.
 * If specific routes needed different paths per locale (e.g., `/about` vs `/nosotros`),
 * you would use the object syntax like:
 * ```ts
 * '/about': {
 *   en: '/about',
 *   es: '/nosotros'
 * }
 * ```
 */
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

/**
 * Configuration for the locale prefix in URLs.
 *
 * @remarks
 * `undefined` defaults to the `always` strategy in `next-intl`, meaning the locale
 * prefix (e.g., `/en`, `/es`) will always be present in the URL, even for the
 * default locale.
 * Other options include `as-needed` (prefix only for non-default locales) or
 * `never` (no prefix, requires careful domain/cookie setup).
 */
export const localePrefix = undefined;

/**
 * Type representing the keys of the `pathnames` object, used for type-safe
 * navigation.
 */
export type AppPathnames = keyof typeof pathnames;

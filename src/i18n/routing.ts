import { createNavigation } from 'next-intl/navigation';

/**
 * List of supported locales in the application.
 * Using `as const` ensures type safety.
 */
export const locales = ['en', 'es'] as const;

/**
 * The default locale to use when no locale is specified or matched.
 */
export const defaultLocale = 'en';

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
  '/about': {
    en: '/about',
    es: '/acerca-de',
  },
  '/menu': {
    en: '/menu',
    es: '/menu',
  },
  '/reservations': {
    en: '/reservations',
    es: '/reservaciones',
  },
  '/order-online': {
    en: '/order-online',
    es: '/pedir-en-linea',
  },
  '/login': {
    en: '/login',
    es: '/iniciar-sesion',
  },
  '/signup': {
    en: '/signup',
    es: '/registrarse',
  },
  '/auth/callback': {
    en: '/auth/callback',
    es: '/auth/callback',
  },
  '/auth/error': {
    en: '/auth/error',
    es: '/auth/error',
  },
  '/account': {
    en: '/account',
    es: '/cuenta',
  },
  '/reservations/new': {
    en: '/reservations/new',
    es: '/reservaciones/nueva',
  },
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
export const localePrefix = 'always';

/**
 * Type representing the keys of the `pathnames` object, used for type-safe
 * navigation.
 */
export type AppPathnames = keyof typeof pathnames;

/**
 * Creates configured navigation components and hooks for the application.
 *
 * @remarks
 * Exports `Link`, `redirect`, `usePathname`, `useRouter` pre-configured with
 * the application's locales, pathnames, and locale prefix strategy.
 * These should be imported and used throughout the application for
 * locale-aware navigation.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    defaultLocale,
    locales,
    localePrefix,
    pathnames,
  });

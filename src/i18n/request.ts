import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from './routing';

/**
 * Type representing the supported locale codes.
 */
type Locale = (typeof locales)[number];

/**
 * Asynchronously configures `next-intl` for each server request.
 *
 * @remarks
 * This function is invoked by `next-intl` to determine the locale for the
 * current request and load the corresponding translation messages.
 * It awaits the `requestLocale` provided by the middleware context.
 * If the requested locale is invalid or missing, it falls back to the
 * `defaultLocale`.
 * It dynamically imports the appropriate JSON message file based on the
 * determined locale.
 * If message loading fails, it triggers a 404 error using `notFound()`.
 *
 * The function receives an object containing `requestLocale` which is awaited.
 *
 * @returns A promise resolving to an object containing the determined `locale`
 *   and the loaded `messages`.
 * @throws Will call `notFound()` if message loading fails.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Determine the locale for the request, falling back to default if necessary
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  try {
    // Load messages for the determined locale
    const messages = (await import(`../../messages/${locale}.json`)).default;

    return {
      locale,
      messages,
    };
  } catch (error) {
    // Log error for debugging purposes on the server
    console.error(
      `[getRequestConfig] Failed to load messages for locale "${locale}":`, // Added quotes for clarity
      error,
    );

    // If messages cannot be loaded for a locale, trigger a 404
    notFound();
  }
});

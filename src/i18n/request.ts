import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from './routing';

console.log('[request.ts] File evaluated');

type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  console.log(
    `[request.ts] getRequestConfig invoked, awaited requestLocale: ${locale}`,
  );

  if (!locale || !locales.includes(locale as Locale)) {
    console.warn(
      `[request.ts] Invalid or undefined locale received: ${locale}. Falling back to default: ${defaultLocale}`,
    );
    locale = defaultLocale;
  }

  console.log(
    `[request.ts] Using locale: ${locale}. Attempting to load messages...`,
  );

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    console.log(`[request.ts] Loaded messages for: ${locale}`);
    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(
      `[request.ts] Failed to load messages for locale ${locale}:`,
      error,
    );
    notFound();
  }
});

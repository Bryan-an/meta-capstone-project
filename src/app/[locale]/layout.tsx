import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/routing';
import '@/app/globals.css';
import { Navbar } from '@/components/sections/navbar';
import { Footer } from '@/components/sections/footer';

const inter = Inter({ subsets: ['latin'] });

/**
 * Supported locales for the application.
 */
type Locale = (typeof locales)[number];

/**
 * Static metadata for the root layout.
 */
export const metadata: Metadata = {
  title: 'Little Lemon Restaurant',
  description: 'Reserve a table at Little Lemon',
  icons: {
    icon: '/favicon.ico',
  },
};

/**
 * Props for the RootLayout component.
 */
interface RootLayoutProps {
  /** The child elements to render within the layout. */
  children: ReactNode;
  /** The route parameters, expected to contain the locale. */
  params: Promise<{
    locale: string;
  }>;
}

/**
 * Root layout component for localized routes.
 *
 * @remarks
 * This asynchronous server component handles:
 * - Awaiting and validating the locale from route parameters.
 * - Setting the locale context for `next-intl` using `setRequestLocale`.
 * - Fetching locale-specific messages using `getMessages`.
 * - Wrapping children with `NextIntlClientProvider` to make messages available
 *   to client components.
 * - Setting the HTML lang attribute.
 *
 * @param props - The properties for the layout component.
 * @returns The rendered root layout element.
 */
export default async function RootLayout(props: RootLayoutProps) {
  const { children } = props;
  let locale: string;

  // Await and validate locale from params
  try {
    const params = await props.params;
    locale = params.locale;

    if (!locales.includes(locale as Locale)) {
      // Use a more specific error or log here if needed
      throw new Error(`Invalid locale: ${locale}`);
    }
  } catch (error) {
    // Log the error or handle it more gracefully if needed
    console.error('Error processing locale params:', error);
    notFound(); // Trigger 404 if locale is invalid or params fail
  }

  // Set request locale for static rendering and server component context
  setRequestLocale(locale);

  // Load messages for the validated locale
  let messages;

  try {
    messages = await getMessages();
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    // Decide if message loading failure should cause a 404 or render fallback
    notFound();
  }

  return (
    <html lang={locale}>
      {/*
       * suppressHydrationWarning is added to the body tag to prevent warnings
       * caused by browser extensions modifying the DOM before hydration.
       */}
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

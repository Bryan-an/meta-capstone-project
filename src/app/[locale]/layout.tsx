import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/routing';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

/**
 * Supported locales for the application.
 */
type Locale = (typeof locales)[number];

/**
 * Static metadata for the root layout.
 */
export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // TODO: Replace with actual domain
  title: 'Little Lemon Restaurant',
  description:
    'Reserve a table at Little Lemon. Delicious food and a great atmosphere.',
  keywords: [
    'restaurant',
    'food',
    'dining',
    'mediterranean',
    'chicago',
    'little lemon',
  ],
  authors: [{ name: 'Little Lemon Team', url: 'http://localhost:3000' }], // TODO: Replace with actual domain
  icons: {
    icon: '/favicon.ico',
    apple: '/images/apple-icon.png',
  },
  openGraph: {
    title: 'Little Lemon Restaurant - Book Your Table',
    description:
      'Experience authentic Mediterranean cuisine at Little Lemon. Reserve your table online!',
    url: 'http://localhost:3000', // TODO: Replace with actual domain
    siteName: 'Little Lemon Restaurant',
    images: [
      {
        url: '/images/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Little Lemon Restaurant Interior or Signature Dish',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Little Lemon Restaurant - Book Your Table',
    description:
      'Experience authentic Mediterranean cuisine at Little Lemon. Reserve your table online!',
    images: ['/images/opengraph-image.jpg'],
    creator: '@littlelemon',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'es-ES': '/es',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

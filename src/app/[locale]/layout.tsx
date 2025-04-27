import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import '../globals.css';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin'] });

// Define Locale type locally
type Locale = (typeof locales)[number];

export const metadata: Metadata = {
  title: 'Little Lemon Restaurant',
  description: 'Reserve a table at Little Lemon',
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function RootLayout(props: RootLayoutProps) {
  const { children } = props;
  const { locale } = await props.params;

  // Enable static rendering & provide context *before* validation
  // This might resolve the "await params" error by setting context earlier.
  setRequestLocale(locale);
  console.log(`[layout.tsx] Called setRequestLocale with: ${locale}`);

  // Re-enable validation
  if (!locales.includes(locale as Locale)) {
    console.error(`[layout.tsx] Invalid locale param: ${locale}`);
    notFound();
  }

  let messages;
  try {
    console.log(
      `[layout.tsx] Attempting getMessages (implicitly for locale set in request.ts)`,
    );
    messages = await getMessages();
    console.log(`[layout.tsx] Successfully got messages`);
  } catch (error) {
    console.error(`[layout.tsx] Error in getMessages:`, error);
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

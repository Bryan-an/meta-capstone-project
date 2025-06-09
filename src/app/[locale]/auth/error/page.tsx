'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Link } from '@/i18n/routing';

/**
 * Displays an authentication error page.
 *
 * This page is rendered when an authentication attempt fails. It retrieves error details
 * from URL search parameters (`error` and `message`).
 * - If `message` is present, it's displayed directly.
 * - If `message` is absent but `error` is present, it attempts to translate the `error`
 *   parameter as a key from the `AuthActions` translation namespace.
 * - If neither provides a message, a default error message from the `AuthErrorPage`
 *   translation namespace is shown.
 *
 * The component uses `next-intl` for internationalization and renders the error
 * using the Shadcn UI `Alert` component, styled destructively.
 * It also provides a link to navigate back to the login page.
 *
 * @returns A React component rendering the authentication error page.
 */
export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('AuthErrorPage');
  const tAuth = useTranslations('AuthActions');
  const errorParam = searchParams.get('error');
  const messageParam = searchParams.get('message');

  let displayMessage = messageParam;

  // If no messageParam, try to use errorParam as a key in AuthActions
  if (!displayMessage && errorParam) {
    try {
      // Attempt to translate the errorParam if it's a known key
      const translatedError = tAuth(errorParam);

      if (translatedError !== errorParam) {
        // Check if translation actually happened
        displayMessage = translatedError;
      }
    } catch {
      // If translation fails, it's not a known key, so stick with a generic message
    }
  }

  // Fallback to a generic message if nothing specific is found
  if (!displayMessage) {
    displayMessage = t('defaultErrorMessage');
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{t('title')}</AlertTitle>
          <AlertDescription>{displayMessage}</AlertDescription>
        </Alert>

        <div className="text-center">
          <Link href="/login" className="text-primary text-sm hover:underline">
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}

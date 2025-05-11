'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailPassword } from '@/app/auth/actions';
import type { FormState } from '@/types/actions';
import { LoaderSpinner } from '@/components/ui/loader-spinner';

const initialState: FormState = null;

/**
 * Renders the login page for user authentication.
 *
 * This client component provides a form for users to sign in using their email and password.
 * It utilizes the `signInWithEmailPassword` server action and `useActionState`
 * for form handling and displaying validation or submission errors.
 * On successful login, it redirects the user to the homepage.
 * Internationalization is handled by `next-intl`.
 * Shadcn UI components are used for styling.
 * The page is wrapped by `(auth)/layout.tsx` which provides centering and background.
 *
 * @returns A React component representing the login page.
 */
export default function LoginPage(): React.ReactElement {
  const t = useTranslations('LoginPage');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction] = useActionState(
    signInWithEmailPassword,
    initialState,
  );

  useEffect(() => {
    if (state?.type === 'success') {
      router.push('/');
    }
  }, [state, router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              required
            />

            {state?.fieldErrors?.email && (
              <p className="text-destructive text-xs">
                {state.fieldErrors.email.join(', ')}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                required
                className="pr-10"
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
                aria-label={
                  showPassword ? t('hidePassword') : t('showPassword')
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>

            {state?.fieldErrors?.password && (
              <p className="text-destructive text-xs">
                {state.fieldErrors.password.join(', ')}
              </p>
            )}
          </div>

          {state?.type === 'error' && !state.fieldErrors && (
            <Alert variant="destructive" className="mt-2">
              <Terminal className="h-4 w-4" />
              <AlertTitle>{tCommon('errorTitle')}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="mt-6 flex flex-col items-stretch">
          <SubmitButton text={t('submitButton')} />

          <p className="mt-4 text-center text-sm">
            {t('noAccountPrompt')}{' '}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              {t('signUpLink')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * Renders a submit button for the login form.
 *
 * This component displays a button that shows a loading spinner when the form
 * submission is pending. It uses `useFormStatus` to determine the pending state
 * and `next-intl` for the loading text.
 *
 * @param text - The text to display on the button when not pending.
 * @returns A React component representing the submit button.
 */
function SubmitButton({ text }: { text: string }): React.ReactElement {
  const { pending } = useFormStatus();
  const t = useTranslations('Common');

  return (
    <Button
      type="submit"
      className="w-full"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? <LoaderSpinner size="sm" loadingText={t('loading')} /> : text}
    </Button>
  );
}

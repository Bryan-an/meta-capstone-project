'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, Terminal } from 'lucide-react';
import { signUpWithEmailPassword } from '@/app/auth/actions';
import type { FormState } from '@/types/actions';
import { LoaderSpinner } from '@/components/ui/loader-spinner';

const initialState: FormState = null;

/**
 * Renders the sign-up page for new user registration.
 *
 * This client component provides a form for users to create an account using their
 * email and password. It includes password confirmation and uses the
 * `signUpWithEmailPassword` server action with `useActionState` for form handling.
 * Validation errors, success messages (prompting email verification), and general
 * errors are displayed.
 * Internationalization is handled by `next-intl`.
 * Shadcn UI components are used for styling.
 *
 * @returns A React component representing the sign-up page.
 */
export default function SignUpPage(): React.ReactElement {
  const t = useTranslations('SignUpPage');
  const tCommon = useTranslations('Common');
  const currentLocale = useLocale();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, formAction] = useActionState(
    signUpWithEmailPassword,
    initialState,
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Wrapper for formAction to include locale
  const formActionWithLocale = (payload: FormData) => {
    payload.append('locale', currentLocale);
    formAction(payload);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <form action={formActionWithLocale}>
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

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                required
                className="pr-10"
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={
                  showConfirmPassword
                    ? t('hideConfirmPassword')
                    : t('showConfirmPassword')
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>

            {state?.fieldErrors?.confirmPassword && (
              <p className="text-destructive text-xs">
                {state.fieldErrors.confirmPassword.join(', ')}
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

          {state?.type === 'success' && (
            <Alert variant="default" className="mt-2">
              <Terminal className="h-4 w-4" />
              <AlertTitle>{tCommon('successTitle')}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="mt-6 flex flex-col items-stretch">
          <SubmitButton text={t('submitButton')} />

          <p className="mt-4 text-center text-sm">
            {t('alreadyHaveAccountPrompt')}{' '}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              {t('loginLink')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * Renders a submit button for the sign-up form.
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

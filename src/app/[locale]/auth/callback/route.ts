import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

/**
 * Handles the GET request for Supabase authentication callbacks.
 *
 * This route handles two types of callbacks:
 * 1. OAuth (e.g., Google Sign-In): Uses a `code` query parameter.
 * 2. Email OTP verification: Uses `token_hash` and `type` query parameters.
 *
 * It exchanges the code or verifies the OTP token with Supabase and redirects
 * the user accordingly.
 *
 * Query Parameters for OAuth:
 * - `code`: The authorization code from the OAuth provider.
 * - `next` (optional): The path to redirect to upon successful login. Defaults to '/'.
 * - `locale` (optional): The locale for error messages. Defaults to 'en'.
 *
 * Query Parameters for Email OTP:
 * - `token_hash`: The OTP token hash from Supabase.
 * - `type`: The type of OTP (e.g., 'signup', 'recovery').
 * - `next` (optional): The path to redirect to upon successful verification. Defaults to '/'.
 * - `locale` (optional): The locale for error messages. Defaults to 'en'.
 *
 * On success, the user is redirected to the path specified by the `next` query parameter.
 * On failure, the user is redirected to the localized authentication error page
 * (`/[locale]/auth/error`) with relevant error information.
 *
 * @param request - The NextRequest object containing the incoming request details.
 * @param params - The route parameters, containing the `locale`.
 * @returns A NextResponse object, typically a redirect response.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  const routeLocale = (await params).locale;
  const queryLocale = searchParams.get('locale');
  const finalLocale = routeLocale || queryLocale || 'en';

  const supabase = await createClient();
  let errorOccurred = false;
  let specificErrorType = 'VerificationFailed'; // Default error type

  if (code) {
    // OAuth flow
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth code exchange error:', error);
      errorOccurred = true;
      specificErrorType = 'OAuthFailed';
    }
  } else if (token_hash && type) {
    // Email OTP flow
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error('OTP verification error:', error);
      errorOccurred = true;
    }
  } else {
    // Missing necessary parameters for either flow
    console.error('Callback called without code or token_hash/type.');
    errorOccurred = true;
    specificErrorType = 'MissingParameters';
  }

  if (!errorOccurred) {
    // Successfully authenticated or verified, redirect user
    // Ensure `next` is a relative path to prevent open redirect vulnerabilities.
    return NextResponse.redirect(new URL(next, request.url));
  }

  // If an error occurred, redirect to the auth error page
  const t = await getTranslations({
    locale: finalLocale,
    namespace: 'AuthActions',
  });

  const errorMessage = t('genericAuthError');
  const redirectUrl = new URL(`/${finalLocale}/auth/error`, request.url);

  redirectUrl.searchParams.set('error', specificErrorType);
  redirectUrl.searchParams.set('message', errorMessage);

  return NextResponse.redirect(redirectUrl);
}

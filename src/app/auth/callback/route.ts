import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

/**
 * Handles the GET request for Supabase email OTP verification.
 *
 * This route is typically used as the callback URL after a user clicks a
 * verification link sent to their email (e.g., for email confirmation or password reset).
 * It verifies the OTP token with Supabase and redirects the user accordingly.
 *
 * Query Parameters:
 * - `token_hash`: The OTP token hash from Supabase.
 * - `type`: The type of OTP (e.g., 'signup', 'recovery').
 * - `next` (optional): The path to redirect to upon successful verification. Defaults to '/'.
 * - `locale` (optional): The locale to use for any error messages. Defaults to 'en'.
 *
 * On successful verification, the user is redirected to the path specified by the `next`
 * query parameter.
 * On failure (e.g., invalid token, missing parameters), the user is redirected to the
 * localized authentication error page (`/[locale]/auth/error`) with relevant error
 * information in the query parameters.
 *
 * @param request - The NextRequest object containing the incoming request details.
 * @returns A NextResponse object, typically a redirect response.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  const locale = searchParams.get('locale') || 'en';

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Successfully verified, redirect user
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If verification fails or parameters are missing, redirect to the auth error page
  const t = await getTranslations({ locale, namespace: 'AuthActions' });
  const errorMessage = t('genericAuthError');
  const redirectUrl = new URL(`/${locale}/auth/error`, request.url);

  redirectUrl.searchParams.set('error', 'VerificationFailed');
  redirectUrl.searchParams.set('message', errorMessage);

  return NextResponse.redirect(redirectUrl);
}

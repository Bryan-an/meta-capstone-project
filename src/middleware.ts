import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import {
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
} from '@/i18n/routing';

/**
 * Root middleware function for the Next.js application.
 *
 * @remarks
 * This middleware chain handles Supabase session management first,
 * followed by internationalization (i18n) routing.
 *
 * @param request - The incoming Next.js request object.
 * @returns The response processed by the middleware chain.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  // 1. Handle Supabase session updates.
  // updateSession will check/refresh the session and return a NextResponse.
  const supabaseResponse = await updateSession(request);

  // 2. If Supabase decided to redirect (e.g., to a login page), honor that immediately.
  if (
    supabaseResponse.status === 307 || // Temporary Redirect
    supabaseResponse.status === 308 || // Permanent Redirect
    supabaseResponse.headers.get('Location') // Check if a redirect Location is set
  ) {
    return supabaseResponse;
  }

  // 3. If no redirect from Supabase, proceed with internationalization.
  const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix,
    pathnames,
  });

  // Apply the i18n middleware to the original request.
  const i18nResponse = intlMiddleware(request);

  // 4. Merge cookies from the Supabase response into the i18n response.
  // This ensures that any session cookies set or updated by Supabase are preserved.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    i18nResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return i18nResponse;
}

/**
 * Middleware configuration.
 *
 * @remarks
 * The `matcher` is configured to run the middleware on all paths except for:
 * - API routes (`/api/...`)
 * - Next.js internal static files (`/_next/static/...`)
 * - Next.js image optimization files (`/_next/image/...`)
 * - The favicon file (`/favicon.ico`)
 * - Any path containing a file extension (e.g., `.png`, `.css`)
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

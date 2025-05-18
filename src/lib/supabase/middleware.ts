import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from '@/i18n/routing';

/**
 * Define paths that require authentication.
 * @remarks
 * This is used to check if the user is authenticated before accessing the route.
 * If the user is not authenticated, they are redirected to the login page.
 * If the user is authenticated, they are allowed to access the route.
 */
const protectedPaths = ['/reservations'];

/**
 * Checks if the given pathname (without locale prefix) is a protected route.
 *
 * @param pathname - The pathname to check (e.g., "/reservations/new").
 * @returns True if the path is protected, false otherwise.
 */
function isPathProtected(pathname: string): boolean {
  return protectedPaths.some((protectedPath) =>
    pathname.startsWith(protectedPath),
  );
}

/**
 * Extracts the locale from the pathname or defaults to the defaultLocale.
 * e.g., "/en/dashboard" - "en"
 * e.g., "/dashboard" - "en" (if defaultLocale is 'en')
 * @param pathname - The full request pathname.
 * @returns The determined locale.
 */
function getLocaleFromPathname(pathname: string): string {
  const firstSegment = pathname.split('/')[1];

  if (locales.includes(firstSegment as (typeof locales)[number])) {
    return firstSegment;
  }

  return defaultLocale;
}

/**
 * Removes the locale prefix from a pathname if it exists.
 * e.g., "/en/dashboard" - "/dashboard"
 * e.g., "/dashboard" - "/dashboard"
 * @param pathname - The full request pathname.
 * @returns The pathname without the locale prefix.
 */
function stripLocaleFromPathname(pathname: string): string {
  const firstSegment = pathname.split('/')[1];

  if (locales.includes(firstSegment as (typeof locales)[number])) {
    return pathname.substring(pathname.indexOf('/', 1));
  }

  return pathname;
}

/**
 * Updates the user's session and handles route protection.
 * This function is designed to be called from Next.js middleware.
 *
 * It creates a Supabase client, attempts to refresh the session,
 * checks if the route is protected, and if so, verifies authentication.
 * Unauthenticated users accessing protected routes are redirected to the login page.
 *
 * @param request - The incoming NextRequest object.
 * @returns A NextResponse object, potentially a redirect or with updated session cookies.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Retrieves a cookie value by name.
         * @param name - The name of the cookie to retrieve.
         * @returns The cookie value or undefined if not found.
         */
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        /**
         * Sets a cookie.
         * Handles updating cookies on both the request (for subsequent operations
         * within the same request lifecycle) and the response (to send back to the client).
         * @param name - The name of the cookie.
         * @param value - The value of the cookie.
         * @param options - Cookie options (e.g., path, maxAge).
         */
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request and response cookies.
          request.cookies.set({
            name,
            value,
            ...options,
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        /**
         * Removes a cookie.
         * Handles removing cookies on both the request and the response by setting
         * an empty value and appropriate options.
         * @param name - The name of the cookie to remove.
         * @param options - Cookie options.
         */
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies.
          request.cookies.set({
            name,
            value: '',
            ...options,
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    },
  );

  // Refresh session if expired - `getUser()` will send a request to Supabase Auth
  // to check the validity of the session and refresh it if necessary.
  // The result of `getUser()` is not directly used here; its purpose is to trigger
  // the session refresh mechanism within the Supabase client, which handles cookie updates.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestPathname = request.nextUrl.pathname;
  const pathWithoutLocale = stripLocaleFromPathname(requestPathname);

  if (isPathProtected(pathWithoutLocale)) {
    if (!user) {
      const locale = getLocaleFromPathname(requestPathname);
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('next', requestPathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

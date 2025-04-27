import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Updates the user's session by handling cookies for Supabase authentication.
 *
 * This function is designed to be used in Next.js middleware (`middleware.ts`).
 * It creates a server-side Supabase client using the request cookies and then
 * attempts to refresh the session if necessary.
 *
 * @param request - The incoming Next.js request object.
 * @returns A Next.js response object, potentially with updated cookies.
 *
 * @see https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
 */
export async function updateSession(request: NextRequest) {
  // Create a response object based on the incoming request
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client configured for server-side rendering using cookies
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
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Create a new response object to ensure headers are copied correctly
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
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          // Create a new response object
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

  // Refresh session if expired - required for Server Components
  // This will handle session refresh for Server Components and Server Actions.
  // It also returns the session data, although it's not used directly here.
  await supabase.auth.getUser();

  // Return the potentially modified response object
  return response;
}

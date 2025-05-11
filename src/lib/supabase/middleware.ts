import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Updates the user's session by refreshing it if necessary.
 * This function is designed to be called from Next.js middleware.
 *
 * It creates a Supabase client configured for middleware, attempts to refresh
 * the session by calling `supabase.auth.getUser()`, and ensures that cookies
 * are correctly passed between the request and response to maintain session state.
 *
 * @param request - The incoming NextRequest object.
 * @returns A NextResponse object, potentially with updated session cookies.
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
  await supabase.auth.getUser();

  return response;
}

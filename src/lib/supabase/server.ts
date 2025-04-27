import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client instance specifically for use in server-side
 * environments within a Next.js application (Server Components, Route Handlers,
 * Server Actions).
 *
 * Utilizes `createServerClient` from `@supabase/ssr` and integrates with
 * Next.js's `cookies()` function to manage session persistence across requests.
 *
 * @remarks
 * This client relies on the Next.js `cookies` header store.
 * It includes cookie handling logic (`get`, `set`, `remove`) necessary for
 * the Supabase client to interact with the cookie store.
 * The `set` and `remove` operations include try-catch blocks because
 * Server Components cannot directly modify cookies; this task is delegated
 * to the middleware.
 *
 * Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * environment variables to be set.
 *
 * @returns A Supabase client instance configured for server-side operations.
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Create a server client with cookies to manage auth state
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Retrieves a cookie value from the Next.js cookie store.
         * @param name - The name of the cookie.
         * @returns The cookie's value or undefined if not found.
         */
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        /**
         * Attempts to set a cookie in the Next.js cookie store.
         * This might fail if called from a Server Component (expected behavior).
         * @param name - The name of the cookie.
         * @param value - The value to set.
         * @param options - Cookie options.
         */
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        /**
         * Attempts to remove a cookie by setting an empty value.
         * This might fail if called from a Server Component (expected behavior).
         * @param name - The name of the cookie.
         * @param options - Cookie options.
         */
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

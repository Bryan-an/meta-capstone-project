import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client instance for server-side environments.
 * This function is asynchronous to correctly await the cookie store.
 * It is designed to be used in Server Components, Server Actions, and Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

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
         * This might fail if called from a Server Component (expected behavior,
         * as middleware should handle session refresh).
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
            // console.warn('Supabase server client: Failed to set cookie in read-only context', { name });
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
            // Similar to set, ignoring errors in read-only contexts.
            // console.warn('Supabase server client: Failed to remove cookie in read-only context', { name });
          }
        },
      },
    },
  );
}

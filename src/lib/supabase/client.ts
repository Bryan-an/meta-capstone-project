import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client instance specifically for use in client-side
 * (browser) environments within a Next.js application.
 *
 * Utilizes the `createBrowserClient` from `@supabase/ssr` which handles
 * session management in the browser context.
 *
 * @remarks
 * This client should be used in Client Components (`'use client'`).
 * For server-side operations (Server Components, API Routes, Server Actions),
 * use the client created by `src/lib/supabase/server.ts` instead.
 *
 * Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * environment variables to be set.
 *
 * @returns A Supabase client instance configured for the browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

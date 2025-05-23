import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '../middleware';
import { createServerClient } from '@supabase/ssr';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr'],
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();

  return {
    ...actual,
    NextResponse: {
      next: vi.fn(),
      redirect: vi.fn(),
    },
  };
});

describe('Middleware Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  describe('Route Protection Logic', () => {
    it('should redirect unauthenticated users from protected routes', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };

      (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
        mockSupabaseClient,
      );

      const mockRequest = {
        nextUrl: { pathname: '/en/reservations/new' },
        url: 'https://example.com/en/reservations/new',
        headers: new Headers(),
        cookies: {
          get: vi.fn(),
          set: vi.fn(),
        },
      } as unknown as NextRequest;

      const mockRedirectResponse = { type: 'redirect' };

      (NextResponse.redirect as ReturnType<typeof vi.fn>).mockReturnValue(
        mockRedirectResponse,
      );

      const result = await updateSession(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/en/login',
          searchParams: expect.objectContaining({
            toString: expect.any(Function),
          }),
        }),
      );

      expect(result).toBeDefined();
    });

    it('should allow authenticated users to access protected routes', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      };

      (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
        mockSupabaseClient,
      );

      const mockRequest = {
        nextUrl: { pathname: '/en/reservations' },
        url: 'https://example.com/en/reservations',
        headers: new Headers(),
        cookies: {
          get: vi.fn(),
          set: vi.fn(),
        },
      } as unknown as NextRequest;

      const mockNextResponse = { type: 'next' };

      (NextResponse.next as ReturnType<typeof vi.fn>).mockReturnValue(
        mockNextResponse,
      );

      const result = await updateSession(mockRequest);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });

    it('should allow access to unprotected routes without authentication', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };

      (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
        mockSupabaseClient,
      );

      const mockRequest = {
        nextUrl: { pathname: '/en/about' },
        url: 'https://example.com/en/about',
        headers: new Headers(),
        cookies: {
          get: vi.fn(),
          set: vi.fn(),
        },
      } as unknown as NextRequest;

      const mockNextResponse = { type: 'next' };

      (NextResponse.next as ReturnType<typeof vi.fn>).mockReturnValue(
        mockNextResponse,
      );

      const result = await updateSession(mockRequest);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(result).toBe(mockNextResponse);
    });
  });

  describe('Locale Handling', () => {
    it('should handle different locale prefixes correctly', async () => {
      const testCases = [
        { path: '/es/reservations', expectedLocale: 'es' },
        { path: '/fr/reservations', expectedLocale: 'fr' },
        { path: '/en/reservations', expectedLocale: 'en' },
        { path: '/reservations', expectedLocale: 'en' },
      ];

      for (const testCase of testCases) {
        const mockSupabaseClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        };

        (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
          mockSupabaseClient,
        );

        const mockRequest = {
          nextUrl: { pathname: testCase.path },
          url: `https://example.com${testCase.path}`,
          headers: new Headers(),
          cookies: {
            get: vi.fn(),
            set: vi.fn(),
          },
        } as unknown as NextRequest;

        (NextResponse.redirect as ReturnType<typeof vi.fn>).mockClear();

        await updateSession(mockRequest);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: `/${testCase.expectedLocale}/login`,
          }),
        );
      }
    });
  });

  describe('Cookie Management', () => {
    it('should handle cookie operations correctly', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user' } },
            error: null,
          }),
        },
      };

      (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
        mockSupabaseClient,
      );

      const mockCookies = {
        get: vi.fn(),
        set: vi.fn(),
      };

      const mockRequest = {
        nextUrl: { pathname: '/en/home' },
        url: 'https://example.com/en/home',
        headers: new Headers(),
        cookies: mockCookies,
      } as unknown as NextRequest;

      const mockNextResponse = {
        cookies: {
          set: vi.fn(),
        },
      };

      (NextResponse.next as ReturnType<typeof vi.fn>).mockReturnValue(
        mockNextResponse,
      );

      await updateSession(mockRequest);

      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        }),
      );
    });
  });

  describe('Path Matching Logic', () => {
    it('should correctly identify protected paths', async () => {
      const protectedPaths = [
        '/en/reservations',
        '/es/reservations/new',
        '/fr/reservations/123/edit',
      ];

      const unprotectedPaths = [
        '/en/home',
        '/es/about',
        '/fr/menu',
        '/en/contact',
      ];

      for (const path of protectedPaths) {
        const mockSupabaseClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        };

        (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
          mockSupabaseClient,
        );

        const mockRequest = {
          nextUrl: { pathname: path },
          url: `https://example.com${path}`,
          headers: new Headers(),
          cookies: { get: vi.fn(), set: vi.fn() },
        } as unknown as NextRequest;

        (NextResponse.redirect as ReturnType<typeof vi.fn>).mockClear();

        await updateSession(mockRequest);

        expect(NextResponse.redirect).toHaveBeenCalled();
      }

      for (const path of unprotectedPaths) {
        const mockSupabaseClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        };

        (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
          mockSupabaseClient,
        );

        const mockRequest = {
          nextUrl: { pathname: path },
          url: `https://example.com${path}`,
          headers: new Headers(),
          cookies: { get: vi.fn(), set: vi.fn() },
        } as unknown as NextRequest;

        const mockNextResponse = { type: 'next' };

        (NextResponse.next as ReturnType<typeof vi.fn>).mockReturnValue(
          mockNextResponse,
        );

        (NextResponse.redirect as ReturnType<typeof vi.fn>).mockClear();

        const result = await updateSession(mockRequest);

        expect(NextResponse.redirect).not.toHaveBeenCalled();
        expect(result).toBe(mockNextResponse);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase auth errors gracefully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Auth error' },
          }),
        },
      };

      (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue(
        mockSupabaseClient,
      );

      const mockRequest = {
        nextUrl: { pathname: '/en/home' },
        url: 'https://example.com/en/home',
        headers: new Headers(),
        cookies: { get: vi.fn(), set: vi.fn() },
      } as unknown as NextRequest;

      const mockNextResponse = { type: 'next' };

      (NextResponse.next as ReturnType<typeof vi.fn>).mockReturnValue(
        mockNextResponse,
      );

      const result = await updateSession(mockRequest);
      expect(result).toBe(mockNextResponse);
    });
  });
});

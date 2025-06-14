import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { GET } from '../route';

// Mock the dependencies
vi.mock('@/lib/supabase/server');
vi.mock('next-intl/server');

// Import the mocked modules
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

// Type the mocked functions
const mockCreateClient = createClient as MockedFunction<typeof createClient>;

const mockGetTranslations = getTranslations as MockedFunction<
  typeof getTranslations
>;

/**
 * Creates a mock NextRequest with the specified URL and search parameters.
 * @param url - The base URL for the request.
 * @param searchParams - Object containing search parameters to add to the URL.
 * @returns A mocked NextRequest instance.
 */
function createMockRequest(
  url: string,
  searchParams: Record<string, string> = {},
): NextRequest {
  const fullUrl = new URL(url);

  Object.entries(searchParams).forEach(([key, value]) => {
    fullUrl.searchParams.set(key, value);
  });

  return {
    url: fullUrl.toString(),
  } as NextRequest;
}

/**
 * Creates mock route parameters with the specified locale.
 * @param locale - The locale string to include in params.
 * @returns A Promise resolving to route parameters.
 */
function createMockParams(locale: string): Promise<{ locale: string }> {
  return Promise.resolve({ locale });
}

describe('Auth Callback Route Handler', () => {
  // Mock Supabase client methods
  const mockExchangeCodeForSession = vi.fn();
  const mockVerifyOtp = vi.fn();

  const mockSupabaseClient = {
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      verifyOtp: mockVerifyOtp,
    },
  };

  // Mock translation function
  const mockTranslationFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockCreateClient.mockResolvedValue(mockSupabaseClient as never);
    mockGetTranslations.mockResolvedValue(mockTranslationFunction as never);
    mockTranslationFunction.mockReturnValue('Generic authentication error');

    // Mock NextResponse static methods
    vi.spyOn(NextResponse, 'redirect').mockImplementation((url) => {
      return {
        url: url.toString(),
        type: 'redirect',
      } as unknown as NextResponse;
    });
  });

  describe('OAuth Flow', () => {
    it('should successfully handle OAuth callback with code', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'oauth_code_123',
        next: '/dashboard',
      });

      const params = createMockParams('en');

      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const response = await GET(request, { params });

      expect(mockCreateClient).toHaveBeenCalledOnce();
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('oauth_code_123');

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/dashboard', request.url),
      );

      expect(response.type).toBe('redirect');
    });

    it('should redirect to root when no next parameter is provided', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'oauth_code_123',
      });

      const params = createMockParams('en');

      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      await GET(request, { params });

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/', request.url),
      );
    });

    it('should handle OAuth failure and redirect to error page', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'invalid_code',
        next: '/dashboard',
      });

      const params = createMockParams('en');

      const authError = new Error('Invalid code');
      mockExchangeCodeForSession.mockResolvedValue({ error: authError });
      mockTranslationFunction.mockReturnValue('OAuth authentication failed');

      await GET(request, { params });

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('invalid_code');

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'AuthActions',
      });

      const redirectUrl = new URL('/en/auth/error', request.url);
      redirectUrl.searchParams.set('error', 'OAuthFailed');
      redirectUrl.searchParams.set('message', 'OAuth authentication failed');

      expect(NextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });
  });

  describe('Email OTP Flow', () => {
    it('should successfully handle email OTP verification', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        token_hash: 'email_otp_hash_123',
        type: 'signup',
        next: '/welcome',
      });

      const params = createMockParams('es');

      mockVerifyOtp.mockResolvedValue({ error: null });

      await GET(request, { params });

      expect(mockCreateClient).toHaveBeenCalledOnce();

      expect(mockVerifyOtp).toHaveBeenCalledWith({
        type: 'signup',
        token_hash: 'email_otp_hash_123',
      });

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/welcome', request.url),
      );
    });

    it('should handle different OTP types', async () => {
      const otpTypes: EmailOtpType[] = [
        'signup',
        'recovery',
        'email_change',
        'email',
      ];

      for (const type of otpTypes) {
        const request = createMockRequest('https://example.com/auth/callback', {
          token_hash: `otp_hash_${type}`,
          type,
        });

        const params = createMockParams('en');

        mockVerifyOtp.mockResolvedValue({ error: null });

        await GET(request, { params });

        expect(mockVerifyOtp).toHaveBeenCalledWith({
          type,
          token_hash: `otp_hash_${type}`,
        });
      }
    });

    it('should handle OTP verification failure', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        token_hash: 'invalid_hash',
        type: 'signup',
      });

      const params = createMockParams('fr');

      const otpError = new Error('Invalid OTP token');
      mockVerifyOtp.mockResolvedValue({ error: otpError });
      mockTranslationFunction.mockReturnValue('Token de vérification invalido');

      await GET(request, { params });

      expect(mockVerifyOtp).toHaveBeenCalledWith({
        type: 'signup',
        token_hash: 'invalid_hash',
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'fr',
        namespace: 'AuthActions',
      });

      const redirectUrl = new URL('/fr/auth/error', request.url);
      redirectUrl.searchParams.set('error', 'VerificationFailed');
      redirectUrl.searchParams.set('message', 'Token de vérification invalido');

      expect(NextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing parameters', async () => {
      const request = createMockRequest('https://example.com/auth/callback');
      const params = createMockParams('en');

      mockTranslationFunction.mockReturnValue(
        'Missing authentication parameters',
      );

      await GET(request, { params });

      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
      expect(mockVerifyOtp).not.toHaveBeenCalled();

      const redirectUrl = new URL('/en/auth/error', request.url);
      redirectUrl.searchParams.set('error', 'MissingParameters');

      redirectUrl.searchParams.set(
        'message',
        'Missing authentication parameters',
      );

      expect(NextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });

    it('should handle partial OTP parameters (missing type)', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        token_hash: 'some_hash',
        // Missing 'type' parameter
      });

      const params = createMockParams('en');

      await GET(request, { params });

      expect(mockVerifyOtp).not.toHaveBeenCalled();

      const redirectUrl = new URL('/en/auth/error', request.url);
      redirectUrl.searchParams.set('error', 'MissingParameters');
      redirectUrl.searchParams.set('message', 'Generic authentication error');

      expect(NextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });

    it('should handle partial OTP parameters (missing token_hash)', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        type: 'signup',
        // Missing 'token_hash' parameter
      });

      const params = createMockParams('en');

      await GET(request, { params });

      expect(mockVerifyOtp).not.toHaveBeenCalled();

      const redirectUrl = new URL('/en/auth/error', request.url);
      redirectUrl.searchParams.set('error', 'MissingParameters');
      redirectUrl.searchParams.set('message', 'Generic authentication error');

      expect(NextResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });
  });

  describe('Locale Handling', () => {
    it('should use route locale when available', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'test_code',
      });

      const params = createMockParams('es');

      mockExchangeCodeForSession.mockResolvedValue({
        error: new Error('Test error'),
      });

      await GET(request, { params });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'es',
        namespace: 'AuthActions',
      });
    });

    it('should use query locale when route locale is not available', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'test_code',
        locale: 'fr',
      });

      const params = createMockParams('');

      mockExchangeCodeForSession.mockResolvedValue({
        error: new Error('Test error'),
      });

      await GET(request, { params });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'fr',
        namespace: 'AuthActions',
      });
    });

    it('should default to "en" when no locale is provided', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'test_code',
      });

      const params = createMockParams('');

      mockExchangeCodeForSession.mockResolvedValue({
        error: new Error('Test error'),
      });

      await GET(request, { params });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'AuthActions',
      });
    });

    it('should prioritize route locale over query locale', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'test_code',
        locale: 'fr', // Query locale
      });

      const params = createMockParams('es'); // Route locale

      mockExchangeCodeForSession.mockResolvedValue({
        error: new Error('Test error'),
      });

      await GET(request, { params });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'es', // Should use route locale, not query locale
        namespace: 'AuthActions',
      });
    });
  });

  describe('Security Considerations', () => {
    it('should handle relative redirect paths safely', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'valid_code',
        next: '/secure/dashboard',
      });

      const params = createMockParams('en');

      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      await GET(request, { params });

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/secure/dashboard', request.url),
      );
    });

    it('should prevent open redirect vulnerabilities', async () => {
      const request = createMockRequest('https://example.com/auth/callback', {
        code: 'valid_code',
        next: 'https://malicious-site.com',
      });

      const params = createMockParams('en');

      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      await GET(request, { params });

      // The new URL constructor with base URL should prevent external redirects
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('https://malicious-site.com', request.url),
      );
    });
  });
});

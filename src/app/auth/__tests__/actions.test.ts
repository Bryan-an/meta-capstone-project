import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations, getLocale } from 'next-intl/server';
import {
  signUpWithEmailPassword,
  signInWithEmailPassword,
  signOut,
} from '../actions';
import type { FormState } from '@/types/actions';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
  getLocale: vi.fn(),
}));

vi.mock('@/lib/utils/validation', () => ({
  processZodErrors: vi.fn(),
}));

const { processZodErrors } = await import('@/lib/utils/validation');

describe('Auth Actions', () => {
  let mockSupabaseClient: {
    auth: {
      signUp: ReturnType<typeof vi.fn>;
      signInWithPassword: ReturnType<typeof vi.fn>;
      signOut: ReturnType<typeof vi.fn>;
    };
  };

  let mockTranslator: (key: string, values?: Record<string, unknown>) => string;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    mockTranslator = vi.fn((key: string, values?: Record<string, unknown>) => {
      const messages: Record<string, string> = {
        signUpError: 'Sign up failed',
        emailConfirmationMessage:
          'Please check your email to confirm your account',
        signInError: 'Sign in failed',
        signOutError: values
          ? `Sign out failed: ${values.errorMessage}`
          : 'Sign out failed',
        invalidEmail: 'Invalid email address',
        passwordTooShort: 'Password must be at least 6 characters',
        passwordRequired: 'Password is required',
        requiredFields: 'This field is required',
        passwordNoMatch: 'Passwords do not match',
      };

      return messages[key] || key;
    });

    (getTranslations as Mock).mockResolvedValue(mockTranslator);
    (getLocale as Mock).mockResolvedValue('en');

    mockSupabaseClient = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
    };

    (createClient as Mock).mockResolvedValue(mockSupabaseClient);
    (processZodErrors as Mock).mockReturnValue(null);
  });

  describe('signUpWithEmailPassword', () => {
    it('should successfully sign up a user with valid data', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');
      formData.set('confirmPassword', 'password123');

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      const result = await signUpWithEmailPassword(null, formData);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'https://example.com/en/auth/callback',
        },
      });

      expect(revalidatePath).toHaveBeenCalledWith('/');

      expect(result).toEqual({
        message: 'Please check your email to confirm your account',
        type: 'success',
        timestamp: expect.any(Number),
      });
    });

    it('should return validation error when passwords do not match', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');
      formData.set('confirmPassword', 'different');

      const mockValidationError: FormState = {
        type: 'error',
        message: 'Passwords do not match',
        fieldErrors: {
          confirmPassword: ['Passwords do not match'],
        },
        timestamp: Date.now(),
      };

      (processZodErrors as Mock).mockReturnValue(mockValidationError);

      const result = await signUpWithEmailPassword(null, formData);

      expect(result).toBe(mockValidationError);
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid email', async () => {
      const formData = new FormData();
      formData.set('email', 'invalid-email');
      formData.set('password', 'password123');
      formData.set('confirmPassword', 'password123');

      const mockValidationError: FormState = {
        type: 'error',
        message: 'Invalid email address',
        fieldErrors: {
          email: ['Invalid email address'],
        },
        timestamp: Date.now(),
      };

      (processZodErrors as Mock).mockReturnValue(mockValidationError);

      const result = await signUpWithEmailPassword(null, formData);

      expect(result).toBe(mockValidationError);
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it('should return validation error for short password', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', '123');
      formData.set('confirmPassword', '123');

      const mockValidationError: FormState = {
        type: 'error',
        message: 'Password must be at least 6 characters',
        fieldErrors: {
          password: ['Password must be at least 6 characters'],
        },
        timestamp: Date.now(),
      };

      (processZodErrors as Mock).mockReturnValue(mockValidationError);

      const result = await signUpWithEmailPassword(null, formData);

      expect(result).toBe(mockValidationError);
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it('should handle Supabase sign up error', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');
      formData.set('confirmPassword', 'password123');

      const supabaseError = new Error('Email already registered');

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      const result = await signUpWithEmailPassword(null, formData);

      expect(result).toEqual({
        message: 'Email already registered',
        type: 'error',
        timestamp: expect.any(Number),
      });

      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should handle Supabase error without message', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');
      formData.set('confirmPassword', 'password123');

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: {},
      });

      const result = await signUpWithEmailPassword(null, formData);

      expect(result).toEqual({
        message: 'Sign up failed',
        type: 'error',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('signInWithEmailPassword', () => {
    it('should successfully sign in a user with valid credentials', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      await expect(signInWithEmailPassword(null, formData)).rejects.toThrow();

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('should redirect to custom next path after successful sign in', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');
      formData.set('next', '/dashboard');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      await expect(signInWithEmailPassword(null, formData)).rejects.toThrow();

      expect(redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should return validation error for missing password', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', '');

      const mockValidationError: FormState = {
        type: 'error',
        message: 'Password is required',
        fieldErrors: {
          password: ['Password is required'],
        },
        timestamp: Date.now(),
      };

      (processZodErrors as Mock).mockReturnValue(mockValidationError);

      const result = await signInWithEmailPassword(null, formData);

      expect(result).toBe(mockValidationError);
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should handle Supabase sign in error', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'wrongpassword');

      const supabaseError = new Error('Invalid credentials');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      const result = await signInWithEmailPassword(null, formData);

      expect(result).toEqual({
        message: 'Invalid credentials',
        type: 'error',
        timestamp: expect.any(Number),
      });

      expect(revalidatePath).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should handle Supabase error without message', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: {},
      });

      const result = await signInWithEmailPassword(null, formData);

      expect(result).toEqual({
        message: 'Sign in failed',
        type: 'error',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(signOut()).rejects.toThrow();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/en/login');
    });

    it('should handle sign out error and redirect to error page', async () => {
      const supabaseError = new Error('Network error');

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: supabaseError,
      });

      await expect(signOut()).rejects.toThrow();

      expect(redirect).toHaveBeenCalledWith(
        '/en/auth/error?error=signOutError&message=Network%20error',
      );
    });

    it('should work with different locales', async () => {
      (getLocale as Mock).mockResolvedValue('es');

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(signOut()).rejects.toThrow();

      expect(redirect).toHaveBeenCalledWith('/es/login');
    });
  });

  describe('FormData edge cases', () => {
    it('should handle missing form fields gracefully', async () => {
      const formData = new FormData();

      const mockValidationError: FormState = {
        type: 'error',
        message: 'This field is required',
        fieldErrors: {
          email: ['This field is required'],
          password: ['This field is required'],
        },
        timestamp: Date.now(),
      };

      (processZodErrors as Mock).mockReturnValue(mockValidationError);

      const result = await signUpWithEmailPassword(null, formData);

      expect(result).toBe(mockValidationError);
    });

    it('should handle empty string values', async () => {
      const formData = new FormData();
      formData.set('email', '');
      formData.set('password', '');
      formData.set('confirmPassword', '');

      const mockValidationError: FormState = {
        type: 'error',
        message: 'This field is required',
        fieldErrors: {
          email: ['This field is required'],
          password: ['This field is required'],
        },
        timestamp: Date.now(),
      };

      (processZodErrors as Mock).mockReturnValue(mockValidationError);

      const result = await signUpWithEmailPassword(null, formData);

      expect(result).toBe(mockValidationError);
    });
  });

  describe('Environment configuration', () => {
    it('should use correct redirect URL based on environment', async () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.example.com';

      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');
      formData.set('confirmPassword', 'password123');

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      await signUpWithEmailPassword(null, formData);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'https://staging.example.com/en/auth/callback',
        },
      });
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LoginPage from '../page';
import { signInWithEmailPassword } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/client';
import type { FormState } from '@/types/actions';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/auth/actions', () => ({
  signInWithEmailPassword: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/components/icons/google-icon', () => ({
  GoogleIcon: () => (
    <svg data-testid="google-icon">
      <title>Google Icon</title>
    </svg>
  ),
}));

describe('LoginPage', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  const mockSearchParams = {
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    toString: vi.fn(),
  };

  const mockSupabaseClient = {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );

    vi.mocked(useLocale).mockReturnValue('en');

    const mockT = vi.fn((key: string) => {
      const translations: Record<string, string> = {
        title: 'Login',
        description: 'Enter your email below to login to your account',
        emailLabel: 'Email',
        emailPlaceholder: 'm@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        orContinueWith: 'Or continue with',
        signInWithGoogleButton: 'Sign in with Google',
        submitButton: 'Sign in',
        noAccountPrompt: "Don't have an account?",
        signUpLink: 'Sign up',
        invalidCredentials: 'Invalid email or password',
        unexpectedError: 'An unexpected error occurred. Please try again.',
      };

      return translations[key] || key;
    });

    vi.mocked(useTranslations).mockReturnValue(
      mockT as unknown as ReturnType<typeof useTranslations>,
    );

    vi.mocked(createClient).mockReturnValue(
      mockSupabaseClient as unknown as ReturnType<typeof createClient>,
    );

    vi.mocked(signInWithEmailPassword).mockResolvedValue(null);
  });

  describe('Rendering', () => {
    it('should render the login form', () => {
      render(<LoginPage />);

      expect(screen.getByText('Login')).toBeInTheDocument();

      expect(
        screen.getByText('Enter your email below to login to your account'),
      ).toBeInTheDocument();

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: 'Sign in' }),
      ).toBeInTheDocument();
    });

    it('should render Google sign-in button', () => {
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', {
        name: 'Google Icon Sign in with Google',
      });

      expect(googleButton).toBeInTheDocument();
      expect(screen.getByTestId('google-icon')).toBeInTheDocument();
    });

    it('should render sign-up link', () => {
      render(<LoginPage />);

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    });

    it('should have proper form inputs with correct attributes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('required');

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Form Interactions', () => {
    it('should allow typing in email and password fields', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText('Password');

      const toggleButton = screen.getByRole('button', {
        name: 'Show password',
      });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should submit form with email and password', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailPassword).toHaveBeenCalled();
      });
    });
  });

  describe('Google OAuth', () => {
    it('should handle Google sign-in', async () => {
      const user = userEvent.setup();

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth-url.com' },
        error: null,
      });

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', {
        name: 'Google Icon Sign in with Google',
      });

      await user.click(googleButton);

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login fails', async () => {
      const user = userEvent.setup();

      const errorState: FormState = {
        type: 'error',
        message: 'Invalid email or password',
      };

      vi.mocked(signInWithEmailPassword).mockResolvedValue(errorState);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid email or password'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Internationalization', () => {
    it('should use Spanish translations when locale is es', () => {
      const mockSpanishT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          title: 'Iniciar Sesión',
          description: 'Ingresa tu email para iniciar sesión',
          emailLabel: 'Correo Electrónico',
          passwordLabel: 'Contraseña',
          signInButton: 'Iniciar Sesión',
        };

        return translations[key] || key;
      });

      vi.mocked(useLocale).mockReturnValue('es');

      vi.mocked(useTranslations).mockReturnValue(
        mockSpanishT as unknown as ReturnType<typeof useTranslations>,
      );

      render(<LoginPage />);

      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();

      expect(
        screen.getByText('Ingresa tu email para iniciar sesión'),
      ).toBeInTheDocument();

      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LoginPage />);

      const passwordToggle = screen.getByRole('button', {
        name: 'Show password',
      });

      expect(passwordToggle).toHaveAttribute('aria-label', 'Show password');
    });

    it('should associate labels with inputs', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      const { container } = render(<LoginPage />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('action');
    });
  });
});

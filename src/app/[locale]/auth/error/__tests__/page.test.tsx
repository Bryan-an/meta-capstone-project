import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AuthErrorPage from '../page';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
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

vi.mock('@/components/ui/alert', () => ({
  Alert: ({
    children,
    variant,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    variant?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="alert"
      data-variant={variant}
      className={className}
      role="alert"
      {...props}
    >
      {children}
    </div>
  ),
  AlertTitle: ({
    children,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="alert-title" className={className} {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({
    children,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="alert-description" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Terminal: ({
    className,
    ...props
  }: {
    className?: string;
    [key: string]: unknown;
  }) => (
    <svg
      data-testid="terminal-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Terminal icon"
    >
      <title>Terminal</title>
    </svg>
  ),
}));

describe('AuthErrorPage', () => {
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

  // Mock translation functions
  const mockAuthErrorPageT = vi.fn();
  const mockAuthActionsT = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup search params mock
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>,
    );

    // Setup translations mock
    vi.mocked(useTranslations).mockImplementation((namespace?: string) => {
      if (namespace === 'AuthErrorPage') {
        return mockAuthErrorPageT as unknown as ReturnType<
          typeof useTranslations
        >;
      }

      if (namespace === 'AuthActions') {
        return mockAuthActionsT as unknown as ReturnType<
          typeof useTranslations
        >;
      }

      return vi.fn() as unknown as ReturnType<typeof useTranslations>;
    });

    // Setup default translation values
    mockAuthErrorPageT.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        title: 'Authentication Error',
        defaultErrorMessage: 'An error occurred during authentication',
        backToLogin: 'Back to login',
      };

      return translations[key] || key;
    });

    mockAuthActionsT.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        invalidCredentials: 'Invalid email or password',
        userNotFound: 'User not found',
        sessionExpired: 'Session expired',
      };

      return translations[key] || key;
    });

    // Default search params behavior
    mockSearchParams.get.mockReturnValue(null);
  });

  describe('Component Structure', () => {
    it('should render the basic page structure', () => {
      render(<AuthErrorPage />);

      // Check main container
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Check alert structure
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-title')).toBeInTheDocument();
      expect(screen.getByTestId('alert-description')).toBeInTheDocument();

      // Check terminal icon
      expect(screen.getByTestId('terminal-icon')).toBeInTheDocument();

      // Check back to login link
      const backLink = screen.getByRole('link', { name: 'Back to login' });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/login');
    });

    it('should render with destructive alert variant', () => {
      render(<AuthErrorPage />);

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('data-variant', 'destructive');
    });

    it('should have proper CSS classes and layout', () => {
      render(<AuthErrorPage />);

      // Check main container classes - need to find the actual main container
      const mainContainer = screen.getByRole('alert').closest('.bg-background');

      expect(mainContainer).toHaveClass(
        'bg-background',
        'flex',
        'min-h-screen',
        'flex-col',
        'items-center',
        'justify-center',
        'p-4',
      );

      // Check alert wrapper classes
      const alertWrapper = screen.getByTestId('alert').parentElement;
      expect(alertWrapper).toHaveClass('w-full', 'max-w-md');
    });
  });

  describe('Translation Handling', () => {
    it('should call useTranslations with correct namespaces', () => {
      render(<AuthErrorPage />);

      expect(useTranslations).toHaveBeenCalledWith('AuthErrorPage');
      expect(useTranslations).toHaveBeenCalledWith('AuthActions');
    });

    it('should render translated title', () => {
      mockAuthErrorPageT.mockImplementation((key: string) => {
        if (key === 'title') return 'Custom Error Title';
        return key;
      });

      render(<AuthErrorPage />);

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('should render translated back to login link', () => {
      mockAuthErrorPageT.mockImplementation((key: string) => {
        if (key === 'backToLogin') return 'Return to Sign In';
        return key;
      });

      render(<AuthErrorPage />);

      expect(screen.getByText('Return to Sign In')).toBeInTheDocument();
    });
  });

  describe('Error Message Handling', () => {
    it('should display message from search params when provided', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'message') return 'Custom error message from URL';
        return null;
      });

      render(<AuthErrorPage />);

      expect(
        screen.getByText('Custom error message from URL'),
      ).toBeInTheDocument();
    });

    it('should display translated error from AuthActions when error param matches a key', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'error') return 'invalidCredentials';
        return null;
      });

      mockAuthActionsT.mockImplementation((key: string) => {
        if (key === 'invalidCredentials') return 'Invalid email or password';
        return key;
      });

      render(<AuthErrorPage />);

      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    it('should prioritize message param over error param', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'message') return 'Message from URL';
        if (key === 'error') return 'invalidCredentials';
        return null;
      });

      render(<AuthErrorPage />);

      expect(screen.getByText('Message from URL')).toBeInTheDocument();

      expect(
        screen.queryByText('Invalid email or password'),
      ).not.toBeInTheDocument();
    });

    it('should display default error message when no params provided', () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<AuthErrorPage />);

      expect(
        screen.getByText('An error occurred during authentication'),
      ).toBeInTheDocument();
    });

    it('should display default error message when error param is not a valid translation key', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'error') return 'unknownErrorKey';
        return null;
      });

      // Mock AuthActions translation to return the key itself (indicating no translation)
      mockAuthActionsT.mockImplementation((key: string) => key);

      render(<AuthErrorPage />);

      expect(
        screen.getByText('An error occurred during authentication'),
      ).toBeInTheDocument();
    });

    it('should handle edge cases with empty strings', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'message') return '';
        if (key === 'error') return 'validError';
        return null;
      });

      mockAuthActionsT.mockImplementation((key: string) => {
        if (key === 'validError') return 'Valid error message';
        return key;
      });

      render(<AuthErrorPage />);

      // Since message is empty string (falsy), should use error param
      expect(screen.getByText('Valid error message')).toBeInTheDocument();
    });
  });

  describe('URL Search Params Integration', () => {
    it('should call searchParams.get with correct parameters', () => {
      render(<AuthErrorPage />);

      expect(mockSearchParams.get).toHaveBeenCalledWith('error');
      expect(mockSearchParams.get).toHaveBeenCalledWith('message');
    });

    it('should handle multiple calls to searchParams.get', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'message') return 'Test message';
        if (key === 'error') return 'testError';
        return null;
      });

      render(<AuthErrorPage />);

      expect(mockSearchParams.get).toHaveBeenCalledTimes(2);
    });

    it('should work with various URL parameter combinations', () => {
      const testCases = [
        {
          message: 'Direct message',
          error: null,
          expected: 'Direct message',
        },
        {
          message: null,
          error: 'invalidCredentials',
          expected: 'Invalid email or password',
        },
        {
          message: null,
          error: null,
          expected: 'An error occurred during authentication',
        },
        {
          message: 'Priority message',
          error: 'invalidCredentials',
          expected: 'Priority message',
        },
      ];

      testCases.forEach(({ message, error, expected }) => {
        vi.clearAllMocks();

        mockSearchParams.get.mockImplementation((key: string) => {
          if (key === 'message') return message;
          if (key === 'error') return error;
          return null;
        });

        const { unmount } = render(<AuthErrorPage />);

        expect(screen.getByText(expected)).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Error Translation Logic', () => {
    it('should handle case when translation function throws an error', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'error') return 'problematicKey';
        return null;
      });

      // Mock translation to throw an error
      mockAuthActionsT.mockImplementation((key: string) => {
        if (key === 'problematicKey') {
          throw new Error('Translation error');
        }

        return key;
      });

      render(<AuthErrorPage />);

      // Should fall back to default message
      expect(
        screen.getByText('An error occurred during authentication'),
      ).toBeInTheDocument();
    });

    it('should detect when translation actually occurred vs returning the key', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'error') return 'untranslatedKey';
        return null;
      });

      // Mock to return the same key (no translation)
      mockAuthActionsT.mockImplementation((key: string) => key);

      render(<AuthErrorPage />);

      // Should use default message since translation didn't change the key
      expect(
        screen.getByText('An error occurred during authentication'),
      ).toBeInTheDocument();
    });

    it('should properly detect successful translation', () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'error') return 'sessionExpired';
        return null;
      });

      mockAuthActionsT.mockImplementation((key: string) => {
        if (key === 'sessionExpired') return 'Your session has expired';
        return key;
      });

      render(<AuthErrorPage />);

      expect(screen.getByText('Your session has expired')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles and attributes', () => {
      render(<AuthErrorPage />);

      // Check alert role
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();

      // Check link accessibility
      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName('Back to login');
    });

    it('should have proper icon accessibility', () => {
      render(<AuthErrorPage />);

      const icon = screen.getByTestId('terminal-icon');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).toHaveAttribute('aria-label', 'Terminal icon');
    });

    it('should maintain focus management', () => {
      render(<AuthErrorPage />);

      const link = screen.getByRole('link');
      expect(link).toBeVisible();
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Component Integration', () => {
    it('should properly integrate with Alert component props', () => {
      render(<AuthErrorPage />);

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('data-variant', 'destructive');
      expect(alert).toHaveClass('mb-6');
    });

    it('should properly integrate with Link component', () => {
      render(<AuthErrorPage />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/login');
      expect(link).toHaveClass('text-primary', 'text-sm', 'hover:underline');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle useSearchParams returning null gracefully', () => {
      // Mock useSearchParams to return a mock object with get method that returns null
      const nullSearchParams = {
        get: vi.fn().mockReturnValue(null),
        getAll: vi.fn(),
        has: vi.fn(),
        keys: vi.fn(),
        values: vi.fn(),
        entries: vi.fn(),
        forEach: vi.fn(),
        toString: vi.fn(),
      };

      vi.mocked(useSearchParams).mockReturnValue(
        nullSearchParams as unknown as ReturnType<typeof useSearchParams>,
      );

      expect(() => render(<AuthErrorPage />)).not.toThrow();
    });

    it('should handle translation functions returning undefined', () => {
      mockAuthErrorPageT.mockReturnValue(undefined as never);
      mockAuthActionsT.mockReturnValue(undefined as never);

      expect(() => render(<AuthErrorPage />)).not.toThrow();
    });

    it('should handle extremely long error messages', () => {
      const longMessage = 'A'.repeat(1000);

      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'message') return longMessage;
        return null;
      });

      render(<AuthErrorPage />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in error messages', () => {
      const specialMessage =
        'Error with <script>alert("xss")</script> & symbols';

      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'message') return specialMessage;
        return null;
      });

      render(<AuthErrorPage />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });
});

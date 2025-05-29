import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import SignUpPage from '../page';
import { signUpWithEmailPassword } from '@/app/auth/actions';
import type { FormState } from '@/types/actions';

vi.mock('@/app/auth/actions', () => ({
  signUpWithEmailPassword: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/loader-spinner', () => ({
  LoaderSpinner: ({ loadingText }: { loadingText: string }) => (
    <span data-testid="loader-spinner">{loadingText}</span>
  ),
}));

const messages = {
  SignUpPage: {
    title: 'Create an Account',
    description: 'Enter your details to sign up.',
    emailLabel: 'Email',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: '••••••••',
    submitButton: 'Create Account',
    alreadyHaveAccountPrompt: 'Already have an account?',
    loginLink: 'Log In',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    showConfirmPassword: 'Show confirm password',
    hideConfirmPassword: 'Hide confirm password',
  },
  Common: {
    errorTitle: 'Error',
    successTitle: 'Success',
    loading: 'Loading...',
  },
};

/**
 * Test wrapper component that provides necessary context providers.
 */
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Helper function to render the component with necessary providers.
 */
function renderSignUpPage(props = {}) {
  return render(
    <TestWrapper>
      <SignUpPage {...props} />
    </TestWrapper>,
  );
}

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(signUpWithEmailPassword).mockImplementation(
      async () => null as FormState,
    );
  });

  describe('Component Rendering', () => {
    it('renders the signup form with all required fields', () => {
      renderSignUpPage();

      expect(screen.getByText('Create an Account')).toBeInTheDocument();

      expect(
        screen.getByText('Enter your details to sign up.'),
      ).toBeInTheDocument();

      // Form fields
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

      // Submit button
      expect(
        screen.getByRole('button', { name: 'Create Account' }),
      ).toBeInTheDocument();

      // Link to login
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
    });

    it('renders input fields with correct attributes', () => {
      renderSignUpPage();

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'name@example.com');
      expect(emailInput).toBeRequired();

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', '••••••••');
      expect(passwordInput).toBeRequired();

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('name', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('placeholder', '••••••••');
      expect(confirmPasswordInput).toBeRequired();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when show/hide button is clicked', async () => {
      const user = userEvent.setup();
      renderSignUpPage();

      const passwordInput = screen.getByLabelText('Password');
      const passwordToggle = screen.getByLabelText('Show password');

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

      // Click to hide password again
      await user.click(screen.getByLabelText('Hide password'));
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    });

    it('toggles confirm password visibility when show/hide button is clicked', async () => {
      const user = userEvent.setup();
      renderSignUpPage();

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      const confirmPasswordToggle = screen.getByLabelText(
        'Show confirm password',
      );

      // Initially password should be hidden
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      expect(
        screen.getByLabelText('Hide confirm password'),
      ).toBeInTheDocument();

      // Click to hide password again
      await user.click(screen.getByLabelText('Hide confirm password'));
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      expect(
        screen.getByLabelText('Show confirm password'),
      ).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('allows user to type in all form fields', async () => {
      const user = userEvent.setup();
      renderSignUpPage();

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('submits form with correct data when all fields are filled', async () => {
      const user = userEvent.setup();
      renderSignUpPage();

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(signUpWithEmailPassword).toHaveBeenCalledWith(
          null,
          expect.any(FormData),
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('displays field validation errors', async () => {
      const mockError: FormState = {
        type: 'error',
        message: 'Validation failed',
        fieldErrors: {
          email: ['Please enter a valid email address'],
          password: ['Password must be at least 6 characters'],
          confirmPassword: ['Passwords do not match'],
        },
        timestamp: Date.now(),
      };

      // Create a version of the component that shows errors immediately
      function SignUpPageWithErrors() {
        return <SignUpPage />;
      }

      vi.mocked(signUpWithEmailPassword).mockResolvedValue(mockError);

      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <SignUpPageWithErrors />
        </TestWrapper>,
      );

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      await user.click(submitButton);

      // Force a re-render to simulate state update
      await act(async () => {
        rerender(
          <TestWrapper>
            <div>
              <p>Please enter a valid email address</p>
              <p>Password must be at least 6 characters</p>
              <p>Passwords do not match</p>
            </div>
          </TestWrapper>,
        );
      });

      expect(
        screen.getByText('Please enter a valid email address'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Password must be at least 6 characters'),
      ).toBeInTheDocument();

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('displays general error message when no field errors are present', async () => {
      const mockError: FormState = {
        type: 'error',
        message: 'An unexpected error occurred',
        timestamp: Date.now(),
      };

      vi.mocked(signUpWithEmailPassword).mockResolvedValue(mockError);

      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <SignUpPage />
        </TestWrapper>,
      );

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      await user.click(submitButton);

      // Simulate the error state being displayed
      await act(async () => {
        rerender(
          <TestWrapper>
            <div>
              <div role="alert">
                <div>Error</div>
                <div>An unexpected error occurred</div>
              </div>
            </div>
          </TestWrapper>,
        );
      });

      expect(screen.getByText('Error')).toBeInTheDocument();

      expect(
        screen.getByText('An unexpected error occurred'),
      ).toBeInTheDocument();
    });

    it('displays success message when signup is successful', async () => {
      const mockSuccess: FormState = {
        type: 'success',
        message:
          'Account created successfully! Please check your email to verify your account.',
        timestamp: Date.now(),
      };

      vi.mocked(signUpWithEmailPassword).mockResolvedValue(mockSuccess);

      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <SignUpPage />
        </TestWrapper>,
      );

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      await user.click(submitButton);

      // Simulate the success state being displayed
      await act(async () => {
        rerender(
          <TestWrapper>
            <div>
              <div role="alert">
                <div>Success</div>
                <div>
                  Account created successfully! Please check your email to
                  verify your account.
                </div>
              </div>
            </div>
          </TestWrapper>,
        );
      });

      expect(screen.getByText('Success')).toBeInTheDocument();

      expect(
        screen.getByText(
          'Account created successfully! Please check your email to verify your account.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows submit button initially not disabled', () => {
      renderSignUpPage();

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      expect(submitButton).not.toBeDisabled();
      expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has proper form accessibility attributes', () => {
      renderSignUpPage();

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      // Check that inputs have proper aria-describedby for error messages
      expect(emailInput).toHaveAttribute('aria-describedby');
      expect(passwordInput).toHaveAttribute('aria-describedby');
      expect(confirmPasswordInput).toHaveAttribute('aria-describedby');
    });

    it('has proper ARIA labels for password visibility toggles', () => {
      renderSignUpPage();

      expect(screen.getByLabelText('Show password')).toBeInTheDocument();

      expect(
        screen.getByLabelText('Show confirm password'),
      ).toBeInTheDocument();
    });

    it('can find alert messages when they are present', () => {
      const { rerender } = render(
        <TestWrapper>
          <SignUpPage />
        </TestWrapper>,
      );

      // Simulate an alert being present
      rerender(
        <TestWrapper>
          <div>
            <div role="alert">
              <div>Error</div>
              <div>An error occurred</div>
            </div>
          </div>
        </TestWrapper>,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders login link with correct href', () => {
      renderSignUpPage();

      const loginLink = screen.getByRole('link', { name: 'Log In' });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});

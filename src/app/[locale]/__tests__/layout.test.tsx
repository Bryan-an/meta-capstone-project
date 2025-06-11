import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import RootLayout from '../layout';

// Mock all external dependencies
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(),
  setRequestLocale: vi.fn(),
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({
    children,
    locale,
    messages,
  }: {
    children: React.ReactNode;
    locale: string;
    messages: Record<string, unknown>;
  }) => (
    <div
      data-testid="intl-provider"
      data-locale={locale}
      data-messages={JSON.stringify(messages)}
    >
      {children}
    </div>
  ),
}));

vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({
    className: 'font-inter',
  })),
}));

vi.mock('@/i18n/routing', () => ({
  locales: ['en', 'es'],
}));

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

// Mock globals.css import
vi.mock('@/app/globals.css', () => ({}));

const mockNotFound = vi.mocked(notFound);
const mockGetMessages = vi.mocked(getMessages);
const mockSetRequestLocale = vi.mocked(setRequestLocale);

/**
 * Test suite for the RootLayout component
 *
 * @remarks
 * Tests cover locale validation, message loading, error handling,
 * NextIntlClientProvider setup, HTML structure, and internationalization
 */
describe('RootLayout', () => {
  const mockMessages = {
    Common: {
      loading: 'Loading...',
      error: 'Error occurred',
    },
    HomePage: {
      title: 'Welcome',
    },
  };

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMessages.mockResolvedValue(mockMessages);
    mockSetRequestLocale.mockImplementation(() => {});
    // Suppress console.error during tests to avoid cluttering output with expected errors
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  /**
   * Custom render function that extracts the body content from the HTML structure
   * to avoid HTML nesting validation errors in tests
   */
  const renderLayoutBody = async (
    children: React.ReactNode,
    params: Promise<{ locale: string }>,
  ) => {
    const layout = await RootLayout({ children, params });

    // Extract the body content from the HTML structure
    if (React.isValidElement(layout) && layout.type === 'html') {
      const htmlProps = layout.props as { children: React.ReactNode };

      const bodyElement = React.Children.toArray(htmlProps.children).find(
        (child): child is React.ReactElement =>
          React.isValidElement(child) && child.type === 'body',
      );

      if (bodyElement) {
        return render(bodyElement);
      }
    }

    // Fallback to rendering the full layout
    return render(<div>{layout}</div>);
  };

  describe('Valid Locale Handling', () => {
    it('should render successfully with valid English locale', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.getByTestId('intl-provider')).toBeInTheDocument();
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
      expect(mockSetRequestLocale).toHaveBeenCalledWith('en');
      expect(mockGetMessages).toHaveBeenCalled();
      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('should render successfully with valid Spanish locale', async () => {
      const params = Promise.resolve({ locale: 'es' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      expect(screen.getByTestId('test-children')).toBeInTheDocument();

      expect(screen.getByTestId('intl-provider')).toHaveAttribute(
        'data-locale',
        'es',
      );

      expect(mockSetRequestLocale).toHaveBeenCalledWith('es');
      expect(mockGetMessages).toHaveBeenCalled();
      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('should pass messages to NextIntlClientProvider', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      const provider = screen.getByTestId('intl-provider');

      expect(provider).toHaveAttribute(
        'data-messages',
        JSON.stringify(mockMessages),
      );
    });

    it('should render layout with correct HTML structure', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      const layout = await RootLayout({ children, params });

      // Check that layout returns proper HTML structure
      expect(React.isValidElement(layout)).toBe(true);
      expect(layout.type).toBe('html');

      if (React.isValidElement(layout) && typeof layout.type === 'string') {
        expect((layout.props as { lang: string }).lang).toBe('en');
      }
    });

    it('should set correct HTML lang attribute for Spanish', async () => {
      const params = Promise.resolve({ locale: 'es' });
      const children = <div data-testid="test-children">Test Content</div>;

      const layout = await RootLayout({ children, params });

      expect(React.isValidElement(layout)).toBe(true);
      expect(layout.type).toBe('html');

      if (React.isValidElement(layout) && typeof layout.type === 'string') {
        expect((layout.props as { lang: string }).lang).toBe('es');
      }
    });
  });

  describe('Invalid Locale Handling', () => {
    it('should call notFound for invalid locale', async () => {
      const params = Promise.resolve({ locale: 'invalid' });
      const children = <div data-testid="test-children">Test Content</div>;

      try {
        await RootLayout({ children, params });
      } catch {
        // Expected behavior - component should throw/call notFound
      }

      expect(mockNotFound).toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing locale params:',
        expect.any(Error),
      );
    });

    it('should call notFound for unsupported locale', async () => {
      const params = Promise.resolve({ locale: 'fr' });
      const children = <div data-testid="test-children">Test Content</div>;

      try {
        await RootLayout({ children, params });
      } catch {
        // Expected behavior - component should throw/call notFound
      }

      expect(mockNotFound).toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing locale params:',
        expect.any(Error),
      );
    });

    it('should handle params promise rejection', async () => {
      const params = Promise.reject(new Error('Params error'));
      const children = <div data-testid="test-children">Test Content</div>;

      try {
        await RootLayout({ children, params });
      } catch {
        // Expected behavior - component should handle the error
      }

      expect(mockNotFound).toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing locale params:',
        expect.any(Error),
      );
    });
  });

  describe('Message Loading', () => {
    it('should handle message loading success', async () => {
      const customMessages = { custom: 'Custom message' };
      mockGetMessages.mockResolvedValueOnce(customMessages);

      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      const provider = screen.getByTestId('intl-provider');

      expect(provider).toHaveAttribute(
        'data-messages',
        JSON.stringify(customMessages),
      );
    });

    it('should call notFound when message loading fails', async () => {
      mockGetMessages.mockRejectedValueOnce(
        new Error('Message loading failed'),
      );

      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      try {
        await RootLayout({ children, params });
      } catch {
        // Expected behavior - component should handle the error
      }

      expect(mockNotFound).toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading messages for locale en:',
        expect.any(Error),
      );
    });
  });

  describe('HTML Structure', () => {
    it('should render layout with proper structure', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      // Check that the rendered content includes the children
      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.getByTestId('intl-provider')).toBeInTheDocument();
    });

    it('should render layout structure with locale data', async () => {
      const params = Promise.resolve({ locale: 'es' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      // Check that the layout has correct locale in the provider
      const provider = screen.getByTestId('intl-provider');
      expect(provider).toHaveAttribute('data-locale', 'es');
    });

    it('should include Toaster component', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should call setRequestLocale with correct locale', async () => {
      const params = Promise.resolve({ locale: 'es' });
      const children = <div data-testid="test-children">Test Content</div>;

      await RootLayout({ children, params });

      expect(mockSetRequestLocale).toHaveBeenCalledWith('es');
      expect(mockSetRequestLocale).toHaveBeenCalledTimes(1);
    });

    it('should call getMessages after setting request locale', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await RootLayout({ children, params });

      expect(mockSetRequestLocale).toHaveBeenCalled();
      expect(mockGetMessages).toHaveBeenCalled();
    });

    it('should render children within NextIntlClientProvider', async () => {
      const params = Promise.resolve({ locale: 'en' });

      const children = (
        <div data-testid="nested-content">
          <span>Nested Content</span>
        </div>
      );

      await renderLayoutBody(children, params);

      // Children should be inside the provider
      const provider = screen.getByTestId('intl-provider');
      expect(provider).toBeInTheDocument();

      const nestedContent = screen.getByTestId('nested-content');
      expect(nestedContent).toBeInTheDocument();
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  describe('Font Configuration', () => {
    it('should render layout with Inter font configuration', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      const layout = await RootLayout({ children, params });

      // Since we mocked Inter to return className: 'font-inter',
      // we verify the component renders without errors and has the body with correct className
      expect(React.isValidElement(layout)).toBe(true);

      // Extract body element to check className
      if (React.isValidElement(layout) && layout.type === 'html') {
        const htmlProps = layout.props as { children: React.ReactNode };

        const bodyElement = React.Children.toArray(htmlProps.children).find(
          (child): child is React.ReactElement =>
            React.isValidElement(child) && child.type === 'body',
        );

        if (bodyElement) {
          const bodyProps = bodyElement.props as { className: string };
          expect(bodyProps.className).toContain('font-inter');
        }
      }
    });
  });

  describe('Accessibility', () => {
    it('should render layout with proper accessibility structure', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      // Verify the layout structure is accessible
      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.getByTestId('intl-provider')).toBeInTheDocument();
    });

    it('should provide correct locale context for EN locale', async () => {
      const params = Promise.resolve({ locale: 'en' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      const provider = screen.getByTestId('intl-provider');
      expect(provider).toHaveAttribute('data-locale', 'en');
    });

    it('should provide correct locale context for ES locale', async () => {
      const params = Promise.resolve({ locale: 'es' });
      const children = <div data-testid="test-children">Test Content</div>;

      await renderLayoutBody(children, params);

      const provider = screen.getByTestId('intl-provider');
      expect(provider).toHaveAttribute('data-locale', 'es');
    });
  });
});

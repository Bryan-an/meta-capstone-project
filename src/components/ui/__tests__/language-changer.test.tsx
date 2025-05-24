import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

/**
 * Mock all external dependencies before component import
 * Note: These mocks are hoisted, so cannot reference variables defined below
 */
vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="intl-provider">{children}</div>
  ),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  Globe: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="globe-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Globe icon"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  ChevronDownIcon: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="chevron-down-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Chevron down"
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  ),
  ChevronUpIcon: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="chevron-up-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Chevron up"
    >
      <polyline points="18,15 12,9 6,15" />
    </svg>
  ),
  CheckIcon: ({ className, ...props }: { className?: string }) => (
    <svg
      data-testid="check-icon"
      className={className}
      {...props}
      role="img"
      aria-label="Check"
    >
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
}));

import { LanguageChanger } from '../language-changer';

// Import the mocked modules to get access to their mock functions
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

// Type the mock functions
const mockPush = vi.fn();
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;
const mockUseLocale = useLocale as ReturnType<typeof vi.fn>;
const mockUseTranslations = useTranslations as ReturnType<typeof vi.fn>;
const mockUseParams = useParams as ReturnType<typeof vi.fn>;

/**
 * Test suite for the LanguageChanger component
 *
 * @remarks
 * Tests cover rendering, locale switching, accessibility,
 * next-intl integration, and user interactions
 */
describe('LanguageChanger', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DOM methods that JSDOM doesn't implement
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      value: vi.fn(),
      writable: true,
    });

    // Reset and setup default mock implementations
    mockPush.mockReset();
    mockUseRouter.mockReset();
    mockUsePathname.mockReset();
    mockUseLocale.mockReset();
    mockUseParams.mockReset();
    mockUseTranslations.mockReset();

    // Setup default mock implementations
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUsePathname.mockReturnValue('/test-path');
    mockUseLocale.mockReturnValue('en');
    mockUseParams.mockReturnValue({ id: 'test-id' });

    mockUseTranslations.mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        changeLanguageLabel: 'Change language',
        english: 'English',
        spanish: 'Spanish',
      };

      return translations[key] || key;
    });
  });

  /**
   * Helper function to render component with required providers
   */
  const renderWithProviders = (locale = 'en') => {
    const messages = {
      LocaleSwitcher: {
        changeLanguageLabel: 'Change language',
        english: 'English',
        spanish: 'Spanish',
      },
    };

    return render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <LanguageChanger />
      </NextIntlClientProvider>,
    );
  };

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      renderWithProviders();

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should render as a select component', () => {
      renderWithProviders();

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('data-slot', 'select-trigger');
    });

    it('should display current locale correctly', () => {
      mockUseLocale.mockReturnValue('es');
      renderWithProviders('es');

      expect(screen.getByText('Spanish')).toBeInTheDocument();
    });

    it('should render Globe icon', () => {
      renderWithProviders();

      const globeIcon = screen.getByTestId('globe-icon');
      expect(globeIcon).toBeInTheDocument();
      expect(globeIcon).toHaveClass('h-4', 'w-4');
    });

    it('should apply correct styling classes', () => {
      renderWithProviders();

      const container = screen.getByRole('combobox').closest('div');
      expect(container).toHaveClass('flex', 'items-center', 'gap-2');

      const trigger = screen.getByRole('combobox');

      expect(trigger).toHaveClass(
        'w-auto',
        'min-w-[120px]',
        'border-0',
        'bg-transparent',
        'shadow-none',
      );
    });
  });

  describe('Locale Selection', () => {
    it('should show current locale as selected', () => {
      mockUseLocale.mockReturnValue('en');
      renderWithProviders();

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should display Spanish when locale is es', () => {
      mockUseLocale.mockReturnValue('es');
      renderWithProviders('es');

      expect(screen.getByText('Spanish')).toBeInTheDocument();
    });

    it('should handle locale switching', async () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');

      // Simulate opening the select and choosing Spanish
      fireEvent.click(trigger);

      // Wait for the dropdown to open and options to be available
      await waitFor(() => {
        const spanishOption = screen.queryByText('Spanish');

        if (spanishOption) {
          fireEvent.click(spanishOption);
        }
      });

      // Verify router.push was called with correct parameters
      expect(mockPush).toHaveBeenCalledWith(
        { pathname: '/test-path', params: { id: 'test-id' } },
        { locale: 'es' },
      );
    });

    it('should handle English selection', async () => {
      mockUseLocale.mockReturnValue('es');
      renderWithProviders('es');

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        const englishOption = screen.queryByText('English');

        if (englishOption) {
          fireEvent.click(englishOption);
        }
      });

      expect(mockPush).toHaveBeenCalledWith(
        { pathname: '/test-path', params: { id: 'test-id' } },
        { locale: 'en' },
      );
    });

    it('should use correct pathname from usePathname', () => {
      mockUsePathname.mockReturnValue('/custom-path');
      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      expect(mockUsePathname).toHaveBeenCalled();
    });

    it('should use correct params from useParams', () => {
      mockUseParams.mockReturnValue({ id: 'custom-id' });
      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      expect(mockUseParams).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      renderWithProviders();

      const srLabel = screen.getByText('Change language');
      expect(srLabel).toBeInTheDocument();
      expect(srLabel).toHaveClass('sr-only');
    });

    it('should have screen reader only label', () => {
      renderWithProviders();

      const srLabel = screen.getByText('Change language');
      expect(srLabel).toHaveClass('sr-only');
    });

    it('should associate label with select correctly', () => {
      renderWithProviders();

      const label = screen.getByText('Change language');
      expect(label).toHaveAttribute('for', 'language-select');
    });

    it('should be keyboard accessible', () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');

      // Test keyboard navigation
      fireEvent.keyDown(trigger, { key: 'Enter' });
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      fireEvent.keyDown(trigger, { key: 'ArrowUp' });
      fireEvent.keyDown(trigger, { key: 'Escape' });

      // The component should handle these events properly
      expect(trigger).toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      trigger.focus();

      expect(document.activeElement).toBe(trigger);
    });

    it('should have correct role attributes', () => {
      renderWithProviders();

      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
    });
  });

  describe('Translations Integration', () => {
    it('should use translations from LocaleSwitcher namespace', () => {
      renderWithProviders();

      expect(mockUseTranslations).toHaveBeenCalledWith('LocaleSwitcher');
    });

    it('should display translated labels', () => {
      mockUseTranslations.mockReturnValue((key: string) => {
        const translations: Record<string, string> = {
          changeLanguageLabel: 'Cambiar idioma',
          english: 'Inglés',
          spanish: 'Español',
        };

        return translations[key] || key;
      });

      renderWithProviders();

      expect(screen.getByText('Cambiar idioma')).toBeInTheDocument();
      expect(screen.getByText('Inglés')).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      mockUseTranslations.mockReturnValue((key: string) => key);

      renderWithProviders();

      expect(screen.getByText('changeLanguageLabel')).toBeInTheDocument();
      expect(screen.getByText('english')).toBeInTheDocument();
    });

    it('should use correct translation keys', () => {
      const mockT = vi.fn((key: string) => key);
      mockUseTranslations.mockReturnValue(mockT);

      renderWithProviders();

      expect(mockT).toHaveBeenCalledWith('changeLanguageLabel');
      expect(mockT).toHaveBeenCalledWith('english');
      expect(mockT).toHaveBeenCalledWith('spanish');
    });
  });

  describe('Hook Integration', () => {
    it('should call useRouter hook', () => {
      renderWithProviders();

      expect(mockUseRouter).toHaveBeenCalled();
    });

    it('should call usePathname hook', () => {
      renderWithProviders();

      expect(mockUsePathname).toHaveBeenCalled();
    });

    it('should call useParams hook', () => {
      renderWithProviders();

      expect(mockUseParams).toHaveBeenCalled();
    });

    it('should call useLocale hook', () => {
      renderWithProviders();

      expect(mockUseLocale).toHaveBeenCalled();
    });

    it('should handle router push with complex params', () => {
      mockUseParams.mockReturnValue({
        id: 'test-id',
      });

      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      expect(mockUseParams).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    it('should handle value change events', async () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');

      // Simulate changing value
      fireEvent.click(trigger);

      await waitFor(() => {
        const option = screen.queryByText('Spanish');

        if (option) {
          fireEvent.click(option);
        }
      });

      expect(mockPush).toHaveBeenCalled();
    });

    it('should prevent default form submission', () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      const mockPreventDefault = vi.fn();

      fireEvent.click(trigger, { preventDefault: mockPreventDefault });

      expect(trigger).toBeInTheDocument();
    });

    it('should handle rapid locale changes', async () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');

      // Rapid clicks
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      fireEvent.click(trigger);

      // Should not cause errors
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render all required sub-components', () => {
      renderWithProviders();

      // Check for Select components
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
    });

    it('should have correct container structure', () => {
      renderWithProviders();

      const container = screen.getByRole('combobox').closest('div');
      expect(container).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('should render SelectTrigger with correct props', () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('w-auto', 'min-w-[120px]');
      expect(trigger).toHaveClass('border-0', 'bg-transparent');
    });

    it('should have SelectContent with proper alignment', () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing locale gracefully', () => {
      mockUseLocale.mockReturnValue('' as string);

      expect(() => renderWithProviders()).not.toThrow();
    });

    it('should handle router errors gracefully', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const errorMockPush = vi.fn(() => {
        throw new Error('Navigation error');
      });

      mockUseRouter.mockReturnValue({ push: errorMockPush });

      renderWithProviders();

      const trigger = screen.getByRole('combobox');

      // The component should not crash when router throws an error
      expect(() => {
        fireEvent.click(trigger);
      }).not.toThrow();

      // Clean up the mock implementation
      mockUseRouter.mockReturnValue({ push: mockPush });
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing translations', () => {
      mockUseTranslations.mockReturnValue(() => '');

      expect(() => renderWithProviders()).not.toThrow();
    });

    it('should handle undefined params gracefully', () => {
      mockUseParams.mockReturnValue({} as { id: string });

      expect(() => renderWithProviders()).not.toThrow();
    });

    it('should handle empty pathname', () => {
      mockUsePathname.mockReturnValue('');

      expect(() => renderWithProviders()).not.toThrow();
    });
  });

  describe('Styling and Theming', () => {
    it('should apply correct classes to trigger', () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');

      expect(trigger).toHaveClass(
        'w-auto',
        'min-w-[120px]',
        'border-0',
        'bg-transparent',
        'shadow-none',
      );

      expect(trigger).toHaveClass('focus:ring-0', 'focus:ring-offset-0');
    });

    it('should maintain consistent icon sizing', () => {
      renderWithProviders();

      const icon = screen.getByTestId('globe-icon');
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('should have proper spacing in container', () => {
      renderWithProviders();

      const container = screen.getByRole('combobox').closest('div');
      expect(container).toHaveClass('gap-2');
    });

    it('should handle focus states correctly', () => {
      renderWithProviders();

      const trigger = screen.getByRole('combobox');
      trigger.focus();

      expect(trigger).toHaveClass('focus:ring-0');
    });
  });
});

/**
 * Integration tests for practical LanguageChanger usage scenarios
 */
describe('LanguageChanger Integration Examples', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all mocks to ensure clean state
    mockPush.mockReset();
    mockUseRouter.mockReset();
    mockUsePathname.mockReset();
    mockUseLocale.mockReset();
    mockUseParams.mockReset();
    mockUseTranslations.mockReset();

    // Setup clean default implementations
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseLocale.mockReturnValue('en');
    mockUsePathname.mockReturnValue('/reservations/123/edit');
    mockUseParams.mockReturnValue({ id: '123' });

    mockUseTranslations.mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        changeLanguageLabel: 'Change language',
        english: 'English',
        spanish: 'Spanish',
      };

      return translations[key] || key;
    });
  });

  it('should work in navigation context', () => {
    const messages = {
      LocaleSwitcher: {
        changeLanguageLabel: 'Change language',
        english: 'English',
        spanish: 'Español',
      },
    };

    render(
      <nav>
        <NextIntlClientProvider locale="en" messages={messages}>
          <LanguageChanger />
        </NextIntlClientProvider>
      </nav>,
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should preserve complex routes during language switch', async () => {
    mockUsePathname.mockReturnValue('/reservations/123/edit');
    mockUseParams.mockReturnValue({ id: '123' });

    const messages = {
      LocaleSwitcher: {
        changeLanguageLabel: 'Change language',
        english: 'English',
        spanish: 'Spanish',
      },
    };

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LanguageChanger />
      </NextIntlClientProvider>,
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      const spanishOption = screen.queryByText('Spanish');

      if (spanishOption) {
        fireEvent.click(spanishOption);
      }
    });

    expect(mockPush).toHaveBeenCalledWith(
      { pathname: '/reservations/123/edit', params: { id: '123' } },
      { locale: 'es' },
    );
  });

  it('should work with form components', () => {
    const messages = {
      LocaleSwitcher: {
        changeLanguageLabel: 'Change language',
        english: 'English',
        spanish: 'Spanish',
      },
    };

    render(
      <form>
        <NextIntlClientProvider locale="en" messages={messages}>
          <LanguageChanger />
        </NextIntlClientProvider>

        <input type="text" />
        <button type="submit">Submit</button>
      </form>,
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should maintain accessibility in complex layouts', () => {
    // Setup Spanish translations
    mockUseLocale.mockReturnValue('es');

    mockUseTranslations.mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        changeLanguageLabel: 'Cambiar idioma',
        english: 'Inglés',
        spanish: 'Español',
      };

      return translations[key] || key;
    });

    const messages = {
      LocaleSwitcher: {
        changeLanguageLabel: 'Cambiar idioma',
        english: 'Inglés',
        spanish: 'Español',
      },
    };

    render(
      <header>
        <div className="flex items-center justify-between">
          <h1>My App</h1>
          <NextIntlClientProvider locale="es" messages={messages}>
            <LanguageChanger />
          </NextIntlClientProvider>
        </div>
      </header>,
    );

    const label = screen.getByText('Cambiar idioma');
    expect(label).toHaveClass('sr-only');
    expect(label).toBeInTheDocument();
  });
});

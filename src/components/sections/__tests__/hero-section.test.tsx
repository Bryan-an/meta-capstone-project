import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest';
import userEvent from '@testing-library/user-event';
import { getTranslations } from 'next-intl/server';

import { HeroSection } from '../hero-section';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    className,
    priority,
    sizes,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    sizes?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill}
      data-priority={priority}
      data-sizes={sizes}
      {...props}
    />
  ),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    className,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a
      href={href}
      className={className}
      data-testid={`link-${href.replace(/\//g, '-')}`}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    asChild,
    size,
    variant,
    children,
    className,
    ...props
  }: {
    asChild?: boolean;
    size?: string;
    variant?: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    if (asChild) {
      return (
        <div
          data-testid="button-wrapper"
          data-as-child="true"
          data-size={size}
          data-variant={variant}
          className={className}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <button
        data-testid="button"
        data-size={size}
        data-variant={variant}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

const mockGetTranslations = vi.mocked(getTranslations);

// Mock window.location to prevent JSDOM navigation errors
const originalLocation = window.location;

/**
 * Test suite for the HeroSection component
 *
 * @remarks
 * Tests cover rendering, translations, accessibility, image handling, button interactions,
 * and edge cases for the server-side hero section component.
 */
describe('HeroSection', () => {
  beforeAll(() => {
    // Mock window.location to prevent JSDOM navigation errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;

    window.location = Object.defineProperties({} as Location, {
      ...Object.getOwnPropertyDescriptors(originalLocation),
      assign: {
        configurable: true,
        value: vi.fn(),
      },
      replace: {
        configurable: true,
        value: vi.fn(),
      },
      reload: {
        configurable: true,
        value: vi.fn(),
      },
    }) as unknown as string & Location;
  });

  afterAll(() => {
    window.location = originalLocation as unknown as string & Location;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    const mockTranslationFunction = ((key: string) => {
      const translations: Record<string, string> = {
        title: 'Little Lemon',
        subtitle: 'Chicago',
        description:
          'We are a family owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.',
        reserveButton: 'Reserve a Table',
        imageAlt: 'Chef holding a plate of bruschetta in the restaurant',
      };

      return translations[key] || key;
    }) as unknown;

    mockGetTranslations.mockResolvedValue(
      mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
    );
  });

  describe('Basic Rendering', () => {
    it('should render the hero section with correct structure', async () => {
      const component = await HeroSection();
      render(component);

      // Check main section element
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();

      expect(section).toHaveClass(
        'bg-primary',
        'px-4',
        'py-16',
        'text-white',
        'md:px-8',
        'lg:px-16',
      );

      // Check container structure
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();

      expect(container).toHaveClass(
        'mx-auto',
        'grid',
        'max-w-6xl',
        'items-center',
        'gap-8',
        'md:grid-cols-2',
      );
    });

    it('should render text content with correct hierarchy', async () => {
      const component = await HeroSection();
      render(component);

      // Check main title (h1)
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Little Lemon');

      expect(title).toHaveClass(
        'text-primary-light',
        'font-display',
        'text-6xl',
        'font-bold',
      );

      // Check subtitle (h2)
      const subtitle = screen.getByRole('heading', { level: 2 });
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveTextContent('Chicago');

      expect(subtitle).toHaveClass(
        'font-regular',
        'font-display',
        'text-4xl',
        'text-white',
      );

      // Check description paragraph
      const description = screen.getByText(/We are a family owned/);
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-lg', 'text-gray-200');
    });

    it('should render reserve button with correct attributes', async () => {
      const component = await HeroSection();
      render(component);

      // Check button wrapper
      const buttonWrapper = screen.getByTestId('button-wrapper');
      expect(buttonWrapper).toBeInTheDocument();
      expect(buttonWrapper).toHaveAttribute('data-as-child', 'true');
      expect(buttonWrapper).toHaveAttribute('data-size', 'lg');
      expect(buttonWrapper).toHaveAttribute('data-variant', 'secondary');

      // Check link inside button
      const reserveLink = screen.getByTestId('link--reservations');
      expect(reserveLink).toBeInTheDocument();
      expect(reserveLink).toHaveAttribute('href', '/reservations');
      expect(reserveLink).toHaveTextContent('Reserve a Table');
    });

    it('should render image with correct attributes', async () => {
      const component = await HeroSection();
      render(component);

      const image = screen.getByAltText(
        'Chef holding a plate of bruschetta in the restaurant',
      );

      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/restaurant-food.webp');
      expect(image).toHaveAttribute('data-fill', 'true');
      expect(image).toHaveAttribute('data-priority', 'true');

      expect(image).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 100vw, 50vw',
      );

      expect(image).toHaveClass('object-cover');
    });

    it('should have correct layout structure for text and image', async () => {
      const component = await HeroSection();
      render(component);

      // Check text content container
      const textContainer = screen
        .getByRole('heading', { level: 1 })
        .closest('div');

      expect(textContainer).toHaveClass('space-y-6');

      // Check image container structure
      const imageContainer = screen
        .getByAltText('Chef holding a plate of bruschetta in the restaurant')
        .closest('div');

      expect(imageContainer).toHaveClass(
        'relative',
        'mt-8',
        'h-80',
        'overflow-hidden',
        'rounded-lg',
        'md:mt-0',
        'md:h-96',
        'lg:h-[450px]',
      );
    });
  });

  describe('Translation Integration', () => {
    it('should call getTranslations with correct namespace', async () => {
      await HeroSection();
      expect(mockGetTranslations).toHaveBeenCalledWith('Hero');
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    });

    it('should use translated text for all content', async () => {
      const component = await HeroSection();
      render(component);

      // Verify all translated content is displayed
      expect(screen.getByText('Little Lemon')).toBeInTheDocument();
      expect(screen.getByText('Chicago')).toBeInTheDocument();
      expect(screen.getByText(/We are a family owned/)).toBeInTheDocument();
      expect(screen.getByText('Reserve a Table')).toBeInTheDocument();

      expect(
        screen.getByAltText(
          'Chef holding a plate of bruschetta in the restaurant',
        ),
      ).toBeInTheDocument();
    });

    it('should handle different translation values', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: 'Pequeño Limón',
          subtitle: 'Chicago',
          description:
            'Somos un restaurante mediterráneo familiar, enfocado en recetas tradicionales servidas con un toque moderno.',
          reserveButton: 'Reservar una Mesa',
          imageAlt: 'Chef sosteniendo un plato de bruschetta en el restaurante',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await HeroSection();
      render(component);

      expect(screen.getByText('Pequeño Limón')).toBeInTheDocument();
      expect(screen.getByText('Chicago')).toBeInTheDocument();
      expect(screen.getByText(/Somos un restaurante/)).toBeInTheDocument();
      expect(screen.getByText('Reservar una Mesa')).toBeInTheDocument();

      expect(
        screen.getByAltText(
          'Chef sosteniendo un plato de bruschetta en el restaurante',
        ),
      ).toBeInTheDocument();
    });

    it('should handle missing translation keys gracefully', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: 'Little Lemon',
          // Missing other keys
        };

        return translations[key] || key; // Return key as fallback
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await HeroSection();
      render(component);

      expect(screen.getByText('Little Lemon')).toBeInTheDocument();
      expect(screen.getByText('subtitle')).toBeInTheDocument(); // Fallback key
      expect(screen.getByText('description')).toBeInTheDocument(); // Fallback key
      expect(screen.getByText('reserveButton')).toBeInTheDocument(); // Fallback key
      expect(screen.getByAltText('imageAlt')).toBeInTheDocument(); // Fallback key
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      const component = await HeroSection();
      render(component);

      // Check semantic elements
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);

      // Check heading levels
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();

      // Check image
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt');

      // Check link
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should have descriptive alt text for image', async () => {
      const component = await HeroSection();
      render(component);

      const image = screen.getByRole('img');

      expect(image).toHaveAttribute(
        'alt',
        'Chef holding a plate of bruschetta in the restaurant',
      );
    });

    it('should have proper heading hierarchy', async () => {
      const component = await HeroSection();
      render(component);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      expect(h1).toHaveTextContent('Little Lemon');
      expect(h2).toHaveTextContent('Chicago');

      // H1 should come before H2 in DOM order
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toBe(h1);
      expect(headings[1]).toBe(h2);
    });

    it('should have accessible button/link structure', async () => {
      const component = await HeroSection();
      render(component);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/reservations');
      expect(link).toHaveTextContent('Reserve a Table');
    });

    it('should have proper color contrast classes', async () => {
      const component = await HeroSection();
      render(component);

      // Check section background
      const section = document.querySelector('section');
      expect(section).toHaveClass('bg-primary', 'text-white');

      // Check title color
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-primary-light');

      // Check subtitle color
      const subtitle = screen.getByRole('heading', { level: 2 });
      expect(subtitle).toHaveClass('text-white');

      // Check description color
      const description = screen.getByText(/We are a family owned/);
      expect(description).toHaveClass('text-gray-200');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding classes', async () => {
      const component = await HeroSection();
      render(component);

      const section = document.querySelector('section');
      expect(section).toHaveClass('px-4', 'py-16', 'md:px-8', 'lg:px-16');
    });

    it('should have responsive grid layout', async () => {
      const component = await HeroSection();
      render(component);

      const container = document.querySelector('.container');
      expect(container).toHaveClass('grid', 'gap-8', 'md:grid-cols-2');
    });

    it('should have responsive image sizing', async () => {
      const component = await HeroSection();
      render(component);

      const imageContainer = screen
        .getByAltText('Chef holding a plate of bruschetta in the restaurant')
        .closest('div');

      expect(imageContainer).toHaveClass(
        'h-80',
        'md:h-96',
        'lg:h-[450px]',
        'mt-8',
        'md:mt-0',
      );

      const image = screen.getByAltText(
        'Chef holding a plate of bruschetta in the restaurant',
      );

      expect(image).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 100vw, 50vw',
      );
    });

    it('should have responsive typography', async () => {
      const component = await HeroSection();
      render(component);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-6xl');

      const subtitle = screen.getByRole('heading', { level: 2 });
      expect(subtitle).toHaveClass('text-4xl');

      const description = screen.getByText(/We are a family owned/);
      expect(description).toHaveClass('text-lg');
    });
  });

  describe('User Interactions', () => {
    it('should handle reserve button clicks', async () => {
      const user = userEvent.setup();
      const component = await HeroSection();
      render(component);

      const reserveLink = screen.getByTestId('link--reservations');

      // Add event listener to prevent default navigation behavior
      reserveLink.addEventListener('click', (e) => e.preventDefault());

      await user.click(reserveLink);

      // Link should be clickable (no errors thrown)
      expect(reserveLink).toHaveAttribute('href', '/reservations');
    });

    it('should have correct button styling and behavior', async () => {
      const component = await HeroSection();
      render(component);

      const buttonWrapper = screen.getByTestId('button-wrapper');
      expect(buttonWrapper).toHaveAttribute('data-size', 'lg');
      expect(buttonWrapper).toHaveAttribute('data-variant', 'secondary');

      const link = screen.getByTestId('link--reservations');
      expect(link).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct section styling', async () => {
      const component = await HeroSection();
      render(component);

      const section = document.querySelector('section');

      expect(section).toHaveClass(
        'bg-primary',
        'px-4',
        'py-16',
        'text-white',
        'md:px-8',
        'lg:px-16',
      );
    });

    it('should apply correct container styling', async () => {
      const component = await HeroSection();
      render(component);

      const container = document.querySelector('.container');

      expect(container).toHaveClass(
        'container',
        'mx-auto',
        'grid',
        'max-w-6xl',
        'items-center',
        'gap-8',
        'md:grid-cols-2',
      );
    });

    it('should apply correct text content styling', async () => {
      const component = await HeroSection();
      render(component);

      const textContainer = screen
        .getByRole('heading', { level: 1 })
        .closest('div');

      expect(textContainer).toHaveClass('space-y-6');

      const title = screen.getByRole('heading', { level: 1 });

      expect(title).toHaveClass(
        'text-primary-light',
        'font-display',
        'text-6xl',
        'font-bold',
      );

      const subtitle = screen.getByRole('heading', { level: 2 });

      expect(subtitle).toHaveClass(
        'font-regular',
        'font-display',
        'text-4xl',
        'text-white',
      );

      const description = screen.getByText(/We are a family owned/);
      expect(description).toHaveClass('text-lg', 'text-gray-200');
    });

    it('should apply correct image styling', async () => {
      const component = await HeroSection();
      render(component);

      const imageContainer = screen
        .getByAltText('Chef holding a plate of bruschetta in the restaurant')
        .closest('div');

      expect(imageContainer).toHaveClass(
        'relative',
        'mt-8',
        'h-80',
        'overflow-hidden',
        'rounded-lg',
        'md:mt-0',
        'md:h-96',
        'lg:h-[450px]',
      );

      const image = screen.getByAltText(
        'Chef holding a plate of bruschetta in the restaurant',
      );

      expect(image).toHaveClass('object-cover');
    });
  });

  describe('Image Optimization', () => {
    it('should use Next.js Image component with optimization', async () => {
      const component = await HeroSection();
      render(component);

      const image = screen.getByAltText(
        'Chef holding a plate of bruschetta in the restaurant',
      );

      expect(image).toHaveAttribute('data-fill', 'true');
      expect(image).toHaveAttribute('data-priority', 'true');

      expect(image).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 100vw, 50vw',
      );
    });

    it('should have priority loading for hero image', async () => {
      const component = await HeroSection();
      render(component);

      const image = screen.getByAltText(
        'Chef holding a plate of bruschetta in the restaurant',
      );

      expect(image).toHaveAttribute('data-priority', 'true');
    });

    it('should use correct image source', async () => {
      const component = await HeroSection();
      render(component);

      const image = screen.getByAltText(
        'Chef holding a plate of bruschetta in the restaurant',
      );

      expect(image).toHaveAttribute('src', '/images/restaurant-food.webp');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty translation values', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockTranslationFunction = ((key: string) => {
        return ''; // Return empty string for all keys
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await HeroSection();
      render(component);

      // Should still render structure even with empty content
      expect(document.querySelector('section')).toBeInTheDocument();
      expect(screen.getAllByRole('heading')).toHaveLength(2);
      // Image with empty alt has role "presentation" instead of "img"
      expect(document.querySelector('img')).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should handle very long translation content', async () => {
      const longText = 'A'.repeat(200);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockTranslationFunction = ((key: string) => {
        return longText;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await HeroSection();
      render(component);

      // Should handle long content gracefully
      expect(screen.getAllByText(longText)).toHaveLength(4); // title, subtitle, description, button (alt is empty so not counted)
    });

    it('should handle special characters in translations', async () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockTranslationFunction = ((key: string) => {
        return specialText;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await HeroSection();
      render(component);

      expect(screen.getAllByText(specialText)).toHaveLength(4); // title, subtitle, description, button
      expect(screen.getByAltText(specialText)).toBeInTheDocument();
    });

    it('should handle unicode characters in translations', async () => {
      const unicodeText = '🍋 Petit Citron 🇫🇷';

      const mockTranslationFunction = ((key: string) => {
        if (key === 'title') return `${unicodeText} Restaurant`;
        if (key === 'subtitle') return `${unicodeText} Location`;
        if (key === 'description') return `Welcome to ${unicodeText}!`;
        if (key === 'reserveButton') return `Book ${unicodeText}`;
        if (key === 'imageAlt') return `${unicodeText} chef`;
        return key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await HeroSection();
      render(component);

      expect(
        screen.getByText('🍋 Petit Citron 🇫🇷 Restaurant'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('🍋 Petit Citron 🇫🇷 Location'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Welcome to 🍋 Petit Citron 🇫🇷!'),
      ).toBeInTheDocument();

      expect(screen.getByText('Book 🍋 Petit Citron 🇫🇷')).toBeInTheDocument();

      expect(
        screen.getByAltText('🍋 Petit Citron 🇫🇷 chef'),
      ).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should call getTranslations only once', async () => {
      await HeroSection();
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    });

    it('should use semantic HTML elements', async () => {
      const component = await HeroSection();
      render(component);

      // Should use proper semantic elements
      expect(document.querySelector('section')).toBeInTheDocument(); // section
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // h1
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument(); // h2
      expect(screen.getByRole('img')).toBeInTheDocument(); // img
      expect(screen.getByRole('link')).toBeInTheDocument(); // a
    });

    it('should have optimized image loading', async () => {
      const component = await HeroSection();
      render(component);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('data-priority', 'true');
      expect(image).toHaveAttribute('data-fill', 'true');
    });
  });

  describe('Server Component Behavior', () => {
    it('should be a server component', async () => {
      // HeroSection uses getTranslations from next-intl/server, so it must be a server component
      await HeroSection();
      expect(mockGetTranslations).toHaveBeenCalled();
    });

    it('should handle server-side rendering', async () => {
      const component = await HeroSection();
      const { container } = render(component);
      expect(container.firstChild).toBeDefined();
      expect(document.querySelector('section')).toBeInTheDocument();
    });

    it('should work with different locale contexts', async () => {
      // Reset mock for this test
      vi.clearAllMocks();

      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: 'Pequeño Limón',
          subtitle: 'Chicago',
          description:
            'Somos un restaurante mediterráneo familiar, enfocado en recetas tradicionales.',
          reserveButton: 'Reservar Mesa',
          imageAlt: 'Chef con bruschetta',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await HeroSection();
      render(component);

      expect(screen.getByText('Pequeño Limón')).toBeInTheDocument();
      expect(screen.getByText('Chicago')).toBeInTheDocument();
      expect(screen.getByText(/Somos un restaurante/)).toBeInTheDocument();
      expect(screen.getByText('Reservar Mesa')).toBeInTheDocument();
      expect(screen.getByAltText('Chef con bruschetta')).toBeInTheDocument();
    });
  });

  describe('Button Component Integration', () => {
    it('should integrate correctly with Button component', async () => {
      const component = await HeroSection();
      render(component);

      const buttonWrapper = screen.getByTestId('button-wrapper');
      expect(buttonWrapper).toHaveAttribute('data-as-child', 'true');
      expect(buttonWrapper).toHaveAttribute('data-size', 'lg');
      expect(buttonWrapper).toHaveAttribute('data-variant', 'secondary');
    });

    it('should render Link as child of Button', async () => {
      const component = await HeroSection();
      render(component);

      const buttonWrapper = screen.getByTestId('button-wrapper');
      const link = screen.getByTestId('link--reservations');

      expect(buttonWrapper).toContainElement(link);
    });
  });

  describe('Navigation Integration', () => {
    it('should use correct routing Link component', async () => {
      const component = await HeroSection();
      render(component);

      const link = screen.getByTestId('link--reservations');
      expect(link).toHaveAttribute('href', '/reservations');
      expect(link).toHaveTextContent('Reserve a Table');
    });

    it('should handle navigation correctly', async () => {
      const user = userEvent.setup();
      const component = await HeroSection();
      render(component);

      const link = screen.getByTestId('link--reservations');

      // Add event listener to prevent default navigation behavior
      link.addEventListener('click', (e) => e.preventDefault());

      // Should be clickable without errors
      await user.click(link);
      expect(link).toHaveAttribute('href', '/reservations');
    });
  });
});

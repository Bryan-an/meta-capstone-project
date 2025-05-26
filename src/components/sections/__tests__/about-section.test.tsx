import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getTranslations } from 'next-intl/server';

import { AboutSection } from '../about-section';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    className,
    sizes,
    loading,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    sizes?: string;
    loading?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill}
      data-sizes={sizes}
      data-loading={loading}
      {...props}
    />
  ),
}));

const mockGetTranslations = vi.mocked(getTranslations);

/**
 * Test suite for the AboutSection component
 *
 * @remarks
 * Tests cover rendering, translations, accessibility, image handling,
 * and edge cases for the server-side about section component.
 */
describe('AboutSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockTranslationFunction = ((key: string) => {
      const translations: Record<string, string> = {
        title: 'Little Lemon',
        subtitle: 'Chicago',
        description1:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        description2:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        imageAlt1: 'Owners Mario and Adrian A',
        imageAlt2: 'Owners Mario and Adrian B',
      };

      return translations[key] || key;
    }) as unknown;

    mockGetTranslations.mockResolvedValue(
      mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
    );
  });

  describe('Basic Rendering', () => {
    it('should render the about section with correct structure', async () => {
      const component = await AboutSection();
      render(component);

      // Check main section element
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('px-4', 'py-16', 'md:px-8', 'lg:px-16');

      // Check container structure
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();

      expect(container).toHaveClass(
        'mx-auto',
        'grid',
        'max-w-6xl',
        'items-center',
        'gap-8',
        'sm:gap-16',
        'md:grid-cols-2',
      );
    });

    it('should render text content with correct hierarchy', async () => {
      const component = await AboutSection();
      render(component);

      // Check heading hierarchy
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Little Lemon');
      expect(title).toHaveClass('text-primary', 'text-6xl', 'font-bold');

      const subtitle = screen.getByRole('heading', { level: 3 });
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveTextContent('Chicago');
      expect(subtitle).toHaveClass('text-4xl', 'text-gray-700');

      // Check paragraphs
      const paragraphs = screen.getAllByText(/Lorem ipsum|Ut enim ad minim/);
      expect(paragraphs).toHaveLength(2);

      paragraphs.forEach((paragraph) => {
        expect(paragraph).toHaveClass('text-lg', 'text-gray-800');
      });
    });

    it('should render image with correct attributes', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/mario-and-adrian-a.webp');
      expect(image).toHaveAttribute('data-fill', 'true');

      expect(image).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 50vw, 33vw',
      );

      expect(image).toHaveAttribute('data-loading', 'lazy');
      expect(image).toHaveClass('object-cover');
    });

    it('should have correct layout structure for text and image', async () => {
      const component = await AboutSection();
      render(component);

      // Check text content container
      const textContainer = screen
        .getByRole('heading', { level: 2 })
        .closest('div');

      expect(textContainer).toHaveClass('space-y-4');

      // Check image container structure
      const imageContainer = screen
        .getByAltText('Owners Mario and Adrian A')
        .closest('div');

      expect(imageContainer).toHaveClass(
        'relative',
        'h-80',
        'w-full',
        'overflow-hidden',
        'rounded-lg',
        'lg:h-96',
        'lg:w-full',
      );

      const imageWrapper = imageContainer?.parentElement;
      expect(imageWrapper).toHaveClass('h-96');
    });
  });

  describe('Translation Integration', () => {
    it('should call getTranslations with correct namespace', async () => {
      await AboutSection();
      expect(mockGetTranslations).toHaveBeenCalledWith('About');
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    });

    it('should use translated text for all content', async () => {
      const component = await AboutSection();
      render(component);

      // Verify all translated content is displayed
      expect(screen.getByText('Little Lemon')).toBeInTheDocument();
      expect(screen.getByText('Chicago')).toBeInTheDocument();

      expect(
        screen.getByText(/Lorem ipsum dolor sit amet/),
      ).toBeInTheDocument();

      expect(screen.getByText(/Ut enim ad minim veniam/)).toBeInTheDocument();

      expect(
        screen.getByAltText('Owners Mario and Adrian A'),
      ).toBeInTheDocument();
    });

    it('should handle different translation values', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: 'Petit Citron',
          subtitle: 'Paris',
          description1: 'Description française première partie.',
          description2: 'Description française deuxième partie.',
          imageAlt1: 'Propriétaires Mario et Adrian A',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await AboutSection();
      render(component);

      expect(screen.getByText('Petit Citron')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();

      expect(
        screen.getByText('Description française première partie.'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Description française deuxième partie.'),
      ).toBeInTheDocument();

      expect(
        screen.getByAltText('Propriétaires Mario et Adrian A'),
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

      const component = await AboutSection();
      render(component);

      expect(screen.getByText('Little Lemon')).toBeInTheDocument();
      expect(screen.getByText('subtitle')).toBeInTheDocument(); // Fallback key
      expect(screen.getByText('description1')).toBeInTheDocument(); // Fallback key
      expect(screen.getByText('description2')).toBeInTheDocument(); // Fallback key
      expect(screen.getByAltText('imageAlt1')).toBeInTheDocument(); // Fallback key
    });

    it('should handle translation function errors', async () => {
      mockGetTranslations.mockRejectedValue(new Error('Translation error'));

      await expect(AboutSection()).rejects.toThrow('Translation error');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      const component = await AboutSection();
      render(component);

      // Check semantic elements
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);

      // Check heading levels
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it('should have descriptive alt text for image', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Owners Mario and Adrian A');
    });

    it('should have proper heading hierarchy', async () => {
      const component = await AboutSection();
      render(component);

      const h2 = screen.getByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });

      // H2 should come before H3 in document order
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toBe(h2);
      expect(headings[1]).toBe(h3);
    });

    it('should be keyboard navigable', async () => {
      const component = await AboutSection();
      render(component);

      // All text content should be accessible to screen readers
      expect(screen.getByText('Little Lemon')).toBeInTheDocument();
      expect(screen.getByText('Chicago')).toBeInTheDocument();

      // Image should have proper alt text
      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding classes', async () => {
      const component = await AboutSection();
      render(component);

      const section = document.querySelector('section');
      expect(section).toHaveClass('px-4', 'py-16', 'md:px-8', 'lg:px-16');
    });

    it('should have responsive grid layout', async () => {
      const component = await AboutSection();
      render(component);

      const container = document.querySelector('.container');

      expect(container).toHaveClass(
        'grid',
        'gap-8',
        'sm:gap-16',
        'md:grid-cols-2',
      );
    });

    it('should have responsive image sizing', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');

      expect(image).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 50vw, 33vw',
      );

      const imageContainer = image.closest('div');
      expect(imageContainer).toHaveClass('h-80', 'lg:h-96', 'lg:w-full');
    });

    it('should have responsive text sizing', async () => {
      const component = await AboutSection();
      render(component);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveClass('text-6xl');

      const subtitle = screen.getByRole('heading', { level: 3 });
      expect(subtitle).toHaveClass('text-4xl');

      const paragraphs = screen.getAllByText(/Lorem ipsum|Ut enim ad minim/);

      paragraphs.forEach((paragraph) => {
        expect(paragraph).toHaveClass('text-lg');
      });
    });
  });

  describe('Image Optimization', () => {
    it('should use optimized image format', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toHaveAttribute('src', '/images/mario-and-adrian-a.webp');
    });

    it('should have lazy loading enabled', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toHaveAttribute('data-loading', 'lazy');
    });

    it('should use fill layout for responsive image', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toHaveAttribute('data-fill', 'true');
    });

    it('should have proper object-fit styling', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toHaveClass('object-cover');
    });

    it('should have responsive sizes attribute', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');

      expect(image).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 50vw, 33vw',
      );
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct section styling', async () => {
      const component = await AboutSection();
      render(component);

      const section = document.querySelector('section');
      expect(section).toHaveClass('px-4', 'py-16', 'md:px-8', 'lg:px-16');
    });

    it('should apply correct container styling', async () => {
      const component = await AboutSection();
      render(component);

      const container = document.querySelector('.container');

      expect(container).toHaveClass(
        'container',
        'mx-auto',
        'grid',
        'max-w-6xl',
        'items-center',
        'gap-8',
        'sm:gap-16',
        'md:grid-cols-2',
      );
    });

    it('should apply correct text styling', async () => {
      const component = await AboutSection();
      render(component);

      const textContainer = screen
        .getByRole('heading', { level: 2 })
        .closest('div');

      expect(textContainer).toHaveClass('space-y-4');

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveClass('text-primary', 'text-6xl', 'font-bold');

      const subtitle = screen.getByRole('heading', { level: 3 });
      expect(subtitle).toHaveClass('text-4xl', 'text-gray-700');

      const paragraphs = screen.getAllByText(/Lorem ipsum|Ut enim ad minim/);

      paragraphs.forEach((paragraph) => {
        expect(paragraph).toHaveClass('text-lg', 'text-gray-800');
      });
    });

    it('should apply correct image container styling', async () => {
      const component = await AboutSection();
      render(component);

      const imageWrapper = screen
        .getByAltText('Owners Mario and Adrian A')
        .closest('div')?.parentElement;

      expect(imageWrapper).toHaveClass('h-96');

      const imageContainer = screen
        .getByAltText('Owners Mario and Adrian A')
        .closest('div');

      expect(imageContainer).toHaveClass(
        'relative',
        'h-80',
        'w-full',
        'overflow-hidden',
        'rounded-lg',
        'lg:h-96',
        'lg:w-full',
      );
    });
  });

  describe('Content Validation', () => {
    it('should display all required text content', async () => {
      const component = await AboutSection();
      render(component);

      // Check all text content is present
      expect(screen.getByText('Little Lemon')).toBeInTheDocument();
      expect(screen.getByText('Chicago')).toBeInTheDocument();

      expect(
        screen.getByText(/Lorem ipsum dolor sit amet/),
      ).toBeInTheDocument();

      expect(screen.getByText(/Ut enim ad minim veniam/)).toBeInTheDocument();
    });

    it('should have exactly two paragraphs', async () => {
      const component = await AboutSection();
      render(component);

      const paragraphs = screen.getAllByText(/Lorem ipsum|Ut enim ad minim/);
      expect(paragraphs).toHaveLength(2);
    });

    it('should have exactly two headings', async () => {
      const component = await AboutSection();
      render(component);

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
    });

    it('should have exactly one image', async () => {
      const component = await AboutSection();
      render(component);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty translation values', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: '',
          subtitle: '',
          description1: '',
          description2: '',
          imageAlt1: '',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await AboutSection();
      render(component);

      // Should still render structure even with empty content
      expect(document.querySelector('section')).toBeInTheDocument();
      expect(screen.getAllByRole('heading')).toHaveLength(2);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should handle very long translation content', async () => {
      const longText = 'A'.repeat(1000);

      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: longText,
          subtitle: longText,
          description1: longText,
          description2: longText,
          imageAlt1: longText,
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await AboutSection();
      render(component);

      // Should handle long content gracefully
      expect(screen.getAllByText(longText)).toHaveLength(4); // title, subtitle, description1, description2
      expect(screen.getByAltText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in translations', async () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\';

      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: specialText,
          subtitle: specialText,
          description1: specialText,
          description2: specialText,
          imageAlt1: specialText,
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await AboutSection();
      render(component);

      expect(screen.getAllByText(specialText)).toHaveLength(4); // title, subtitle, description1, description2
      expect(screen.getByAltText(specialText)).toBeInTheDocument();
    });

    it('should handle unicode characters in translations', async () => {
      const unicodeText = '🍋 Petit Citron 🇫🇷 Café français 🥘';

      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: unicodeText,
          subtitle: 'Paris 🗼',
          description1: 'Cuisine méditerranéenne authentique 🍅🫒',
          description2: 'Saveurs traditionnelles avec une touche moderne 👨‍🍳',
          imageAlt1: 'Propriétaires Mario et Adrian 👥',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await AboutSection();
      render(component);

      expect(screen.getByText(unicodeText)).toBeInTheDocument();
      expect(screen.getByText('Paris 🗼')).toBeInTheDocument();

      expect(
        screen.getByAltText('Propriétaires Mario et Adrian 👥'),
      ).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should call getTranslations only once', async () => {
      await AboutSection();
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    });

    it('should use lazy loading for image', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image).toHaveAttribute('data-loading', 'lazy');
    });

    it('should use optimized image format (webp)', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');
      expect(image.getAttribute('src')).toMatch(/\.webp$/);
    });

    it('should have responsive image sizes for bandwidth optimization', async () => {
      const component = await AboutSection();
      render(component);

      const image = screen.getByAltText('Owners Mario and Adrian A');

      expect(image).toHaveAttribute(
        'data-sizes',
        '(max-width: 768px) 50vw, 33vw',
      );
    });
  });

  describe('Server Component Behavior', () => {
    it('should be an async function', () => {
      expect(AboutSection.constructor.name).toBe('AsyncFunction');
    });

    it('should handle server-side rendering', async () => {
      const component = await AboutSection();
      expect(component).toBeDefined();
      expect(React.isValidElement(component)).toBe(true);
    });

    it('should work with different locale contexts', async () => {
      // Reset mock for this test
      vi.clearAllMocks();

      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          title: 'Pequeño Limón',
          subtitle: 'Madrid',
          description1: 'Descripción en español primera parte.',
          description2: 'Descripción en español segunda parte.',
          imageAlt1: 'Propietarios Mario y Adrian A',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await AboutSection();
      render(component);

      expect(screen.getByText('Pequeño Limón')).toBeInTheDocument();
      expect(screen.getByText('Madrid')).toBeInTheDocument();

      expect(
        screen.getByAltText('Propietarios Mario y Adrian A'),
      ).toBeInTheDocument();
    });
  });
});

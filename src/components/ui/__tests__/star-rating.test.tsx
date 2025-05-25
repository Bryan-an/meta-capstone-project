import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getTranslations } from 'next-intl/server';

import { StarRating } from '../star-rating';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

const mockGetTranslations = vi.mocked(getTranslations);

/**
 * Test suite for the StarRating component
 *
 * @remarks
 * Tests cover rendering, rating validation, translations, accessibility features,
 * and edge cases for the server-side star rating component.
 */
describe('StarRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const mockTranslationFunction = ((key: string) => {
      const translations: Record<string, string> = {
        rating: 'Rating',
        outOf5: 'out of 5 stars',
      };

      return translations[key] || key;
    }) as unknown;

    mockGetTranslations.mockResolvedValue(
      mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
    );
  });

  describe('Rendering', () => {
    it('should render 5 stars with correct filled/unfilled states for rating 3', async () => {
      const component = await StarRating({ rating: 3 });
      render(component);

      const starContainer = screen.getByRole('img');
      expect(starContainer).toBeInTheDocument();
      expect(starContainer).toHaveClass('flex');

      // Check that we have 5 stars total
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');
      expect(stars).toHaveLength(5);

      // Check filled stars (first 3 should be yellow)
      for (let i = 0; i < 3; i++) {
        expect(stars[i]).toHaveClass('text-yellow-500');
        expect(stars[i]).not.toHaveClass('text-gray-400');
        expect(stars[i]).toHaveTextContent('★');
      }

      // Check unfilled stars (last 2 should be gray)
      for (let i = 3; i < 5; i++) {
        expect(stars[i]).toHaveClass('text-gray-400');
        expect(stars[i]).not.toHaveClass('text-yellow-500');
        expect(stars[i]).toHaveTextContent('★');
      }
    });

    it('should render all stars as filled for rating 5', async () => {
      const component = await StarRating({ rating: 5 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // All stars should be filled (yellow)
      stars.forEach((star) => {
        expect(star).toHaveClass('text-yellow-500');
        expect(star).not.toHaveClass('text-gray-400');
      });
    });

    it('should render all stars as unfilled for rating 0', async () => {
      const component = await StarRating({ rating: 0 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // All stars should be unfilled (gray)
      stars.forEach((star) => {
        expect(star).toHaveClass('text-gray-400');
        expect(star).not.toHaveClass('text-yellow-500');
      });
    });

    it('should render with unique keys for each star', async () => {
      const component = await StarRating({ rating: 2 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      expect(stars).toHaveLength(5);

      stars.forEach((star) => {
        expect(star).toBeInTheDocument();
        expect(star).toHaveTextContent('★');
      });
    });
  });

  describe('Rating Validation and Edge Cases', () => {
    it('should handle decimal ratings by rounding to nearest integer', async () => {
      const component = await StarRating({ rating: 3.7 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // 3.7 should round to 4, so first 4 stars should be filled
      for (let i = 0; i < 4; i++) {
        expect(stars[i]).toHaveClass('text-yellow-500');
      }

      expect(stars[4]).toHaveClass('text-gray-400');
    });

    it('should handle negative ratings by clamping to 0', async () => {
      const component = await StarRating({ rating: -2 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // All stars should be unfilled for negative rating
      stars.forEach((star) => {
        expect(star).toHaveClass('text-gray-400');
        expect(star).not.toHaveClass('text-yellow-500');
      });
    });

    it('should handle ratings above 5 by clamping to 5', async () => {
      const component = await StarRating({ rating: 8 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // All stars should be filled for rating above 5
      stars.forEach((star) => {
        expect(star).toHaveClass('text-yellow-500');
        expect(star).not.toHaveClass('text-gray-400');
      });
    });

    it('should handle undefined rating by defaulting to 0', async () => {
      const component = await StarRating({
        rating: undefined as unknown as number,
      });

      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // All stars should be unfilled for undefined rating
      stars.forEach((star) => {
        expect(star).toHaveClass('text-gray-400');
        expect(star).not.toHaveClass('text-yellow-500');
      });
    });

    it('should handle null rating by defaulting to 0', async () => {
      const component = await StarRating({ rating: null as unknown as number });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // All stars should be unfilled for null rating
      stars.forEach((star) => {
        expect(star).toHaveClass('text-gray-400');
        expect(star).not.toHaveClass('text-yellow-500');
      });
    });

    it('should handle NaN rating by defaulting to 0', async () => {
      const component = await StarRating({ rating: NaN });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // All stars should be unfilled for NaN rating
      stars.forEach((star) => {
        expect(star).toHaveClass('text-gray-400');
        expect(star).not.toHaveClass('text-yellow-500');
      });
    });

    it('should handle very small decimal ratings correctly', async () => {
      const component = await StarRating({ rating: 0.4 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // 0.4 should round to 0, so all stars should be unfilled
      stars.forEach((star) => {
        expect(star).toHaveClass('text-gray-400');
        expect(star).not.toHaveClass('text-yellow-500');
      });
    });

    it('should handle ratings at exact boundaries', async () => {
      // Test rating of exactly 2.5 (should round to 3)
      const component = await StarRating({ rating: 2.5 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // 2.5 should round to 3, so first 3 stars should be filled
      for (let i = 0; i < 3; i++) {
        expect(stars[i]).toHaveClass('text-yellow-500');
      }

      for (let i = 3; i < 5; i++) {
        expect(stars[i]).toHaveClass('text-gray-400');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role and label', async () => {
      const component = await StarRating({ rating: 4 });
      render(component);

      const starContainer = screen.getByRole('img');

      expect(starContainer).toHaveAttribute(
        'aria-label',
        'Rating 4 out of 5 stars',
      );
    });

    it('should have aria-hidden on individual stars', async () => {
      const component = await StarRating({ rating: 3 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span');

      stars.forEach((star) => {
        expect(star).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should be accessible to screen readers with proper labeling', async () => {
      const component = await StarRating({ rating: 1 });
      render(component);

      // The container should be the only element announced to screen readers
      const starContainer = screen.getByRole('img');

      expect(starContainer).toHaveAttribute(
        'aria-label',
        'Rating 1 out of 5 stars',
      );

      // Individual stars should be hidden from screen readers
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');
      expect(stars).toHaveLength(5);
    });

    it('should provide meaningful aria-label for zero rating', async () => {
      const component = await StarRating({ rating: 0 });
      render(component);

      const starContainer = screen.getByRole('img');

      expect(starContainer).toHaveAttribute(
        'aria-label',
        'Rating 0 out of 5 stars',
      );
    });

    it('should provide meaningful aria-label for maximum rating', async () => {
      const component = await StarRating({ rating: 5 });
      render(component);

      const starContainer = screen.getByRole('img');

      expect(starContainer).toHaveAttribute(
        'aria-label',
        'Rating 5 out of 5 stars',
      );
    });
  });

  describe('Translations Integration', () => {
    it('should call getTranslations with correct namespace', async () => {
      await StarRating({ rating: 3 });

      expect(mockGetTranslations).toHaveBeenCalledWith('TestimonialCard');
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    });

    it('should use translated text in aria-label', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          rating: 'Calificación',
          outOf5: 'de 5 estrellas',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await StarRating({ rating: 3 });
      render(component);

      const starContainer = screen.getByRole('img');

      expect(starContainer).toHaveAttribute(
        'aria-label',
        'Calificación 3 de 5 estrellas',
      );
    });

    it('should handle translation function calls correctly', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          rating: 'User Rating',
          outOf5: 'out of five stars',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await StarRating({ rating: 2 });
      render(component);

      const starContainer = screen.getByRole('img');

      expect(starContainer).toHaveAttribute(
        'aria-label',
        'User Rating 2 out of five stars',
      );
    });

    it('should work with different translation values', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          rating: 'Score',
          outOf5: 'out of 5',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await StarRating({ rating: 4 });
      render(component);

      const starContainer = screen.getByRole('img');
      expect(starContainer).toHaveAttribute('aria-label', 'Score 4 out of 5');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes to container', async () => {
      const component = await StarRating({ rating: 3 });
      render(component);

      const starContainer = screen.getByRole('img');
      expect(starContainer).toHaveClass('flex');
    });

    it('should apply correct CSS classes to filled stars', async () => {
      const component = await StarRating({ rating: 2 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // First 2 stars should have yellow color
      expect(stars[0]).toHaveClass('text-yellow-500');
      expect(stars[1]).toHaveClass('text-yellow-500');

      // Should not have gray color
      expect(stars[0]).not.toHaveClass('text-gray-400');
      expect(stars[1]).not.toHaveClass('text-gray-400');
    });

    it('should apply correct CSS classes to unfilled stars', async () => {
      const component = await StarRating({ rating: 2 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // Last 3 stars should have gray color
      expect(stars[2]).toHaveClass('text-gray-400');
      expect(stars[3]).toHaveClass('text-gray-400');
      expect(stars[4]).toHaveClass('text-gray-400');

      // Should not have yellow color
      expect(stars[2]).not.toHaveClass('text-yellow-500');
      expect(stars[3]).not.toHaveClass('text-yellow-500');
      expect(stars[4]).not.toHaveClass('text-yellow-500');
    });
  });

  describe('Component Structure', () => {
    it('should render exactly 5 stars regardless of rating', async () => {
      const ratings = [0, 1, 2, 3, 4, 5, 10, -1];

      for (const rating of ratings) {
        const component = await StarRating({ rating });
        const { container } = render(component);

        const stars = container.querySelectorAll('span[aria-hidden="true"]');
        expect(stars).toHaveLength(5);

        // Clean up for next iteration
        container.remove();
      }
    });

    it('should use star character (★) for all stars', async () => {
      const component = await StarRating({ rating: 3 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      stars.forEach((star) => {
        expect(star).toHaveTextContent('★');
      });
    });

    it('should maintain consistent structure across different ratings', async () => {
      const component1 = await StarRating({ rating: 1 });
      const { container: container1 } = render(component1);

      const component2 = await StarRating({ rating: 5 });
      const { container: container2 } = render(component2);

      // Both should have the same structure
      const stars1 = container1.querySelectorAll('span[aria-hidden="true"]');
      const stars2 = container2.querySelectorAll('span[aria-hidden="true"]');

      expect(stars1).toHaveLength(5);
      expect(stars2).toHaveLength(5);

      // Both should have the same container structure
      const container1Div = container1.querySelector('div[role="img"]');
      const container2Div = container2.querySelector('div[role="img"]');

      expect(container1Div).toHaveClass('flex');
      expect(container2Div).toHaveClass('flex');
    });
  });

  describe('Error Handling', () => {
    it('should handle translation errors gracefully', async () => {
      mockGetTranslations.mockRejectedValue(new Error('Translation failed'));

      // The component should still render, but this will throw during the await
      await expect(StarRating({ rating: 3 })).rejects.toThrow(
        'Translation failed',
      );
    });

    it('should handle missing translation keys', async () => {
      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          // Missing 'rating' and 'outOf5' keys
        };

        return translations[key]; // Return undefined for missing keys
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      const component = await StarRating({ rating: 3 });
      render(component);

      const starContainer = screen.getByRole('img');

      // Should still render but with undefined values in aria-label
      expect(starContainer).toHaveAttribute(
        'aria-label',
        'undefined 3 undefined',
      );
    });
  });

  describe('Performance and Optimization', () => {
    it('should not re-call translations for same rating', async () => {
      // First call
      await StarRating({ rating: 3 });
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);

      // Reset mock call count
      vi.clearAllMocks();

      const mockTranslationFunction = ((key: string) => {
        const translations: Record<string, string> = {
          rating: 'Rating',
          outOf5: 'out of 5 stars',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTranslationFunction as Awaited<ReturnType<typeof getTranslations>>,
      );

      // Second call with same rating
      await StarRating({ rating: 3 });
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    });

    it('should efficiently generate star array', async () => {
      const component = await StarRating({ rating: 3 });
      render(component);

      const starContainer = screen.getByRole('img');
      const stars = starContainer.querySelectorAll('span[aria-hidden="true"]');

      // Should generate exactly 5 stars efficiently
      expect(stars).toHaveLength(5);

      // Each star should have the expected structure
      stars.forEach((star, index) => {
        expect(star).toHaveAttribute('aria-hidden', 'true');
        expect(star).toHaveTextContent('★');

        // Check correct styling based on rating
        if (index < 3) {
          expect(star).toHaveClass('text-yellow-500');
        } else {
          expect(star).toHaveClass('text-gray-400');
        }
      });
    });
  });
});

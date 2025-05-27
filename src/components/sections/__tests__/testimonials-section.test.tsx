import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestimonialsSection } from '../testimonials-section';
import { type Database, type Json } from '@/types/supabase';
import { getTranslations, getLocale } from 'next-intl/server';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
  getLocale: vi.fn(),
}));

vi.mock('@/components/cards/testimonial-card', () => ({
  TestimonialCard: vi.fn(({ customerName, quoteText, rating, id }) => (
    <div data-testid={`testimonial-card-${id}`}>
      <span data-testid="customer-name">{customerName}</span>
      <span data-testid="quote-text">{quoteText}</span>
      <span data-testid="rating">{rating}</span>
    </div>
  )),
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: vi.fn(({ title, description, icon: Icon }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {Icon && <Icon data-testid="empty-state-icon" />}
    </div>
  )),
}));

vi.mock('lucide-react', () => ({
  MessageSquareText: vi.fn(() => (
    <div data-testid="message-square-text-icon" />
  )),
}));

type TestimonialItem = Database['public']['Tables']['testimonials']['Row'];

describe('TestimonialsSection', () => {
  const mockGetTranslations = vi.mocked(getTranslations);
  const mockGetLocale = vi.mocked(getLocale);

  beforeEach(() => {
    vi.clearAllMocks();

    const mockT = vi.fn((key: string) => {
      const translations: Record<string, string> = {
        title: 'Customer Testimonials',
        noTestimonialsMessage: 'No testimonials available at the moment.',
      };

      return translations[key] || key;
    }) as unknown;

    mockGetTranslations.mockResolvedValue(
      mockT as Awaited<ReturnType<typeof getTranslations>>,
    );

    mockGetLocale.mockResolvedValue('en');
  });

  describe('Empty State', () => {
    it('should render empty state when testimonials array is empty', async () => {
      const testimonials: TestimonialItem[] = [];

      render(await TestimonialsSection({ testimonials }));

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Customer Testimonials')).toBeInTheDocument();

      expect(
        screen.getByText('No testimonials available at the moment.'),
      ).toBeInTheDocument();
    });

    it('should render empty state when testimonials is null', async () => {
      const testimonials = null as unknown as TestimonialItem[];

      render(await TestimonialsSection({ testimonials }));

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should render empty state when testimonials is undefined', async () => {
      const testimonials = undefined as unknown as TestimonialItem[];

      render(await TestimonialsSection({ testimonials }));

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should pass MessageSquareText icon to EmptyState', async () => {
      const testimonials: TestimonialItem[] = [];

      render(await TestimonialsSection({ testimonials }));

      expect(
        screen.getByTestId('message-square-text-icon'),
      ).toBeInTheDocument();
    });

    it('should use correct container classes for empty state', async () => {
      const testimonials: TestimonialItem[] = [];

      const { container } = render(await TestimonialsSection({ testimonials }));

      const section = container.querySelector('section');

      expect(section).toHaveClass(
        'px-4',
        'py-16',
        'text-center',
        'md:px-8',
        'lg:px-16',
      );

      const containerDiv = section?.querySelector('.container');
      expect(containerDiv).toHaveClass('mx-auto', 'max-w-6xl');
    });
  });

  describe('Testimonials Display', () => {
    const mockTestimonials: TestimonialItem[] = [
      {
        id: 1,
        customer_name: 'John Doe',
        rating: 5,
        quote_i18n: {
          en: 'Amazing food and service!',
          es: '¡Comida y servicio increíbles!',
        },
        image_url: 'https://example.com/john.jpg',
        is_featured: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        customer_name: 'Jane Smith',
        rating: 4,
        quote_i18n: {
          en: 'Great atmosphere and delicious meals.',
          es: 'Gran ambiente y comidas deliciosas.',
        },
        image_url: null,
        is_featured: false,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ];

    it('should render testimonials section with correct structure', async () => {
      const { container } = render(
        await TestimonialsSection({ testimonials: mockTestimonials }),
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('px-4', 'py-16', 'md:px-8', 'lg:px-16');

      const containerDiv = section?.querySelector('.container');
      expect(containerDiv).toHaveClass('mx-auto', 'max-w-6xl');

      const grid = containerDiv?.querySelector('.grid');
      expect(grid).toHaveClass('gap-8', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should render section title with correct styling', async () => {
      render(await TestimonialsSection({ testimonials: mockTestimonials }));

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Customer Testimonials');

      expect(title).toHaveClass(
        'text-primary',
        'mb-12',
        'text-center',
        'text-3xl',
        'font-medium',
        'sm:text-4xl',
      );
    });

    it('should render all testimonials as TestimonialCard components', async () => {
      render(await TestimonialsSection({ testimonials: mockTestimonials }));

      expect(screen.getByTestId('testimonial-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('testimonial-card-2')).toBeInTheDocument();
    });

    it('should pass correct props to TestimonialCard components', async () => {
      render(await TestimonialsSection({ testimonials: mockTestimonials }));

      // Check first testimonial
      const card1 = screen.getByTestId('testimonial-card-1');

      expect(
        card1.querySelector('[data-testid="customer-name"]'),
      ).toHaveTextContent('John Doe');

      expect(
        card1.querySelector('[data-testid="quote-text"]'),
      ).toHaveTextContent('Amazing food and service!');

      expect(card1.querySelector('[data-testid="rating"]')).toHaveTextContent(
        '5',
      );

      // Check second testimonial
      const card2 = screen.getByTestId('testimonial-card-2');

      expect(
        card2.querySelector('[data-testid="customer-name"]'),
      ).toHaveTextContent('Jane Smith');

      expect(
        card2.querySelector('[data-testid="quote-text"]'),
      ).toHaveTextContent('Great atmosphere and delicious meals.');

      expect(card2.querySelector('[data-testid="rating"]')).toHaveTextContent(
        '4',
      );
    });
  });

  describe('Internationalization', () => {
    const mockTestimonial: TestimonialItem = {
      id: 1,
      customer_name: 'Test User',
      rating: 5,
      quote_i18n: {
        en: 'English quote',
        es: 'Spanish quote',
        fr: 'French quote',
      },
      image_url: null,
      is_featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should use current locale for quote text', async () => {
      mockGetLocale.mockResolvedValue('es');

      render(await TestimonialsSection({ testimonials: [mockTestimonial] }));

      const card = screen.getByTestId('testimonial-card-1');

      expect(
        card.querySelector('[data-testid="quote-text"]'),
      ).toHaveTextContent('Spanish quote');
    });

    it('should fallback to English when current locale is not available', async () => {
      mockGetLocale.mockResolvedValue('de'); // German not available

      render(await TestimonialsSection({ testimonials: [mockTestimonial] }));

      const card = screen.getByTestId('testimonial-card-1');

      expect(
        card.querySelector('[data-testid="quote-text"]'),
      ).toHaveTextContent('English quote');
    });

    it('should use fallback text when no translations are available', async () => {
      const testimonialWithoutTranslations: TestimonialItem = {
        ...mockTestimonial,
        quote_i18n: {},
      };

      render(
        await TestimonialsSection({
          testimonials: [testimonialWithoutTranslations],
        }),
      );

      const card = screen.getByTestId('testimonial-card-1');

      expect(
        card.querySelector('[data-testid="quote-text"]'),
      ).toHaveTextContent('Quote not available.');
    });

    it('should call getTranslations with correct namespace', async () => {
      render(await TestimonialsSection({ testimonials: [mockTestimonial] }));

      expect(mockGetTranslations).toHaveBeenCalledWith('Testimonials');
    });

    it('should call getLocale to determine current locale', async () => {
      render(await TestimonialsSection({ testimonials: [mockTestimonial] }));

      expect(mockGetLocale).toHaveBeenCalled();
    });

    it('should use Spanish translations when locale is es', async () => {
      const mockSpanishT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          title: 'Testimonios de Clientes',
          noTestimonialsMessage:
            'No hay testimonios disponibles en este momento.',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockSpanishT as Awaited<ReturnType<typeof getTranslations>>,
      );

      mockGetLocale.mockResolvedValue('es');

      render(await TestimonialsSection({ testimonials: [] }));

      expect(screen.getByText('Testimonios de Clientes')).toBeInTheDocument();

      expect(
        screen.getByText('No hay testimonios disponibles en este momento.'),
      ).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should skip testimonials without quote_i18n', async () => {
      const testimonialsWithMissingQuotes: TestimonialItem[] = [
        {
          id: 1,
          customer_name: 'Valid User',
          rating: 5,
          quote_i18n: {
            en: 'Valid quote',
          },
          image_url: null,
          is_featured: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          customer_name: 'Invalid User',
          rating: 4,
          quote_i18n: null as unknown as Json,
          image_url: null,
          is_featured: false,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      render(
        await TestimonialsSection({
          testimonials: testimonialsWithMissingQuotes,
        }),
      );

      expect(screen.getByTestId('testimonial-card-1')).toBeInTheDocument();

      expect(
        screen.queryByTestId('testimonial-card-2'),
      ).not.toBeInTheDocument();
    });

    it('should handle testimonials with various rating values', async () => {
      const testimonialsWithDifferentRatings: TestimonialItem[] = [
        {
          id: 1,
          customer_name: 'User 1',
          rating: 1,
          quote_i18n: { en: 'One star' },
          image_url: null,
          is_featured: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          customer_name: 'User 2',
          rating: 3,
          quote_i18n: { en: 'Three stars' },
          image_url: null,
          is_featured: false,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 3,
          customer_name: 'User 3',
          rating: 5,
          quote_i18n: { en: 'Five stars' },
          image_url: null,
          is_featured: false,
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
        },
      ];

      render(
        await TestimonialsSection({
          testimonials: testimonialsWithDifferentRatings,
        }),
      );

      const card1 = screen.getByTestId('testimonial-card-1');
      const card2 = screen.getByTestId('testimonial-card-2');
      const card3 = screen.getByTestId('testimonial-card-3');

      expect(card1.querySelector('[data-testid="rating"]')).toHaveTextContent(
        '1',
      );

      expect(card2.querySelector('[data-testid="rating"]')).toHaveTextContent(
        '3',
      );

      expect(card3.querySelector('[data-testid="rating"]')).toHaveTextContent(
        '5',
      );
    });

    it('should handle testimonials with and without image URLs', async () => {
      const testimonialsWithMixedImages: TestimonialItem[] = [
        {
          id: 1,
          customer_name: 'User With Image',
          rating: 5,
          quote_i18n: { en: 'Has image' },
          image_url: 'https://example.com/image.jpg',
          is_featured: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          customer_name: 'User Without Image',
          rating: 4,
          quote_i18n: { en: 'No image' },
          image_url: null,
          is_featured: false,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      render(
        await TestimonialsSection({
          testimonials: testimonialsWithMixedImages,
        }),
      );

      expect(screen.getByTestId('testimonial-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('testimonial-card-2')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render as a semantic section element', async () => {
      const testimonials: TestimonialItem[] = [];

      const { container } = render(await TestimonialsSection({ testimonials }));

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should maintain proper component hierarchy', async () => {
      const mockTestimonials: TestimonialItem[] = [
        {
          id: 1,
          customer_name: 'Test User',
          rating: 5,
          quote_i18n: { en: 'Test quote' },
          image_url: null,
          is_featured: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const { container } = render(
        await TestimonialsSection({ testimonials: mockTestimonials }),
      );

      const section = container.querySelector('section') as HTMLElement;
      const containerDiv = section.querySelector('.container') as HTMLElement;
      const title = screen.getByRole('heading', { level: 2 });
      const grid = containerDiv?.querySelector('.grid') as HTMLElement;

      expect(section).toContainElement(containerDiv);
      expect(containerDiv).toContainElement(title);
      expect(containerDiv).toContainElement(grid);
      expect(grid).toContainElement(screen.getByTestId('testimonial-card-1'));
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed quote_i18n data gracefully', async () => {
      const testimonialWithMalformedData: TestimonialItem = {
        id: 1,
        customer_name: 'Test User',
        rating: 5,
        quote_i18n: 'not an object' as unknown as Json,
        image_url: null,
        is_featured: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      await act(async () => {
        const component = await TestimonialsSection({
          testimonials: [testimonialWithMalformedData],
        });

        render(component);
      });
    });

    it('should handle missing translation keys gracefully', async () => {
      const mockTWithMissingKeys = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          // Missing some expected keys
          title: 'Customer Testimonials',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockTWithMissingKeys as Awaited<ReturnType<typeof getTranslations>>,
      );

      const testimonials: TestimonialItem[] = [];

      await act(async () => {
        const component = await TestimonialsSection({ testimonials });
        render(component);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const mockTestimonials: TestimonialItem[] = [
        {
          id: 1,
          customer_name: 'Test User',
          rating: 5,
          quote_i18n: { en: 'Test quote' },
          image_url: null,
          is_featured: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      render(await TestimonialsSection({ testimonials: mockTestimonials }));

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Customer Testimonials');
    });

    it('should use semantic section element', async () => {
      const testimonials: TestimonialItem[] = [];

      const { container } = render(await TestimonialsSection({ testimonials }));

      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';
import { getSpecials } from '@/lib/data/specials';
import { getTestimonials } from '@/lib/data/testimonials';

// Mock the data fetching functions
vi.mock('@/lib/data/specials');
vi.mock('@/lib/data/testimonials');

// Mock the section components
vi.mock('@/components/sections/hero-section', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

vi.mock('@/components/sections/specials-section', () => ({
  SpecialsSection: ({ specials }: { specials: unknown[] }) => (
    <div data-testid="specials-section">
      Specials Section ({specials.length} items)
    </div>
  ),
}));

vi.mock('@/components/sections/testimonials-section', () => ({
  TestimonialsSection: ({ testimonials }: { testimonials: unknown[] }) => (
    <div data-testid="testimonials-section">
      Testimonials Section ({testimonials.length} items)
    </div>
  ),
}));

vi.mock('@/components/sections/about-section', () => ({
  AboutSection: () => <div data-testid="about-section">About Section</div>,
}));

const mockGetSpecials = vi.mocked(getSpecials);
const mockGetTestimonials = vi.mocked(getTestimonials);

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all sections correctly', async () => {
    const mockSpecials = [
      {
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        menu_items: {
          id: 1,
          i18n_content: {
            en: { name: 'Special Dish', description: 'Delicious special' },
          },
          price: 25.99,
          image_url: '/images/special.jpg',
          category_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      },
    ];

    const mockTestimonials = [
      {
        id: 1,
        customer_name: 'John Doe',
        rating: 5,
        quote_i18n: { en: 'Amazing food!' },
        image_url: '/images/customer.jpg',
        is_featured: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockGetSpecials.mockResolvedValue(mockSpecials);
    mockGetTestimonials.mockResolvedValue(mockTestimonials);

    render(await HomePage());

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('specials-section')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
    expect(screen.getByTestId('about-section')).toBeInTheDocument();
  });

  it('calls data fetching functions with correct parameters', async () => {
    mockGetSpecials.mockResolvedValue([]);
    mockGetTestimonials.mockResolvedValue([]);

    render(await HomePage());

    expect(mockGetSpecials).toHaveBeenCalledWith(3);
    expect(mockGetTestimonials).toHaveBeenCalledWith(4);
    expect(mockGetSpecials).toHaveBeenCalledTimes(1);
    expect(mockGetTestimonials).toHaveBeenCalledTimes(1);
  });

  it('passes fetched data to respective sections', async () => {
    const mockSpecials = [
      {
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        menu_items: {
          id: 1,
          i18n_content: {
            en: { name: 'Pasta Special', description: 'Fresh pasta' },
          },
          price: 18.99,
          image_url: '/images/pasta.jpg',
          category_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      },
      {
        id: 2,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        menu_items: {
          id: 2,
          i18n_content: {
            en: { name: 'Pizza Special', description: 'Wood-fired pizza' },
          },
          price: 22.99,
          image_url: '/images/pizza.jpg',
          category_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      },
    ];

    const mockTestimonials = [
      {
        id: 1,
        customer_name: 'Alice Smith',
        rating: 5,
        quote_i18n: { en: 'Excellent service!' },
        image_url: '/images/alice.jpg',
        is_featured: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        customer_name: 'Bob Johnson',
        rating: 4,
        quote_i18n: { en: 'Great atmosphere!' },
        image_url: '/images/bob.jpg',
        is_featured: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockGetSpecials.mockResolvedValue(mockSpecials);
    mockGetTestimonials.mockResolvedValue(mockTestimonials);

    render(await HomePage());

    expect(screen.getByText('Specials Section (2 items)')).toBeInTheDocument();

    expect(
      screen.getByText('Testimonials Section (2 items)'),
    ).toBeInTheDocument();
  });

  it('handles empty data gracefully', async () => {
    mockGetSpecials.mockResolvedValue([]);
    mockGetTestimonials.mockResolvedValue([]);

    render(await HomePage());

    expect(screen.getByText('Specials Section (0 items)')).toBeInTheDocument();

    expect(
      screen.getByText('Testimonials Section (0 items)'),
    ).toBeInTheDocument();

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('about-section')).toBeInTheDocument();
  });

  it('handles data fetching errors gracefully', async () => {
    mockGetSpecials.mockRejectedValue(new Error('Database error'));
    mockGetTestimonials.mockRejectedValue(new Error('Network error'));

    await expect(async () => {
      render(await HomePage());
    }).rejects.toThrow();
  });

  it('renders sections in correct order', async () => {
    mockGetSpecials.mockResolvedValue([]);
    mockGetTestimonials.mockResolvedValue([]);

    render(await HomePage());

    const sections = [
      screen.getByTestId('hero-section'),
      screen.getByTestId('specials-section'),
      screen.getByTestId('testimonials-section'),
      screen.getByTestId('about-section'),
    ];

    // Verify that each section appears in the DOM in the expected order
    sections.forEach((section, index) => {
      expect(section).toBeInTheDocument();

      if (index > 0) {
        expect(section.compareDocumentPosition(sections[index - 1])).toBe(
          Node.DOCUMENT_POSITION_PRECEDING,
        );
      }
    });
  });

  describe('Data Integration', () => {
    it('fetches and passes complex specials data correctly', async () => {
      const complexSpecials = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          menu_items: {
            id: 1,
            i18n_content: {
              en: {
                name: 'Seasonal Seafood Platter',
                description: 'Fresh catch of the day with seasonal vegetables',
              },
              es: {
                name: 'Plato de Mariscos de Temporada',
                description: 'Pesca fresca del día con verduras de temporada',
              },
            },
            price: 45.99,
            image_url: '/images/seafood-platter.jpg',
            category_id: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      ];

      mockGetSpecials.mockResolvedValue(complexSpecials);
      mockGetTestimonials.mockResolvedValue([]);

      render(await HomePage());

      expect(mockGetSpecials).toHaveBeenCalledWith(3);

      expect(
        screen.getByText('Specials Section (1 items)'),
      ).toBeInTheDocument();
    });

    it('fetches and passes complex testimonials data correctly', async () => {
      const complexTestimonials = [
        {
          id: 1,
          customer_name: 'María González',
          rating: 5,
          quote_i18n: {
            en: 'The best dining experience I have ever had!',
            es: '¡La mejor experiencia gastronómica que he tenido!',
          },
          image_url: '/images/maria.jpg',
          is_featured: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockGetSpecials.mockResolvedValue([]);
      mockGetTestimonials.mockResolvedValue(complexTestimonials);

      render(await HomePage());

      expect(mockGetTestimonials).toHaveBeenCalledWith(4);

      expect(
        screen.getByText('Testimonials Section (1 items)'),
      ).toBeInTheDocument();
    });
  });
});

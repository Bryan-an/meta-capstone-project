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
import { getTranslations, getLocale } from 'next-intl/server';

import { SpecialsSection } from '../specials-section';
import { type Database } from '@/types/supabase';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
  getLocale: vi.fn(),
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

vi.mock('@/components/ui/button', () => ({
  Button: (
    { children, asChild, size, variant, className, ...props }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => (
    <button
      data-testid="button"
      data-as-child={asChild}
      data-size={size}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({
    title,
    description,
    className,
    ...props
  }: {
    title: string;
    description: string;
    className?: string;
  }) => (
    <div data-testid="empty-state" className={className} {...props}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/cards/special-card', () => ({
  SpecialCard: ({
    name,
    description,
    price,
    imageUrl,
    orderLinkText,
  }: {
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    orderLinkText: string;
  }) => (
    <div data-testid="special-card">
      <h3 data-testid="special-name">{name}</h3>
      <p data-testid="special-description">{description}</p>
      <span data-testid="special-price">${price.toFixed(2)}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="special-image"
        src={imageUrl || '/images/placeholder-food.webp'}
        alt={name}
      />
      <a data-testid="special-order-link">{orderLinkText}</a>
    </div>
  ),
}));

const mockGetTranslations = vi.mocked(getTranslations);
const mockGetLocale = vi.mocked(getLocale);

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

type FetchedSpecial = Pick<
  Database['public']['Tables']['specials']['Row'],
  'id' | 'start_date' | 'end_date'
> & {
  menu_items: MenuItem | null | MenuItem[];
};

/**
 * Test suite for the SpecialsSection component
 *
 * @remarks
 * Tests cover rendering, translations, data handling, empty states, and edge cases
 * for the server-side specials section component.
 */
describe('SpecialsSection', () => {
  beforeAll(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSpecialsTranslations = ((key: string) => {
      const translations: Record<string, string> = {
        title: "This Week's Specials",
        menuButton: 'Online Menu',
        orderLink: 'Order Online',
        noSpecialsMessage: 'No specials available at this time.',
      };

      return translations[key] || key;
    }) as unknown;

    mockGetTranslations.mockResolvedValue(
      mockSpecialsTranslations as Awaited<ReturnType<typeof getTranslations>>,
    );

    mockGetLocale.mockResolvedValue('en');
  });

  describe('Basic Rendering', () => {
    it('should render the specials section with correct structure', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      // Check section structure
      const section = document.querySelector('section')!;
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('px-4', 'py-16', 'md:px-8', 'lg:px-16');

      // Check container
      const container = section.querySelector('.container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mx-auto', 'max-w-6xl');
    });

    it('should render the section title', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("This Week's Specials");

      expect(title).toHaveClass(
        'text-primary',
        'text-3xl',
        'font-medium',
        'sm:text-4xl',
      );
    });

    it('should render the menu button', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const menuButton = screen.getByTestId('button');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('data-size', 'lg');
      expect(menuButton).toHaveAttribute('data-as-child', 'true');
      expect(menuButton).toHaveTextContent('Online Menu');

      const menuLink = screen.getByTestId('link--menu');
      expect(menuLink).toBeInTheDocument();
      expect(menuLink).toHaveAttribute('href', '/menu');
    });
  });

  describe('Empty State Handling', () => {
    it('should render empty state when specials array is empty', async () => {
      const SpecialsSectionComponent = await SpecialsSection({ specials: [] });
      render(SpecialsSectionComponent);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass('mt-8');

      expect(screen.getByText("This Week's Specials")).toBeInTheDocument();

      expect(
        screen.getByText('No specials available at this time.'),
      ).toBeInTheDocument();
    });

    it('should render empty state when specials is null', async () => {
      const SpecialsSectionComponent = await SpecialsSection({
        specials: null as unknown as FetchedSpecial[],
      });

      render(SpecialsSectionComponent);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
    });

    it('should render empty state when specials is undefined', async () => {
      const SpecialsSectionComponent = await SpecialsSection({
        specials: undefined as unknown as FetchedSpecial[],
      });

      render(SpecialsSectionComponent);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Special Cards Rendering', () => {
    it('should render special cards for valid menu items', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
        {
          id: 2,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 2,
            category_id: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 12.5,
            image_url: '/images/pasta-special.webp',
            i18n_content: {
              en: {
                name: 'Pasta Primavera',
                description: 'Seasonal vegetables with fresh pasta',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const specialCards = screen.getAllByTestId('special-card');
      expect(specialCards).toHaveLength(2);

      // Check first special
      expect(screen.getByText('Grilled Salmon')).toBeInTheDocument();

      expect(
        screen.getByText('Fresh Atlantic salmon with herbs'),
      ).toBeInTheDocument();

      expect(screen.getByText('$15.99')).toBeInTheDocument();

      // Check second special
      expect(screen.getByText('Pasta Primavera')).toBeInTheDocument();

      expect(
        screen.getByText('Seasonal vegetables with fresh pasta'),
      ).toBeInTheDocument();

      expect(screen.getByText('$12.50')).toBeInTheDocument();
    });

    it('should render grid layout for special cards', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const gridContainer = screen.getByTestId('special-card').parentElement;

      expect(gridContainer).toHaveClass(
        'grid',
        'gap-8',
        'md:grid-cols-2',
        'lg:grid-cols-3',
      );
    });

    it('should handle array of menu items (taking first item)', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: [
            {
              id: 1,
              category_id: 1,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              price: 15.99,
              image_url: '/images/special-dish.webp',
              i18n_content: {
                en: {
                  name: 'First Special',
                  description: 'First special description',
                },
              },
            },
            {
              id: 2,
              category_id: 1,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              price: 18.99,
              image_url: '/images/second-special.webp',
              i18n_content: {
                en: {
                  name: 'Second Special',
                  description: 'Second special description',
                },
              },
            },
          ],
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      // Should only render the first item from the array
      expect(screen.getByText('First Special')).toBeInTheDocument();
      expect(screen.queryByText('Second Special')).not.toBeInTheDocument();
    });
  });

  describe('Data Filtering and Validation', () => {
    it('should skip specials with null menu items', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: null,
        },
        {
          id: 2,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 2,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Valid Special',
                description: 'Valid special description',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const specialCards = screen.getAllByTestId('special-card');
      expect(specialCards).toHaveLength(1);
      expect(screen.getByText('Valid Special')).toBeInTheDocument();
    });

    it('should skip specials with menu items lacking i18n_content', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: null,
          },
        },
        {
          id: 2,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 2,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Valid Special',
                description: 'Valid special description',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const specialCards = screen.getAllByTestId('special-card');
      expect(specialCards).toHaveLength(1);
      expect(screen.getByText('Valid Special')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should call getTranslations with correct namespace', async () => {
      const mockSpecials: FetchedSpecial[] = [];

      await SpecialsSection({ specials: mockSpecials });

      expect(mockGetTranslations).toHaveBeenCalledWith('Specials');
    });

    it('should call getLocale to determine current locale', async () => {
      const mockSpecials: FetchedSpecial[] = [];

      await SpecialsSection({ specials: mockSpecials });

      expect(mockGetLocale).toHaveBeenCalled();
    });

    it('should use localized content for Spanish locale', async () => {
      mockGetLocale.mockResolvedValue('es');

      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
              es: {
                name: 'Salmón a la Parrilla',
                description: 'Salmón del Atlántico fresco con hierbas',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      expect(screen.getByText('Salmón a la Parrilla')).toBeInTheDocument();

      expect(
        screen.getByText('Salmón del Atlántico fresco con hierbas'),
      ).toBeInTheDocument();
    });

    it('should fallback to English when locale content is missing', async () => {
      mockGetLocale.mockResolvedValue('fr'); // Unsupported locale

      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      expect(screen.getByText('Grilled Salmon')).toBeInTheDocument();

      expect(
        screen.getByText('Fresh Atlantic salmon with herbs'),
      ).toBeInTheDocument();
    });

    it('should use fallback name when no localized name is available', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                description: 'A delicious dish',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      expect(screen.getByText('Unnamed Item')).toBeInTheDocument();
    });

    it('should handle different translation values', async () => {
      const mockSpanishTranslations = ((key: string) => {
        const translations: Record<string, string> = {
          title: 'Especiales de Esta Semana',
          menuButton: 'Menú en Línea',
          orderLink: 'Pedir en Línea',
          noSpecialsMessage: 'No hay especiales disponibles en este momento.',
        };

        return translations[key] || key;
      }) as unknown;

      mockGetTranslations.mockResolvedValue(
        mockSpanishTranslations as Awaited<ReturnType<typeof getTranslations>>,
      );

      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      expect(screen.getByText('Especiales de Esta Semana')).toBeInTheDocument();
      expect(screen.getByText('Menú en Línea')).toBeInTheDocument();
      expect(screen.getByText('Pedir en Línea')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to SpecialCard components', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const specialCard = screen.getByTestId('special-card');
      expect(specialCard).toBeInTheDocument();

      expect(screen.getByTestId('special-name')).toHaveTextContent(
        'Grilled Salmon',
      );

      expect(screen.getByTestId('special-description')).toHaveTextContent(
        'Fresh Atlantic salmon with herbs',
      );

      expect(screen.getByTestId('special-price')).toHaveTextContent('$15.99');

      expect(screen.getByTestId('special-order-link')).toHaveTextContent(
        'Order Online',
      );

      const specialImage = screen.getByTestId('special-image');
      expect(specialImage).toHaveAttribute('src', '/images/special-dish.webp');
      expect(specialImage).toHaveAttribute('alt', 'Grilled Salmon');
    });

    it('should integrate with Button component correctly', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('data-as-child', 'true');
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('should integrate with Link component correctly', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const menuLink = screen.getByTestId('link--menu');
      expect(menuLink).toHaveAttribute('href', '/menu');
    });

    it('should integrate with EmptyState component correctly', async () => {
      const SpecialsSectionComponent = await SpecialsSection({ specials: [] });
      render(SpecialsSectionComponent);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass('mt-8');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct section styling', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const section = document.querySelector('section')!;
      expect(section).toHaveClass('px-4', 'py-16', 'md:px-8', 'lg:px-16');
    });

    it('should apply correct container styling', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const container = document
        .querySelector('section')!
        .querySelector('.container');

      expect(container).toHaveClass('container', 'mx-auto', 'max-w-6xl');
    });

    it('should apply correct header styling', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const headerContainer = screen.getByRole('heading', {
        level: 2,
      }).parentElement;

      expect(headerContainer).toHaveClass(
        'mb-6',
        'flex',
        'flex-col',
        'items-center',
        'justify-between',
        'gap-6',
        'sm:mb-12',
        'sm:flex-row',
      );
    });

    it('should apply correct title styling', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const title = screen.getByRole('heading', { level: 2 });

      expect(title).toHaveClass(
        'text-primary',
        'text-center',
        'text-3xl',
        'font-medium',
        'sm:text-start',
        'sm:text-4xl',
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed i18n_content gracefully', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: 'invalid-json-structure' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      // Should not crash and should use fallback
      expect(screen.getByText('Unnamed Item')).toBeInTheDocument();
    });

    it('should handle missing description gracefully', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                // description is missing
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      expect(screen.getByText('Grilled Salmon')).toBeInTheDocument();
      const descriptionElement = screen.getByTestId('special-description');
      expect(descriptionElement).toHaveTextContent(''); // Should be empty/null
    });

    it('should handle zero price correctly', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 0,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Free Sample',
                description: 'Complimentary tasting',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle missing image URL', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: null,
            i18n_content: {
              en: {
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon with herbs',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const specialImage = screen.getByTestId('special-image');

      expect(specialImage).toHaveAttribute(
        'src',
        '/images/placeholder-food.webp',
      );
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large numbers of specials efficiently', async () => {
      const mockSpecials: FetchedSpecial[] = Array.from(
        { length: 50 },
        (_, index) => ({
          id: index + 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: index + 1,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99 + index,
            image_url: `/images/special-${index + 1}.webp`,
            i18n_content: {
              en: {
                name: `Special ${index + 1}`,
                description: `Description for special ${index + 1}`,
              },
            },
          },
        }),
      );

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const specialCards = screen.getAllByTestId('special-card');
      expect(specialCards).toHaveLength(50);
    });

    it('should not render cards for filtered out specials', async () => {
      const mockSpecials: FetchedSpecial[] = [
        {
          id: 1,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: null, // This should be filtered out
        },
        {
          id: 2,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 2,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: null, // This should be filtered out
          },
        },
        {
          id: 3,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          menu_items: {
            id: 3,
            category_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            price: 15.99,
            image_url: '/images/special-dish.webp',
            i18n_content: {
              en: {
                name: 'Valid Special',
                description: 'Valid description',
              },
            },
          },
        },
      ];

      const SpecialsSectionComponent = await SpecialsSection({
        specials: mockSpecials,
      });

      render(SpecialsSectionComponent);

      const specialCards = screen.getAllByTestId('special-card');
      expect(specialCards).toHaveLength(1); // Only the valid one should render
      expect(screen.getByText('Valid Special')).toBeInTheDocument();
    });
  });
});

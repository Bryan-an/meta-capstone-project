/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReservationsPage from '../page';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';
import { createClient } from '@/lib/supabase/server';
import { getUserReservations } from '@/lib/data/reservations';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type React from 'react';

// Type definitions for mocked components and functions
interface MockLinkProps {
  children: React.ReactNode;
  href: string | { pathname: string };
  [key: string]: unknown;
}

interface MockReservationCardProps {
  reservation: { id: string; reservation_date: string };
  locale: string;
}

interface MockButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  [key: string]: unknown;
}

interface MockEmptyStateProps {
  title: string;
  description: string;
  actionButtonProps?: {
    children: React.ReactNode;
    [key: string]: unknown;
  };
}

// Mock function types
type MockFunction = ReturnType<typeof vi.fn>;

type MockSupabaseClient = {
  auth: {
    getUser: MockFunction;
  };
};

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/data/reservations', () => ({
  getUserReservations: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: MockLinkProps) => (
    <a href={typeof href === 'string' ? href : href.pathname} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/cards/reservation-card', () => ({
  ReservationCard: ({ reservation, locale }: MockReservationCardProps) => (
    <div data-testid={`reservation-card-${reservation.id}`}>
      <span data-testid="reservation-date">{reservation.reservation_date}</span>
      <span data-testid="reservation-locale">{locale}</span>
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: MockButtonProps) => {
    if (asChild) {
      return <div {...props}>{children}</div>;
    }

    return <button {...props}>{children}</button>;
  },
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({
    title,
    description,
    actionButtonProps,
  }: MockEmptyStateProps) => (
    <div data-testid="empty-state">
      <h2 data-testid="empty-state-title">{title}</h2>
      <p data-testid="empty-state-description">{description}</p>

      {actionButtonProps && (
        <div data-testid="empty-state-action">{actionButtonProps.children}</div>
      )}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  PlusCircle: () => <div data-testid="plus-circle-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
}));

// Mock translations
const createMockTranslations = (namespace: string) => {
  const translations = {
    ReservationsPage: {
      title: 'My Reservations',
      newReservationButton: 'Make a New Reservation',
      noReservationsFound: 'You have no reservations yet.',
      noReservationsFoundDescription:
        'Why not book your next visit? It only takes a minute!',
    },
    Common: {
      errorTitle: 'Error',
      genericError: 'An unexpected error occurred. Please try again later.',
    },
    ErrorPage: {
      tryAgain: 'Try Again',
    },
  };

  return vi.fn((key: string) => {
    const keys = key.split('.');
    let value: unknown = translations[namespace as keyof typeof translations];

    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }

    return (value as string) || key;
  });
};

// Sample reservation data
const mockReservation: ReservationWithTableDetails = {
  id: 1,
  user_id: 'user-123',
  reservation_date: '2025-02-15',
  reservation_time: '19:00:00',
  party_size: 4,
  status: 'confirmed',
  customer_notes_i18n: { en: 'Birthday celebration' },
  internal_notes_i18n: null,
  table_id: 1,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  restaurant_tables: {
    table_number: 'T1',
    description_i18n: { en: 'Window table' },
    capacity: 4,
  },
};

describe('ReservationsPage', () => {
  const mockSupabaseClient: MockSupabaseClient = {
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (createClient as any).mockResolvedValue(mockSupabaseClient);

    (getTranslations as any).mockImplementation(
      ({ namespace }: { namespace: string }) =>
        Promise.resolve(createMockTranslations(namespace)),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to login when user is not authenticated', async () => {
      // Mock no user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // The redirect function throws to prevent further execution
      (redirect as any).mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });

      try {
        await ReservationsPage({ params: Promise.resolve({ locale: 'en' }) });
      } catch {
        // Expected redirect error
      }

      expect(redirect).toHaveBeenCalledWith('/en/login?next=/en/reservations');
    });

    it('should redirect to login with correct locale when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // The redirect function throws to prevent further execution
      (redirect as any).mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });

      try {
        await ReservationsPage({ params: Promise.resolve({ locale: 'es' }) });
      } catch {
        // Expected redirect error
      }

      expect(redirect).toHaveBeenCalledWith('/es/login?next=/es/reservations');
    });
  });

  describe('Error States', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should render error state when getUserReservations returns null', async () => {
      (getUserReservations as any).mockResolvedValue(null);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      expect(screen.getByText('My Reservations')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(
        'Error',
      );

      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
        'An unexpected error occurred. Please try again later.',
      );
    });

    it('should render error state with Try Again link', async () => {
      (getUserReservations as any).mockResolvedValue(null);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      const actionElement = screen.getByTestId('empty-state-action');
      expect(actionElement).toBeInTheDocument();

      const link = actionElement.querySelector('a');
      expect(link).toHaveAttribute('href', '/reservations');
      expect(link).toHaveTextContent('Try Again');
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should render empty state when user has no reservations', async () => {
      (getUserReservations as any).mockResolvedValue([]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      expect(screen.getByText('My Reservations')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(
        'You have no reservations yet.',
      );

      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
        'Why not book your next visit? It only takes a minute!',
      );
    });

    it('should render Make a New Reservation button in empty state', async () => {
      (getUserReservations as any).mockResolvedValue([]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      const actionElement = screen.getByTestId('empty-state-action');
      const link = actionElement.querySelector('a');
      expect(link).toHaveAttribute('href', '/reservations/new');
      expect(link).toHaveTextContent('Make a New Reservation');
    });
  });

  describe('Reservations Display', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should render page header with title and new reservation button', async () => {
      (getUserReservations as any).mockResolvedValue([mockReservation]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      // Check title
      expect(screen.getByText('My Reservations')).toBeInTheDocument();

      // Check new reservation button
      const newReservationLink = screen.getByRole('link', {
        name: /make a new reservation/i,
      });

      expect(newReservationLink).toHaveAttribute('href', '/reservations/new');
    });

    it('should render single reservation card', async () => {
      (getUserReservations as any).mockResolvedValue([mockReservation]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      expect(screen.getByTestId('reservation-card-1')).toBeInTheDocument();

      expect(screen.getByTestId('reservation-date')).toHaveTextContent(
        '2025-02-15',
      );

      expect(screen.getByTestId('reservation-locale')).toHaveTextContent('en');
    });

    it('should render multiple reservation cards', async () => {
      const secondReservation: ReservationWithTableDetails = {
        ...mockReservation,
        id: 2,
        reservation_date: '2025-03-01',
      };

      (getUserReservations as any).mockResolvedValue([
        mockReservation,
        secondReservation,
      ]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      expect(screen.getByTestId('reservation-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('reservation-card-2')).toBeInTheDocument();
    });

    it('should pass correct locale to reservation cards', async () => {
      (getUserReservations as any).mockResolvedValue([mockReservation]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'es' }),
      });

      render(component);

      expect(screen.getByTestId('reservation-locale')).toHaveTextContent('es');
    });

    it('should render reservations in a grid layout', async () => {
      const reservations = [
        { ...mockReservation, id: '1' },
        { ...mockReservation, id: '2' },
        { ...mockReservation, id: '3' },
      ];

      (getUserReservations as any).mockResolvedValue(reservations);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      const gridContainer =
        screen.getByTestId('reservation-card-1').parentElement;

      expect(gridContainer).toHaveClass(
        'grid',
        'gap-6',
        'md:grid-cols-2',
        'lg:grid-cols-3',
      );
    });
  });

  describe('Responsive Layout', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should render with correct container classes', async () => {
      (getUserReservations as any).mockResolvedValue([]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      // The title is in an h1, which is inside the header div, which is inside the inner container, which is inside the outer container
      const outerContainer = screen.getByText('My Reservations').closest('div')
        ?.parentElement?.parentElement;

      expect(outerContainer).toHaveClass(
        'px-4',
        'py-16',
        'md:px-8',
        'lg:px-16',
      );

      const innerContainer = screen
        .getByText('My Reservations')
        .closest('div')?.parentElement;

      expect(innerContainer).toHaveClass('container', 'mx-auto', 'max-w-6xl');
    });

    it('should render header with responsive flex layout', async () => {
      (getUserReservations as any).mockResolvedValue([mockReservation]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      const headerContainer = screen.getByText('My Reservations').parentElement;

      expect(headerContainer).toHaveClass(
        'mb-8',
        'flex',
        'flex-col',
        'items-center',
        'justify-between',
        'gap-4',
        'md:flex-row',
      );
    });
  });

  describe('Integration', () => {
    it('should call getUserReservations with correct user ID', async () => {
      const userId = 'test-user-123';

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });

      (getUserReservations as any).mockResolvedValue([]);

      await ReservationsPage({ params: Promise.resolve({ locale: 'en' }) });

      expect(getUserReservations).toHaveBeenCalledWith(userId);
    });

    it('should fetch translations for all required namespaces', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (getUserReservations as any).mockResolvedValue([]);

      await ReservationsPage({ params: Promise.resolve({ locale: 'en' }) });

      expect(getTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'ReservationsPage',
      });

      expect(getTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'Common',
      });

      expect(getTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'ErrorPage',
      });
    });

    it('should handle async params correctly', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (getUserReservations as any).mockResolvedValue([]);

      const asyncParams = Promise.resolve({ locale: 'es' });
      await ReservationsPage({ params: asyncParams });

      expect(getTranslations).toHaveBeenCalledWith({
        locale: 'es',
        namespace: 'ReservationsPage',
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should render page title as h1', async () => {
      (getUserReservations as any).mockResolvedValue([]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('My Reservations');
    });

    it('should have proper heading hierarchy', async () => {
      (getUserReservations as any).mockResolvedValue([]);

      const component = await ReservationsPage({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(component);

      // Main page title should be h1
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('My Reservations');

      // Empty state title should be h2 (from EmptyState component)
      const emptyStateHeading = screen.getByTestId('empty-state-title');
      expect(emptyStateHeading.tagName).toBe('H2');
    });
  });
});

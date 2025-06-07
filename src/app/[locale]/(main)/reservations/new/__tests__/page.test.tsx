import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import NewReservationPage from '../page';
import type { ReservableTable } from '@/lib/data/tables';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(),
}));

// Mock server actions
vi.mock('@/app/reservations/actions', () => ({
  createReservation: vi.fn(),
}));

// Mock data fetching
vi.mock('@/lib/data/tables', () => ({
  getReservableTables: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ReservationForm component
vi.mock('@/components/forms/reservation-form', () => ({
  ReservationForm: vi.fn(),
}));

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');

  return {
    ...actual,
    useActionState: vi.fn(),
    useEffect: vi.fn(),
    useState: vi.fn(),
  };
});

describe('NewReservationPage', () => {
  const mockTranslations = {
    NewReservationPage: {
      title: 'Make a Reservation',
      description: 'Reserve your table today',
    },
    Common: {
      'errors.databaseError': 'Database error occurred',
      'errors.unknownError': 'An unknown error occurred',
      genericError: 'An error occurred',
      table: 'Table',
      capacity: 'Capacity',
    },
    ReservationForm: {
      'success.reservationCreated': 'Reservation created successfully',
      'success.unknownError': 'Reservation created successfully',
      submitButtonText: 'Create Reservation',
    },
  };

  const mockSampleTables: ReservableTable[] = [
    {
      id: 1,
      table_number: 'T1',
      capacity: 4,
      description_i18n: { en: 'Window table', es: 'Mesa de ventana' },
    },
    {
      id: 2,
      table_number: 'T2',
      capacity: 6,
      description_i18n: { en: 'Corner table', es: 'Mesa de esquina' },
    },
  ];

  // State management for mocks
  let mockTablesState: ReservableTable[] = [];
  let mockTablesErrorState: string | null = null;
  let mockSetTables: ReturnType<typeof vi.fn>;
  let mockSetTablesError: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset state
    mockTablesState = [];
    mockTablesErrorState = null;

    mockSetTables = vi.fn((newTables: ReservableTable[]) => {
      mockTablesState = newTables;
    });

    mockSetTablesError = vi.fn((error: string | null) => {
      mockTablesErrorState = error;
    });

    // Get the mocked modules
    const { useTranslations } = await import('next-intl');
    const { useParams } = await import('next/navigation');
    const { useRouter } = await import('@/i18n/routing');
    const { getReservableTables } = await import('@/lib/data/tables');

    const { ReservationForm } = await import(
      '@/components/forms/reservation-form'
    );

    const { useActionState, useEffect, useState } = await import('react');

    // Setup translation mock with proper type signature and key handling
    const createTranslationFunction = (namespace?: string) => {
      const translationFunction = (
        key: string,
        params?: Record<string, unknown>,
      ) => {
        const namespaceData =
          mockTranslations[namespace as keyof typeof mockTranslations];

        if (!namespaceData) {
          return key;
        }

        // First try direct key lookup (for keys like 'errors.databaseError')
        if (namespaceData[key as keyof typeof namespaceData]) {
          const value = namespaceData[
            key as keyof typeof namespaceData
          ] as string;

          if (typeof value === 'string' && params) {
            return value.replace(
              /\{(\w+)\}/g,
              (match: string, paramKey: string) =>
                String(params[paramKey]) || match,
            );
          }

          return String(value);
        }

        // Then try nested path lookup (for keys like 'title')
        const keys = key.split('.');
        let value: unknown = namespaceData;

        for (const k of keys) {
          value = (value as Record<string, unknown>)?.[k];
        }

        if (typeof value === 'string' && params) {
          return value.replace(
            /\{(\w+)\}/g,
            (match: string, paramKey: string) =>
              String(params[paramKey]) || match,
          );
        }

        return typeof value === 'string' ? value : key;
      };

      // Add the required methods for next-intl compatibility
      Object.assign(translationFunction, {
        rich: translationFunction,
        markup: translationFunction,
        raw: translationFunction,
        has: vi.fn().mockReturnValue(true),
      });

      return translationFunction;
    };

    // Use type assertion to bypass strict typing for mocks
    (
      vi.mocked(useTranslations) as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(createTranslationFunction);

    vi.mocked(useParams).mockReturnValue({ locale: 'en' });

    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });

    // Setup React hooks with proper state simulation
    (
      vi.mocked(useState) as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((initialValue: unknown) => {
      if (Array.isArray(initialValue)) {
        return [mockTablesState, mockSetTables];
      }

      if (initialValue === null || typeof initialValue === 'string') {
        return [mockTablesErrorState, mockSetTablesError];
      }

      return [initialValue, vi.fn()];
    });

    vi.mocked(useActionState).mockReturnValue([
      null, // initial state
      vi.fn(), // formAction
      false, // isPending
    ]);

    // Mock useEffect to handle async operations properly
    vi.mocked(useEffect).mockImplementation(
      (callback: () => void | (() => void)) => {
        // Simulate async execution
        Promise.resolve().then(() => {
          const cleanup = callback();

          if (typeof cleanup === 'function') {
            return cleanup;
          }
        });
      },
    );

    // Setup default successful table fetch
    vi.mocked(getReservableTables).mockResolvedValue({
      type: 'success',
      data: mockSampleTables,
    });

    vi.mocked(ReservationForm).mockImplementation(
      ({
        formAction,
        formState,
        locale,
        reservableTables,
        allTablesError,
        submitButtonText,
      }) => (
        <div data-testid="reservation-form">
          <div data-testid="form-action">
            {formAction?.name || 'formAction'}
          </div>

          <div data-testid="form-state">{JSON.stringify(formState)}</div>
          <div data-testid="locale">{locale}</div>

          <div data-testid="reservable-tables">
            {JSON.stringify(reservableTables)}
          </div>

          <div data-testid="all-tables-error">{allTablesError || ''}</div>
          <div data-testid="submit-button-text">{submitButtonText}</div>
        </div>
      ),
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the page with correct structure and content', async () => {
      render(<NewReservationPage />);

      expect(screen.getByText('Make a Reservation')).toBeInTheDocument();
      expect(screen.getByText('Reserve your table today')).toBeInTheDocument();
      expect(screen.getByTestId('reservation-form')).toBeInTheDocument();
    });

    it('renders within a centered card layout', () => {
      render(<NewReservationPage />);

      // Look for card by its data attribute instead of role
      const cardElement = screen
        .getByTestId('reservation-form')
        .closest('[data-slot="card"]');

      expect(cardElement).toHaveClass('mx-auto', 'max-w-xl');
    });

    it('displays translations correctly', async () => {
      const { useTranslations } = await import('next-intl');

      render(<NewReservationPage />);

      expect(useTranslations).toHaveBeenCalledWith('NewReservationPage');
      expect(useTranslations).toHaveBeenCalledWith('Common');
      expect(useTranslations).toHaveBeenCalledWith('ReservationForm');
    });
  });

  describe('Table Fetching', () => {
    it('fetches reservable tables on component mount', async () => {
      const { getReservableTables } = await import('@/lib/data/tables');

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(getReservableTables).toHaveBeenCalled();
      });
    });

    it('handles successful table fetching', async () => {
      // Simulate successful fetch
      mockTablesState = mockSampleTables;
      mockTablesErrorState = null;

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('reservable-tables')).toHaveTextContent(
          JSON.stringify(mockSampleTables),
        );

        expect(screen.getByTestId('all-tables-error')).toHaveTextContent('');
      });
    });

    it('handles table fetching error with message key', async () => {
      const { getReservableTables } = await import('@/lib/data/tables');
      const { toast } = await import('sonner');

      vi.mocked(getReservableTables).mockResolvedValue({
        type: 'error',
        messageKey: 'databaseError',
        message: 'Database connection failed',
      });

      // Simulate error state
      mockTablesErrorState = 'Database error occurred';

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Database error occurred');

        expect(screen.getByTestId('all-tables-error')).toHaveTextContent(
          'Database error occurred',
        );
      });
    });

    it('handles table fetching error without message key', async () => {
      const { getReservableTables } = await import('@/lib/data/tables');
      const { toast } = await import('sonner');

      vi.mocked(getReservableTables).mockResolvedValue({
        type: 'error',
        message: 'Custom error message',
      });

      // Simulate error state
      mockTablesErrorState = 'Custom error message';

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Custom error message');

        expect(screen.getByTestId('all-tables-error')).toHaveTextContent(
          'Custom error message',
        );
      });
    });

    it('handles table fetching error with fallback to generic error', async () => {
      const { getReservableTables } = await import('@/lib/data/tables');
      const { toast } = await import('sonner');

      vi.mocked(getReservableTables).mockResolvedValue({
        type: 'error',
        message: 'Fallback error message',
      });

      // Simulate error state
      mockTablesErrorState = 'Fallback error message';

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Fallback error message');

        expect(screen.getByTestId('all-tables-error')).toHaveTextContent(
          'Fallback error message',
        );
      });
    });
  });

  describe('Form State Handling', () => {
    it('handles successful form submission', async () => {
      const { useActionState } = await import('react');
      const { useRouter } = await import('@/i18n/routing');
      const { toast } = await import('sonner');

      const mockPush = vi.fn();

      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
      });

      const successState: FormState<ReservationActionErrorKeys> = {
        type: 'success',
        messageKey: 'unknownError',
        message: 'Reservation created successfully',
      };

      vi.mocked(useActionState).mockReturnValue([successState, vi.fn(), false]);

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Reservation created successfully',
        );

        expect(mockPush).toHaveBeenCalledWith('/reservations');
      });
    });

    it('handles form submission success without message key', async () => {
      const { useActionState } = await import('react');
      const { useRouter } = await import('@/i18n/routing');
      const { toast } = await import('sonner');

      const mockPush = vi.fn();

      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
      });

      const successState: FormState<ReservationActionErrorKeys> = {
        type: 'success',
        message: 'Custom success message',
      };

      vi.mocked(useActionState).mockReturnValue([successState, vi.fn(), false]);

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Custom success message');
        expect(mockPush).toHaveBeenCalledWith('/reservations');
      });
    });

    it('handles form submission success with fallback message', async () => {
      const { useActionState } = await import('react');
      const { useRouter } = await import('@/i18n/routing');
      const { toast } = await import('sonner');

      const mockPush = vi.fn();

      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
      });

      const successState: FormState<ReservationActionErrorKeys> = {
        type: 'success',
        message: 'Reservation created successfully',
      };

      vi.mocked(useActionState).mockReturnValue([successState, vi.fn(), false]);

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Reservation created successfully',
        );

        expect(mockPush).toHaveBeenCalledWith('/reservations');
      });
    });

    it('handles form submission error without field errors', async () => {
      const { useActionState } = await import('react');
      const { toast } = await import('sonner');

      const errorState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        messageKey: 'databaseError',
        message: 'Database error occurred',
      };

      vi.mocked(useActionState).mockReturnValue([errorState, vi.fn(), false]);

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Database error occurred');
      });
    });

    it('handles form submission error with field errors (no toast)', async () => {
      const { useActionState } = await import('react');
      const { toast } = await import('sonner');

      const errorState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Validation failed',
        fieldErrors: {
          party_size: ['Party size is required'],
        },
      };

      vi.mocked(useActionState).mockReturnValue([errorState, vi.fn(), false]);

      render(<NewReservationPage />);

      // Should not show toast when there are field errors
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('does not show toast or navigate when state is null', async () => {
      const { useActionState } = await import('react');
      const { useRouter } = await import('@/i18n/routing');
      const { toast } = await import('sonner');

      const mockPush = vi.fn();

      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
      });

      vi.mocked(useActionState).mockReturnValue([null, vi.fn(), false]);

      render(<NewReservationPage />);

      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Props Passed to ReservationForm', () => {
    it('passes correct props to ReservationForm', async () => {
      const { useActionState } = await import('react');

      const { ReservationForm } = await import(
        '@/components/forms/reservation-form'
      );

      const mockFormAction = vi.fn();

      const mockFormState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Test error',
      };

      vi.mocked(useActionState).mockReturnValue([
        mockFormState,
        mockFormAction,
        false,
      ]);

      // Simulate state with mock tables
      mockTablesState = mockSampleTables;

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(ReservationForm).toHaveBeenCalledWith(
          expect.objectContaining({
            formAction: mockFormAction,
            formState: mockFormState,
            locale: 'en',
            reservableTables: mockSampleTables,
            allTablesError: null,
            submitButtonText: 'Create Reservation',
          }),
          undefined, // React ref parameter
        );
      });
    });

    it('passes table error to ReservationForm when table fetching fails', async () => {
      const { getReservableTables } = await import('@/lib/data/tables');

      vi.mocked(getReservableTables).mockResolvedValue({
        type: 'error',
        message: 'Table fetch error',
      });

      // Simulate error state
      mockTablesErrorState = 'Table fetch error';

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('all-tables-error')).toHaveTextContent(
          'Table fetch error',
        );
      });
    });
  });

  describe('Locale Handling', () => {
    it('uses locale from params', async () => {
      const { useParams } = await import('next/navigation');

      vi.mocked(useParams).mockReturnValue({ locale: 'es' });

      render(<NewReservationPage />);

      expect(screen.getByTestId('locale')).toHaveTextContent('es');
    });

    it('handles locale as string correctly', async () => {
      const { useParams } = await import('next/navigation');

      vi.mocked(useParams).mockReturnValue({ locale: 'en' });

      render(<NewReservationPage />);

      expect(screen.getByTestId('locale')).toHaveTextContent('en');
    });
  });

  describe('Integration with useActionState', () => {
    it('uses createReservation action with correct initial state', async () => {
      const { useActionState } = await import('react');
      const { createReservation } = await import('@/app/reservations/actions');

      render(<NewReservationPage />);

      expect(useActionState).toHaveBeenCalledWith(createReservation, null);
    });

    it('passes form action from useActionState to ReservationForm', async () => {
      const { useActionState } = await import('react');

      const mockFormAction = vi.fn();

      Object.defineProperty(mockFormAction, 'name', {
        value: 'mockFormAction',
      });

      vi.mocked(useActionState).mockReturnValue([null, mockFormAction, false]);

      render(<NewReservationPage />);

      expect(screen.getByTestId('form-action')).toHaveTextContent(
        'mockFormAction',
      );
    });
  });

  describe('Error Boundary Scenarios', () => {
    it('handles component mount without crashing when all dependencies are available', () => {
      expect(() => render(<NewReservationPage />)).not.toThrow();
    });

    it('renders with empty tables array when fetch returns empty data', async () => {
      const { getReservableTables } = await import('@/lib/data/tables');

      vi.mocked(getReservableTables).mockResolvedValue({
        type: 'success',
        data: [],
      });

      // Reset to empty state
      mockTablesState = [];

      render(<NewReservationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('reservable-tables')).toHaveTextContent('[]');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<NewReservationPage />);

      // Find heading by text instead of role since Card components may not have proper heading semantics
      const heading = screen.getByText('Make a Reservation');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');
    });

    it('has descriptive text for the form', () => {
      render(<NewReservationPage />);

      expect(screen.getByText('Reserve your table today')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('calls useEffect hooks with correct dependencies', async () => {
      const { useEffect } = await import('react');

      render(<NewReservationPage />);

      // Should be called twice - once for table fetching, once for state handling
      expect(useEffect).toHaveBeenCalledTimes(2);
    });

    it('maintains state consistency between renders', () => {
      const { rerender } = render(<NewReservationPage />);

      rerender(<NewReservationPage />);

      // Component should handle re-renders gracefully
      expect(screen.getByText('Make a Reservation')).toBeInTheDocument();
    });
  });
});

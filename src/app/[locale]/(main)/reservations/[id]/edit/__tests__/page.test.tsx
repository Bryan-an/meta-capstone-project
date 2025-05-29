'use client';

import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { toast } from 'sonner';
import EditReservationPage from '../page';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';
import type { ReservableTable } from '@/lib/data/tables';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');

  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/app/reservations/actions', () => ({
  getReservationForEditAction: vi.fn(),
  updateReservationAction: vi.fn(),
}));

vi.mock('@/lib/data/tables', () => ({
  getReservableTables: vi.fn(),
}));

vi.mock('@/components/forms/reservation-form', () => ({
  ReservationForm: vi.fn(({ formState, submitButtonText }) => (
    <div data-testid="reservation-form">
      <div data-testid="submit-button">{submitButtonText}</div>

      {formState?.type === 'error' && (
        <div data-testid="form-error">{formState.message}</div>
      )}

      {formState?.type === 'success' && (
        <div data-testid="form-success">{formState.message}</div>
      )}
    </div>
  )),
}));

vi.mock('../loading', () => ({
  default: vi.fn(() => (
    <div data-testid="edit-reservation-loading">Loading...</div>
  )),
}));

const { getReservationForEditAction, updateReservationAction } = await import(
  '@/app/reservations/actions'
);

const { getReservableTables } = await import('@/lib/data/tables');
const { useRouter } = await import('@/i18n/routing');

const mockReservation: ReservationWithTableDetails = {
  id: 1,
  user_id: 'user-123',
  reservation_date: '2024-12-25',
  reservation_time: '18:00',
  party_size: 4,
  status: 'pending',
  customer_notes_i18n: { en: 'Birthday celebration' },
  internal_notes_i18n: null,
  table_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  restaurant_tables: {
    table_number: 'T1',
    description_i18n: { en: 'Window table' },
    capacity: 6,
  },
};

const mockReservableTables: ReservableTable[] = [
  {
    id: 1,
    table_number: 'T1',
    capacity: 6,
    description_i18n: { en: 'Window table' },
  },
  {
    id: 2,
    table_number: 'T2',
    capacity: 4,
    description_i18n: { en: 'Corner table' },
  },
];

/**
 * Test suite for the EditReservationPage component.
 *
 * @remarks
 * Tests cover loading states, error handling, successful data fetching,
 * form submission, navigation, and toast notifications.
 */
describe('EditReservationPage', () => {
  const mockPush = vi.fn();
  const mockFormAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParams).mockReturnValue({
      locale: 'en',
      id: '1',
    });

    // Create a simple mock that satisfies the TypeScript interface
    const mockT = vi.fn((key: string) => {
      const translations: Record<string, string> = {
        // EditReservationPage
        title: 'Edit Reservation',
        description: 'Modify your reservation details',
        updateButtonText: 'Update Reservation',
        'success.reservationUpdated': 'Reservation updated successfully',
        'errors.notFound': 'Reservation not found',
        'errors.updateFailed': 'Cannot update this reservation',
        // Common
        errorTitle: 'Error',
        genericError: 'Something went wrong',
        'errors.databaseError': 'Database error',
        // ReservationForm
        'success.updated': 'Reservation updated successfully',
      };

      return translations[key] || key;
    });

    // Add required properties to satisfy the interface
    Object.assign(mockT, {
      rich: vi.fn(),
      markup: vi.fn(),
      raw: vi.fn(),
      has: vi.fn(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useTranslations).mockReturnValue(mockT as any);

    // Create a proper router mock with all required methods
    const mockRouter = {
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);

    vi.mocked(useActionState).mockReturnValue([null, mockFormAction, false]);

    vi.mocked(getReservationForEditAction).mockResolvedValue({
      success: true,
      data: mockReservation,
    });

    vi.mocked(getReservableTables).mockResolvedValue({
      type: 'success',
      data: mockReservableTables,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading component initially', async () => {
      // Create delayed promises to simulate actual async behavior
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolveReservation: (value: any) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolveTables: (value: any) => void;

      const reservationPromise = new Promise((resolve) => {
        resolveReservation = resolve;
      });

      const tablesPromise = new Promise((resolve) => {
        resolveTables = resolve;
      });

      vi.mocked(getReservationForEditAction).mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reservationPromise as any,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(getReservableTables).mockReturnValue(tablesPromise as any);

      await act(async () => {
        render(<EditReservationPage />);
      });

      // Should show loading initially
      expect(
        screen.getByTestId('edit-reservation-loading'),
      ).toBeInTheDocument();

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Now resolve the promises
      act(() => {
        resolveReservation({
          success: true,
          data: mockReservation,
        });

        resolveTables({
          type: 'success',
          data: mockReservableTables,
        });
      });

      // Wait for the form to appear
      await waitFor(() => {
        expect(screen.getByTestId('reservation-form')).toBeInTheDocument();
      });

      // Loading should be gone
      expect(
        screen.queryByTestId('edit-reservation-loading'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error alert when reservation fetch fails', async () => {
      vi.mocked(getReservationForEditAction).mockResolvedValue({
        success: false,
        message: 'Database error',
      });

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Database error')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('reservation-form')).not.toBeInTheDocument();
    });

    it('should show error alert when reservation is not found', async () => {
      vi.mocked(getReservationForEditAction).mockResolvedValue({
        success: false,
        errorKey: 'notFound',
        message: 'Reservation not found',
      });

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Reservation not found')).toBeInTheDocument();
      });
    });

    it('should show error when reservationId is missing', async () => {
      vi.mocked(useParams).mockReturnValue({
        locale: 'en',
        id: undefined,
      });

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('should handle getReservationForEditAction throwing an error', async () => {
      vi.mocked(getReservationForEditAction).mockRejectedValue(
        new Error('Network error'),
      );

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Data Loading', () => {
    it('should render the form when reservation is loaded successfully', async () => {
      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('reservation-form')).toBeInTheDocument();
      });

      expect(screen.getByText('Edit Reservation')).toBeInTheDocument();

      expect(
        screen.getByText('Modify your reservation details'),
      ).toBeInTheDocument();

      expect(screen.getByTestId('submit-button')).toHaveTextContent(
        'Update Reservation',
      );
    });

    it('should pass correct props to ReservationForm', async () => {
      const { ReservationForm } = await import(
        '@/components/forms/reservation-form'
      );

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(ReservationForm).toHaveBeenCalledWith(
          expect.objectContaining({
            formAction: mockFormAction,
            formState: null,
            initialData: mockReservation,
            locale: 'en',
            reservableTables: mockReservableTables,
            allTablesError: null,
            submitButtonText: 'Update Reservation',
            reservationId: '1',
          }),
          undefined,
        );
      });
    });

    it('should handle tables fetch error gracefully', async () => {
      vi.mocked(getReservableTables).mockResolvedValue({
        type: 'error',
        message: 'Failed to fetch tables',
        messageKey: 'databaseError',
      });

      const { ReservationForm } = await import(
        '@/components/forms/reservation-form'
      );

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(ReservationForm).toHaveBeenCalledWith(
          expect.objectContaining({
            reservableTables: [],
            allTablesError: 'Database error',
          }),
          undefined,
        );
      });
    });

    it('should handle tables fetch throwing an error', async () => {
      vi.mocked(getReservableTables).mockRejectedValue(
        new Error('Network error'),
      );

      const { ReservationForm } = await import(
        '@/components/forms/reservation-form'
      );

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(ReservationForm).toHaveBeenCalledWith(
          expect.objectContaining({
            reservableTables: [],
            allTablesError: 'Something went wrong',
          }),
          undefined,
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should show success toast and navigate on successful form submission', async () => {
      const successState: FormState<ReservationActionErrorKeys> = {
        type: 'success',
        message: 'Reservation updated successfully',
      };

      vi.mocked(useActionState).mockReturnValue([
        successState,
        mockFormAction,
        false,
      ]);

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Reservation updated successfully',
        );

        expect(mockPush).toHaveBeenCalledWith('/reservations');
      });
    });

    it('should show error toast on form submission error without field errors', async () => {
      const errorState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Database error occurred',
        messageKey: 'databaseError',
      };

      vi.mocked(useActionState).mockReturnValue([
        errorState,
        mockFormAction,
        false,
      ]);

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Database error');
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not show error toast when there are field errors', async () => {
      const errorStateWithFieldErrors: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Validation failed',
        fieldErrors: {
          party_size: ['Party size is required'],
        },
      };

      vi.mocked(useActionState).mockReturnValue([
        errorStateWithFieldErrors,
        mockFormAction,
        false,
      ]);

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('reservation-form')).toBeInTheDocument();
      });

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should handle success state with fallback message', async () => {
      const successState: FormState<ReservationActionErrorKeys> = {
        type: 'success',
        message: 'Custom success message',
      };

      vi.mocked(useActionState).mockReturnValue([
        successState,
        mockFormAction,
        false,
      ]);

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Custom success message');
      });
    });

    it('should handle error state with translated message key', async () => {
      const errorState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Original message',
        messageKey: 'databaseError',
      };

      vi.mocked(useActionState).mockReturnValue([
        errorState,
        mockFormAction,
        false,
      ]);

      // Create a mock for translated error message
      const mockTWithError = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'errors.databaseError': 'Database connection failed',
          errorTitle: 'Error',
          genericError: 'Something went wrong',
        };

        return translations[key] || key;
      });

      Object.assign(mockTWithError, {
        rich: vi.fn(),
        markup: vi.fn(),
        raw: vi.fn(),
        has: vi.fn(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(useTranslations).mockReturnValue(mockTWithError as any);

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Database connection failed');
      });
    });
  });

  describe('Reservation Status Validation', () => {
    it('should show error when reservation cannot be edited due to status', async () => {
      vi.mocked(getReservationForEditAction).mockResolvedValue({
        success: false,
        errorKey: 'cannotEditStatus',
        message: 'Cannot update this reservation',
      });

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();

        expect(
          screen.getByText('Cannot update this reservation'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Component Unmounting and Cleanup', () => {
    it('should not cause memory leaks when component unmounts during loading', () => {
      const { unmount } = render(<EditReservationPage />);

      // Unmount before async operations complete
      unmount();

      // No assertions needed - this test ensures no errors are thrown
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on error alerts', async () => {
      vi.mocked(getReservationForEditAction).mockResolvedValue({
        success: false,
        message: 'Test error message',
      });

      render(<EditReservationPage />);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Test error message');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty reservation data', async () => {
      vi.mocked(getReservationForEditAction).mockResolvedValue({
        success: true,
        data: null,
      });

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Reservation not found')).toBeInTheDocument();
      });
    });

    it('should handle params with invalid ID format', async () => {
      vi.mocked(useParams).mockReturnValue({
        locale: 'en',
        id: 'invalid-id',
      });

      vi.mocked(getReservationForEditAction).mockResolvedValue({
        success: false,
        errorKey: 'notFound',
        message: 'Reservation not found',
      });

      render(<EditReservationPage />);

      await waitFor(() => {
        expect(getReservationForEditAction).toHaveBeenCalledWith('invalid-id');
      });
    });

    it('should handle missing locale in params', async () => {
      vi.mocked(useParams).mockReturnValue({
        locale: undefined,
        id: '1',
      });

      render(<EditReservationPage />);

      // Wait for the component to finish loading and render the form
      // Since the async operations resolve successfully, we should see the form
      await waitFor(() => {
        expect(screen.getByTestId('reservation-form')).toBeInTheDocument();
      });

      // Verify the component still works with undefined locale
      expect(screen.getByText('Edit Reservation')).toBeInTheDocument();
    });
  });

  describe('Integration with useActionState', () => {
    it('should pass the correct updateReservationAction to useActionState', async () => {
      await act(async () => {
        render(<EditReservationPage />);
      });

      expect(vi.mocked(useActionState)).toHaveBeenCalledWith(
        updateReservationAction,
        null,
      );

      // Wait for async operations to complete
      await waitFor(() => {
        expect(
          screen.queryByTestId('edit-reservation-loading'),
        ).not.toBeInTheDocument();
      });
    });

    it('should handle form state changes correctly', async () => {
      const initialState: FormState<ReservationActionErrorKeys> = null;

      const updatedState: FormState<ReservationActionErrorKeys> = {
        type: 'success',
        message: 'Updated successfully',
      };

      // First render with initial state
      vi.mocked(useActionState).mockReturnValue([
        initialState,
        mockFormAction,
        false,
      ]);

      const { rerender } = render(<EditReservationPage />);

      await waitFor(() => {
        expect(screen.getByTestId('reservation-form')).toBeInTheDocument();
      });

      // Simulate form state update
      await act(async () => {
        vi.mocked(useActionState).mockReturnValue([
          updatedState,
          mockFormAction,
          false,
        ]);

        rerender(<EditReservationPage />);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Updated successfully');
      });
    });
  });
});

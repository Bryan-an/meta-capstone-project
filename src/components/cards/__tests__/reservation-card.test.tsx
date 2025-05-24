import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReservationCard } from '../reservation-card';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();

  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();

  return {
    ...actual,
    parseISO: vi.fn(),
    format: vi.fn(),
    isBefore: vi.fn(),
  };
});

vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string | { pathname: string };
    [key: string]: unknown;
  }) => (
    <a href={typeof href === 'string' ? href : href.pathname} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/reservations/actions', () => ({
  cancelReservationAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

interface MockComponentProps {
  children: React.ReactNode;
  className?: string;
}

interface MockButtonProps extends MockComponentProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  size?: string;
  asChild?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

interface MockBadgeProps extends MockComponentProps {
  variant?: string;
}

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card-description" className={className} {...props}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card-footer" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="card-title" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: MockBadgeProps) => (
    <span
      data-testid="badge"
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    asChild,
    type,
    className,
    ...props
  }: MockButtonProps) => {
    if (asChild) {
      return (
        <div data-testid="button-wrapper" {...props}>
          {children}
        </div>
      );
    }

    return (
      <button
        data-testid="button"
        data-variant={variant}
        data-size={size}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  },
  buttonVariants: vi.fn(() => 'button-class'),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: MockComponentProps) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  Tooltip: ({ children }: MockComponentProps) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipTrigger: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="tooltip-trigger" className={className} {...props}>
      {children}
    </div>
  ),
  TooltipContent: ({ children, className, ...props }: MockComponentProps) => (
    <div data-testid="tooltip-content" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: MockComponentProps) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogAction: ({
    children,
    type,
    disabled,
    className,
    ...props
  }: MockButtonProps) => (
    <button
      data-testid="alert-dialog-action"
      type={type}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  AlertDialogCancel: ({
    children,
    disabled,
    className,
    ...props
  }: MockButtonProps) => (
    <button
      data-testid="alert-dialog-cancel"
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  AlertDialogContent: ({ children }: MockComponentProps) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogDescription: ({ children }: MockComponentProps) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: MockComponentProps) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogHeader: ({ children }: MockComponentProps) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: MockComponentProps) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogTrigger: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="alert-dialog-trigger" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/loader-spinner', () => ({
  LoaderSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loader-spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="pencil-icon">✏️</span>,
  XCircle: () => <span data-testid="x-circle-icon">❌</span>,
  Info: () => <span data-testid="info-icon">ℹ️</span>,
  ClockIcon: () => <span data-testid="clock-icon">🕐</span>,
  UsersIcon: () => <span data-testid="users-icon">👥</span>,
  UtensilsIcon: () => <span data-testid="utensils-icon">🍽️</span>,
}));

vi.mock('@/lib/utils/localization', () => ({
  getSimpleLocalizedValue: vi.fn(
    (
      value: Record<string, string> | string | null | undefined,
      locale: string,
    ) => {
      if (value && typeof value === 'object' && value[locale]) {
        return value[locale];
      }

      if (value && typeof value === 'object' && value.en) {
        return value.en;
      }

      return value;
    },
  ),
}));

describe('ReservationCard', () => {
  let mockUseTranslations: Mock;
  let mockTReservationsPage: Mock;
  let mockTStatus: Mock;
  let mockParseISO: Mock;
  let mockFormat: Mock;
  let mockIsBefore: Mock;
  let mockToast: { success: Mock; error: Mock };

  const mockReservation: ReservationWithTableDetails = {
    id: 1,
    user_id: 'user-123',
    reservation_date: '2025-02-15',
    reservation_time: '19:00:00',
    party_size: 4,
    status: 'confirmed',
    customer_notes_i18n: {
      en: 'Anniversary dinner',
      es: 'Cena de aniversario',
    },
    internal_notes_i18n: null,
    table_id: 1,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    restaurant_tables: {
      table_number: 'T1',
      capacity: 4,
      description_i18n: { en: 'Window table', es: 'Mesa junto a la ventana' },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockTReservationsPage = vi.fn(
      (key: string, values?: Record<string, unknown>) => {
        const translations: Record<string, string> = {
          reservationOn: `Reservation on ${values?.date}`,
          atTime: `at ${values?.time}`,
          partySizeLabel: 'Party Size',
          tableLabel: 'Table',
          notesLabel: 'Notes',
          bookedOn: `Booked on ${values?.date}`,
          editButton: 'Edit',
          cancelButton: 'Cancel',
          cancellingButtonLabel: 'Cancelling...',
          'cancelDialog.title': 'Cancel Reservation',
          'cancelDialog.description':
            'Are you sure you want to cancel this reservation?',
          'cancelDialog.cancelButtonText': 'Keep Reservation',
          'cancelDialog.confirmButtonText': 'Cancel Reservation',
        };

        return translations[key] || key;
      },
    );

    mockTStatus = vi.fn((status: string) => {
      const statusTranslations: Record<string, string> = {
        confirmed: 'Confirmed',
        pending: 'Pending',
        cancelled: 'Cancelled',
        completed: 'Completed',
        'no-show': 'No Show',
      };

      return statusTranslations[status] || status;
    });

    mockUseTranslations = vi.fn((namespace: string) => {
      if (namespace === 'ReservationsPage') return mockTReservationsPage;
      if (namespace === 'ReservationStatus') return mockTStatus;
      return vi.fn((key: string) => key);
    });

    mockParseISO = vi.fn((dateString: string) => new Date(dateString));

    mockFormat = vi.fn((date: Date, format: string) => {
      if (format === 'MMMM d, yyyy') return 'February 15, 2025';
      if (format === 'p') return '7:00 PM';
      if (format === 'PP') return 'Jan 15, 2025';
      return 'Formatted Date';
    });

    mockIsBefore = vi.fn(() => false);

    mockToast = {
      success: vi.fn(),
      error: vi.fn(),
    };

    const { useTranslations } = await import('next-intl');

    const {
      parseISO,
      format: formatDateFns,
      isBefore,
    } = await import('date-fns');

    const { toast } = await import('sonner');
    const { useActionState } = await import('react');

    (useTranslations as Mock).mockImplementation(mockUseTranslations);
    (parseISO as Mock).mockImplementation(mockParseISO);
    (formatDateFns as Mock).mockImplementation(mockFormat);
    (isBefore as Mock).mockImplementation(mockIsBefore);
    (toast.success as Mock).mockImplementation(mockToast.success);
    (toast.error as Mock).mockImplementation(mockToast.error);

    // Setup default useActionState mock to return proper array structure
    (useActionState as Mock).mockReturnValue([
      null, // initial state
      vi.fn(), // action function
      false, // pending state
    ]);
  });

  describe('Basic Rendering', () => {
    it('should render reservation card with basic information', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(
        screen.getByText('Reservation on February 15, 2025'),
      ).toBeInTheDocument();

      expect(screen.getByText('at 7:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('T1')).toBeInTheDocument();
    });

    it('should render with Spanish locale', () => {
      render(<ReservationCard reservation={mockReservation} locale="es" />);

      expect(mockFormat).toHaveBeenCalled();

      expect(
        screen.getByText('Reservation on February 15, 2025'),
      ).toBeInTheDocument();
    });

    it('should not render if reservation is null or missing status', () => {
      const invalidReservation = { ...mockReservation, status: '' };

      const { container } = render(
        <ReservationCard reservation={invalidReservation} locale="en" />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Reservation Status', () => {
    it('should render confirmed status with correct badge variant', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'default');
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('should render pending status', () => {
      const pendingReservation = { ...mockReservation, status: 'pending' };
      render(<ReservationCard reservation={pendingReservation} locale="en" />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'secondary');
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should render cancelled status', () => {
      const cancelledReservation = { ...mockReservation, status: 'cancelled' };

      render(
        <ReservationCard reservation={cancelledReservation} locale="en" />,
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'destructive');
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should render completed status', () => {
      const completedReservation = { ...mockReservation, status: 'completed' };

      render(
        <ReservationCard reservation={completedReservation} locale="en" />,
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'outline');
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render no-show status', () => {
      const noShowReservation = { ...mockReservation, status: 'no-show' };
      render(<ReservationCard reservation={noShowReservation} locale="en" />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'secondary');
      expect(screen.getByText('No Show')).toBeInTheDocument();
    });
  });

  describe('Table Information', () => {
    it('should render table information when available', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(screen.getByText('T1')).toBeInTheDocument();
      expect(screen.getByText(/Window table/)).toBeInTheDocument();
    });

    it('should not render table section when table is not assigned', () => {
      const reservationWithoutTable = {
        ...mockReservation,
        table_id: null,
        restaurant_tables: null,
      };

      render(
        <ReservationCard reservation={reservationWithoutTable} locale="en" />,
      );

      expect(screen.queryByTestId('utensils-icon')).not.toBeInTheDocument();
    });

    it('should render table without description', () => {
      const reservationWithTableNoDesc = {
        ...mockReservation,
        restaurant_tables: {
          ...mockReservation.restaurant_tables!,
          description_i18n: null,
        },
      };

      render(
        <ReservationCard
          reservation={reservationWithTableNoDesc}
          locale="en"
        />,
      );

      expect(screen.getByText('T1')).toBeInTheDocument();
      expect(screen.queryByText(/Window table/)).not.toBeInTheDocument();
    });
  });

  describe('Customer Notes', () => {
    it('should render customer notes with tooltip', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(screen.getAllByText('Anniversary dinner')).toHaveLength(2); // One in main content, one in tooltip
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should not render notes section when notes are empty', () => {
      const reservationWithoutNotes = {
        ...mockReservation,
        customer_notes_i18n: null,
      };

      render(
        <ReservationCard reservation={reservationWithoutNotes} locale="en" />,
      );

      expect(screen.queryByTestId('info-icon')).not.toBeInTheDocument();
    });

    it('should render notes in Spanish locale', () => {
      render(<ReservationCard reservation={mockReservation} locale="es" />);

      expect(screen.getAllByText('Cena de aniversario')).toHaveLength(2); // One in main content, one in tooltip
    });
  });

  describe('Edit Functionality', () => {
    it('should show edit button for confirmed reservations', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      const editLink = screen.getByRole('link', { name: /Edit/ });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute('href', '/reservations/[id]/edit');
    });

    it('should show edit button for pending reservations', () => {
      const pendingReservation = { ...mockReservation, status: 'pending' };
      render(<ReservationCard reservation={pendingReservation} locale="en" />);

      expect(screen.getByRole('link', { name: /Edit/ })).toBeInTheDocument();
    });

    it('should not show edit button for cancelled reservations', () => {
      const cancelledReservation = { ...mockReservation, status: 'cancelled' };

      render(
        <ReservationCard reservation={cancelledReservation} locale="en" />,
      );

      expect(
        screen.queryByRole('link', { name: /Edit/ }),
      ).not.toBeInTheDocument();
    });

    it('should not show edit button for completed reservations', () => {
      const completedReservation = { ...mockReservation, status: 'completed' };

      render(
        <ReservationCard reservation={completedReservation} locale="en" />,
      );

      expect(
        screen.queryByRole('link', { name: /Edit/ }),
      ).not.toBeInTheDocument();
    });

    it('should not show edit button for no-show reservations', () => {
      const noShowReservation = { ...mockReservation, status: 'no-show' };
      render(<ReservationCard reservation={noShowReservation} locale="en" />);

      expect(
        screen.queryByRole('link', { name: /Edit/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    it('should show cancel button for future confirmed reservations', () => {
      mockIsBefore.mockReturnValue(false); // Reservation is in the future

      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should show cancel button for future pending reservations', () => {
      mockIsBefore.mockReturnValue(false);
      const pendingReservation = { ...mockReservation, status: 'pending' };

      render(<ReservationCard reservation={pendingReservation} locale="en" />);

      expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument();
    });

    it('should not show cancel button for past reservations', () => {
      mockIsBefore.mockReturnValue(true); // Reservation is in the past

      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(
        screen.queryByTestId('alert-dialog-trigger'),
      ).not.toBeInTheDocument();
    });

    it('should not show cancel button for cancelled reservations', () => {
      const cancelledReservation = { ...mockReservation, status: 'cancelled' };

      render(
        <ReservationCard reservation={cancelledReservation} locale="en" />,
      );

      expect(
        screen.queryByTestId('alert-dialog-trigger'),
      ).not.toBeInTheDocument();
    });

    it('should not show cancel button for completed reservations', () => {
      const completedReservation = { ...mockReservation, status: 'completed' };

      render(
        <ReservationCard reservation={completedReservation} locale="en" />,
      );

      expect(
        screen.queryByTestId('alert-dialog-trigger'),
      ).not.toBeInTheDocument();
    });

    it('should not show cancel button for no-show reservations', () => {
      const noShowReservation = { ...mockReservation, status: 'no-show' };

      render(<ReservationCard reservation={noShowReservation} locale="en" />);

      expect(
        screen.queryByTestId('alert-dialog-trigger'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Cancel Dialog', () => {
    beforeEach(() => {
      mockIsBefore.mockReturnValue(false); // Ensure cancel button is shown
    });

    it('should render cancel dialog elements', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument();

      expect(
        screen.getByTestId('alert-dialog-description'),
      ).toBeInTheDocument();

      expect(screen.getByTestId('alert-dialog-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('alert-dialog-action')).toBeInTheDocument();
    });

    it('should render cancel dialog with correct text', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(screen.getByTestId('alert-dialog-title')).toHaveTextContent(
        'Cancel Reservation',
      );

      expect(
        screen.getByText('Are you sure you want to cancel this reservation?'),
      ).toBeInTheDocument();

      expect(screen.getByText('Keep Reservation')).toBeInTheDocument();

      expect(screen.getByTestId('alert-dialog-action')).toHaveTextContent(
        'Cancel Reservation',
      );
    });

    it('should include hidden input with reservation ID in cancel form', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      const hiddenInput = document.querySelector(
        'input[name="reservationId"]',
      ) as HTMLInputElement;

      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput.value).toBe('1');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      // Should call parseISO for both reservation date/time and created_at
      expect(mockParseISO).toHaveBeenCalledWith('2025-02-15T19:00:00Z');
      expect(mockParseISO).toHaveBeenCalledWith('2025-01-15T10:00:00Z');

      // Should format dates with correct patterns
      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(Date),
        'MMMM d, yyyy',
        expect.any(Object),
      );

      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(Date),
        'p',
        expect.any(Object),
      );

      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(Date),
        'PP',
        expect.any(Object),
      );
    });

    it('should use correct date-fns locale for Spanish', () => {
      render(<ReservationCard reservation={mockReservation} locale="es" />);

      // Should be called with Spanish locale object
      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(Date),
        'MMMM d, yyyy',
        expect.objectContaining({ locale: expect.any(Object) }),
      );
    });
  });

  describe('Toast Notifications', () => {
    it('should show success toast when cancel action succeeds', async () => {
      const { rerender } = render(
        <ReservationCard reservation={mockReservation} locale="en" />,
      );

      const { useActionState } = await import('react');

      (useActionState as Mock).mockReturnValue([
        { type: 'success', message: 'Reservation cancelled successfully' },
        vi.fn(),
        false,
      ]);

      rerender(<ReservationCard reservation={mockReservation} locale="en" />);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Reservation cancelled successfully',
        );
      });
    });

    it('should show error toast when cancel action fails', async () => {
      const { rerender } = render(
        <ReservationCard reservation={mockReservation} locale="en" />,
      );

      const { useActionState } = await import('react');

      (useActionState as Mock).mockReturnValue([
        { type: 'error', message: 'Failed to cancel reservation' },
        vi.fn(),
        false,
      ]);

      rerender(<ReservationCard reservation={mockReservation} locale="en" />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to cancel reservation',
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when cancel is pending', async () => {
      const { useActionState } = await import('react');

      vi.mocked(useActionState).mockReturnValue([
        null,
        vi.fn(),
        true, // pending = true
      ]);

      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(screen.getByTestId('loader-spinner')).toBeInTheDocument();
      expect(screen.getByText('Cancelling...')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /Cancelling/ });
      expect(cancelButton).toBeDisabled();
    });

    it('should disable dialog buttons when cancel is pending', async () => {
      const { useActionState } = await import('react');
      vi.mocked(useActionState).mockReturnValue([null, vi.fn(), true]);

      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(screen.getByTestId('alert-dialog-cancel')).toBeDisabled();
      expect(screen.getByTestId('alert-dialog-action')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      const editLink = screen.getByRole('link', { name: /Edit/ });
      expect(editLink).toBeInTheDocument();

      expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument();
    });

    it('should have proper structure for screen readers', () => {
      render(<ReservationCard reservation={mockReservation} locale="en" />);

      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Party Size:';
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Table:';
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Notes:';
        }),
      ).toBeInTheDocument();
    });
  });
});

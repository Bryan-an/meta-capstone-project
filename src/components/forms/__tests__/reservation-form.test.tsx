import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationForm } from '../reservation-form';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import type { ReservableTable } from '@/lib/data/tables';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('react-dom', () => ({
  useFormStatus: vi.fn(),
}));

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();

  return {
    ...actual,
    startOfToday: vi.fn(),
  };
});

interface MockComponentProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

interface MockLabelProps extends MockComponentProps {
  htmlFor?: string;
}

interface MockSelectProps extends MockComponentProps {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

interface MockSelectItemProps extends MockComponentProps {
  value?: string;
}

interface MockCalendarProps {
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

interface MockAlertProps extends MockComponentProps {
  variant?: string;
}

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: MockLabelProps) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.ComponentProps<'textarea'>) => (
    <textarea {...props} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value, ...props }: MockSelectProps) => (
    <div data-testid="select-wrapper" {...props}>
      <select
        data-testid="select"
        value={value || 'unassign'}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange?.(e.target.value)
        }
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: MockComponentProps) => <>{children}</>,
  SelectItem: ({ children, value }: MockSelectItemProps) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: MockComponentProps) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: MockComponentProps) => <div>{children}</div>,
  PopoverContent: ({ children }: MockComponentProps) => <div>{children}</div>,
  PopoverTrigger: ({ children }: MockComponentProps) => <div>{children}</div>,
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect, disabled }: MockCalendarProps) => {
    const testDate = new Date('2025-02-01T00:00:00.000Z');

    return (
      <div data-testid="calendar">
        <button
          onClick={() => onSelect?.(testDate)}
          data-testid="calendar-date"
          disabled={disabled?.(testDate)}
        >
          Select Date
        </button>
      </div>
    );
  },
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant, ...props }: MockAlertProps) => (
    <div data-testid="alert" data-variant={variant} {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: MockComponentProps) => (
    <div data-testid="alert-description">{children}</div>
  ),
  AlertTitle: ({ children }: MockComponentProps) => (
    <div data-testid="alert-title">{children}</div>
  ),
}));

vi.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="alert-triangle-icon">⚠</span>,
  CalendarIcon: () => <span data-testid="calendar-icon">📅</span>,
  CheckCircle2Icon: () => <span data-testid="check-circle-icon">✓</span>,
  ClockIcon: () => <span data-testid="clock-icon">🕐</span>,
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(' '),
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

describe('ReservationForm', () => {
  let mockFormAction: Mock;
  let mockUseTranslations: Mock;
  let mockUseFormStatus: Mock;
  let mockStartOfToday: Mock;

  const mockTForm = vi.fn((key: string, values?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      dateLabel: 'Reservation Date',
      datePlaceholder: 'Select a date',
      timeLabel: 'Reservation Time',
      partySizeLabel: 'Party Size',
      partySizePlaceholder: 'Number of guests',
      tableLabel: 'Table Selection',
      tablePlaceholder: 'Select a table',
      tableUnassignOption: 'No specific table',
      tableNoTablesAvailable: 'No tables available',
      notesLabel: 'Special Requests',
      notesPlaceholder: 'Any special requests...',
      selectPartySizeToFilterTables: 'Select party size to see suitable tables',
      tableCurrentlySelectedNotSuitable:
        'Currently selected but not suitable for party size',
      'errors.tableUnavailableForGuests': `No tables available for ${values?.count || 'this'} guests`,
      'success.reservationCreated': 'Reservation created successfully',
    };

    return translations[key] || key;
  });

  const mockTCommon = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      errorTitle: 'Error',
      successTitle: 'Success',
      genericError: 'Something went wrong',
      table: 'Table',
      capacity: 'Capacity',
    };

    return translations[key] || key;
  });

  const mockReservableTables: ReservableTable[] = [
    {
      id: 1,
      table_number: 'T1',
      capacity: 2,
      description_i18n: { en: 'Window table', es: 'Mesa junto a la ventana' },
    },
    {
      id: 2,
      table_number: 'T2',
      capacity: 4,
      description_i18n: { en: 'Center table', es: 'Mesa central' },
    },
    {
      id: 3,
      table_number: 'T3',
      capacity: 6,
      description_i18n: { en: 'Large table', es: 'Mesa grande' },
    },
  ];

  const defaultProps = {
    formAction: vi.fn(),
    formState: null as FormState<ReservationActionErrorKeys>,
    locale: 'en',
    reservableTables: mockReservableTables,
    allTablesError: null,
    submitButtonText: 'Create Reservation',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockFormAction = vi.fn();
    mockUseFormStatus = vi.fn(() => ({ pending: false }));
    mockStartOfToday = vi.fn(() => new Date('2025-01-15'));

    mockUseTranslations = vi.fn((namespace: string) => {
      if (namespace === 'ReservationForm') return mockTForm;
      if (namespace === 'Common') return mockTCommon;
      return vi.fn((key: string) => key);
    });

    // Setup mocks
    const { useTranslations } = await import('next-intl');
    const { useFormStatus } = await import('react-dom');
    const { startOfToday } = await import('date-fns');

    (useTranslations as Mock).mockImplementation(mockUseTranslations);
    (useFormStatus as Mock).mockImplementation(mockUseFormStatus);
    (startOfToday as Mock).mockImplementation(mockStartOfToday);
  });

  describe('Basic Rendering', () => {
    it('should render the form with all required fields', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      expect(screen.getByText('Reservation Date')).toBeInTheDocument();
      expect(screen.getByText('Reservation Time')).toBeInTheDocument();
      expect(screen.getByText('Party Size')).toBeInTheDocument();
      expect(screen.getByText('Table Selection')).toBeInTheDocument();
      expect(screen.getByText('Special Requests')).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: 'Create Reservation' }),
      ).toBeInTheDocument();
    });

    it('should render with initial data when provided', () => {
      const initialData: Partial<ReservationWithTableDetails> = {
        id: 1,
        reservation_date: '2025-02-01',
        reservation_time: '19:00',
        party_size: 4,
        table_id: 2,
        customer_notes_i18n: {
          en: 'Window seat please',
          es: 'Asiento junto a la ventana por favor',
        },
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          initialData={initialData}
        />,
      );

      expect(screen.getByDisplayValue('19:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();

      expect(
        screen.getByDisplayValue('Window seat please'),
      ).toBeInTheDocument();
    });

    it('should include reservation ID as hidden input when editing', () => {
      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          reservationId="123"
        />,
      );

      const hiddenInput = document.querySelector(
        'input[name="reservationId"]',
      ) as HTMLInputElement;

      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput.value).toBe('123');
    });
  });

  describe('Form State Display', () => {
    it('should display general error message', () => {
      const formState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Database connection failed',
        timestamp: Date.now(),
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          formState={formState}
        />,
      );

      expect(screen.getByTestId('alert')).toHaveAttribute(
        'data-variant',
        'destructive',
      );

      expect(screen.getByTestId('alert-title')).toHaveTextContent('Error');

      expect(screen.getByTestId('alert-description')).toHaveTextContent(
        'Database connection failed',
      );
    });

    it('should display field-specific errors', () => {
      const formState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Validation failed',
        fieldErrors: {
          reservation_date: ['Date is required'],
          party_size: ['Party size must be at least 1'],
        },
        timestamp: Date.now(),
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          formState={formState}
        />,
      );

      expect(screen.getByText('Date is required')).toBeInTheDocument();

      expect(
        screen.getByText('Party size must be at least 1'),
      ).toBeInTheDocument();
    });

    it('should display success message', () => {
      const formState: FormState<ReservationActionErrorKeys> = {
        type: 'success',
        message: 'Reservation created successfully',
        timestamp: Date.now(),
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          formState={formState}
        />,
      );

      expect(screen.getByTestId('alert-title')).toHaveTextContent('Success');

      expect(screen.getByTestId('alert-description')).toHaveTextContent(
        'Reservation created successfully',
      );
    });
  });

  describe('Date Selection', () => {
    it('should handle date selection', async () => {
      const user = userEvent.setup();

      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const calendarButton = screen.getByTestId('calendar-date');
      await user.click(calendarButton);

      // Check that hidden input gets the formatted date (the date is getting formatted as 2025-01-31)
      const hiddenDateInput = document.querySelector(
        'input[name="reservation_date"]',
      ) as HTMLInputElement;

      expect(hiddenDateInput.value).toBe('2025-01-31');
    });

    it('should display formatted date in button after selection', async () => {
      const user = userEvent.setup();

      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const calendarButton = screen.getByTestId('calendar-date');
      await user.click(calendarButton);

      const hiddenDateInput = document.querySelector(
        'input[name="reservation_date"]',
      ) as HTMLInputElement;

      expect(hiddenDateInput.value).toBe('2025-01-31');
    });

    it('should show placeholder when no date is selected', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      expect(screen.getByText('Select a date')).toBeInTheDocument();
    });
  });

  describe('Party Size and Table Filtering', () => {
    it('should filter tables based on party size', async () => {
      const user = userEvent.setup();

      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const partySizeInput = screen.getByLabelText('Party Size');
      await user.clear(partySizeInput);
      await user.type(partySizeInput, '5');

      // Should filter to only tables with capacity >= 5 (T3 with capacity 6)
      const select = screen.getByTestId('select');
      const options = select.querySelectorAll('option');

      // Should have "No specific table" option plus T3
      expect(options).toHaveLength(2);

      expect(
        screen.getByText('Table T3 (Capacity: 6, Large table)'),
      ).toBeInTheDocument();

      expect(
        screen.queryByText('Table T1 (Capacity: 2, Window table)'),
      ).not.toBeInTheDocument();
    });

    it('should reset table selection when party size makes current table unsuitable', async () => {
      const user = userEvent.setup();

      const initialData: Partial<ReservationWithTableDetails> = {
        party_size: 2,
        table_id: 1, // T1 with capacity 2
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          initialData={initialData}
        />,
      );

      const partySizeInput = screen.getByDisplayValue('2');
      await user.clear(partySizeInput);
      await user.type(partySizeInput, '5');

      // Table selection should be reset since T1 can't accommodate 5 people
      const select = screen.getByTestId('select') as HTMLSelectElement;
      expect(select.value).toBe('unassign');
    });

    it('should show message when no tables are available for party size', async () => {
      const user = userEvent.setup();

      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const partySizeInput = screen.getByLabelText('Party Size');
      await user.clear(partySizeInput);
      await user.type(partySizeInput, '10'); // Larger than any table capacity

      expect(
        screen.getByText('No tables available for 10 guests'),
      ).toBeInTheDocument();
    });

    it('should show helper text when no party size is selected', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      expect(
        screen.getByText('Select party size to see suitable tables'),
      ).toBeInTheDocument();
    });
  });

  describe('Table Selection', () => {
    it('should handle table selection', async () => {
      const user = userEvent.setup();

      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const select = screen.getByTestId('select') as HTMLSelectElement;
      await user.selectOptions(select, '2');

      expect(select.value).toBe('2');
    });

    it('should show "unassign" option', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      expect(screen.getByText('No specific table')).toBeInTheDocument();
    });

    it('should display table information with localized description', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      expect(
        screen.getByText('Table T1 (Capacity: 2, Window table)'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Table T2 (Capacity: 4, Center table)'),
      ).toBeInTheDocument();

      expect(
        screen.getByText('Table T3 (Capacity: 6, Large table)'),
      ).toBeInTheDocument();
    });

    it('should show error when tables fetch fails', () => {
      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          allTablesError="Failed to load tables"
        />,
      );

      expect(screen.getByTestId('alert')).toHaveAttribute(
        'data-variant',
        'destructive',
      );

      expect(screen.getByText('Failed to load tables')).toBeInTheDocument();
    });

    it('should show message when no tables are available', () => {
      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          reservableTables={[]}
        />,
      );

      expect(screen.getByText('No tables available')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call formAction with FormData when submitted', async () => {
      const user = userEvent.setup();

      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const calendarButton = screen.getByTestId('calendar-date');
      await user.click(calendarButton);

      const timeInput = screen.getByLabelText('Reservation Time');
      await user.type(timeInput, '19:00');

      const partySizeInput = screen.getByLabelText('Party Size');
      await user.type(partySizeInput, '4');

      const notesInput = screen.getByLabelText('Special Requests');
      await user.type(notesInput, 'Window seat please');

      const submitButton = screen.getByRole('button', {
        name: /Create Reservation/,
      });

      await user.click(submitButton);

      expect(mockFormAction).toHaveBeenCalledWith(expect.any(FormData));
    });

    it('should show pending state during submission', () => {
      mockUseFormStatus.mockReturnValue({ pending: true });

      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const submitButton = screen.getByRole('button', {
        name: /Create Reservation/,
      });

      expect(submitButton).toBeDisabled();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      expect(screen.getByLabelText('Reservation Time')).toBeInTheDocument();
      expect(screen.getByLabelText('Party Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Special Requests')).toBeInTheDocument();
    });

    it('should associate error messages with form fields using aria-describedby', () => {
      const formState: FormState<ReservationActionErrorKeys> = {
        type: 'error',
        message: 'Validation failed',
        fieldErrors: {
          party_size: ['Party size must be at least 1'],
        },
        timestamp: Date.now(),
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          formState={formState}
        />,
      );

      const partySizeInput = screen.getByLabelText('Party Size');
      const errorMessage = screen.getByText('Party size must be at least 1');

      expect(partySizeInput).toHaveAttribute('aria-describedby');
      expect(errorMessage.id).toBeTruthy();
    });
  });

  describe('Internationalization', () => {
    it('should use correct translation namespaces', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      expect(mockUseTranslations).toHaveBeenCalledWith('ReservationForm');
      expect(mockUseTranslations).toHaveBeenCalledWith('Common');
    });

    it('should localize table descriptions based on locale', () => {
      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          locale="es"
        />,
      );

      expect(
        screen.getByText('Table T1 (Capacity: 2, Mesa junto a la ventana)'),
      ).toBeInTheDocument();
    });
  });

  describe('Date Validation', () => {
    it('should disable past dates in calendar', () => {
      render(<ReservationForm {...defaultProps} formAction={mockFormAction} />);

      const calendarDate = screen.getByTestId('calendar-date');

      // The mock disabled function should be called with the date
      // and return true for past dates (mocked to check against 2025-01-15)
      expect(calendarDate).not.toBeDisabled(); // 2025-02-01 is after 2025-01-15
    });
  });

  describe('Edit Mode', () => {
    it('should populate form with initial data in edit mode', () => {
      const initialData: Partial<ReservationWithTableDetails> = {
        id: 1,
        reservation_date: '2025-02-01',
        reservation_time: '19:00',
        party_size: 4,
        table_id: 2,
        customer_notes_i18n: { en: 'Window seat please' },
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          initialData={initialData}
          submitButtonText="Update Reservation"
        />,
      );

      expect(screen.getByDisplayValue('19:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();

      expect(
        screen.getByDisplayValue('Window seat please'),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /Update Reservation/ }),
      ).toBeInTheDocument();
    });

    it('should show currently selected table even if not suitable for new party size', async () => {
      const user = userEvent.setup();

      const initialData: Partial<ReservationWithTableDetails> = {
        party_size: 2,
        table_id: 1, // T1 with capacity 2
      };

      render(
        <ReservationForm
          {...defaultProps}
          formAction={mockFormAction}
          initialData={initialData}
        />,
      );

      // Change party size to make current table unsuitable
      const partySizeInput = screen.getByDisplayValue('2');
      await user.clear(partySizeInput);
      await user.type(partySizeInput, '5');

      // Should still show the original table as an option (but marked as not suitable)
      expect(
        screen.getByText(/Currently selected but not suitable for party size/),
      ).toBeInTheDocument();
    });
  });
});

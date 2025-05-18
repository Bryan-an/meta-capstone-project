'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  CalendarIcon,
  ClockIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { useEffect, useState, useId } from 'react';
import { useActionState } from 'react'; // React 19+
import { useFormStatus } from 'react-dom';
import {
  getReservationForEditAction,
  updateReservationAction,
} from '@/app/reservations/actions';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSimpleLocalizedValue } from '@/lib/utils/localization';
import type { ReservableTable } from '@/lib/data/tables';
import { getReservableTables } from '@/lib/data/tables';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner'; // Import Sonner toast
import { useRouter } from '@/i18n/routing';

const initialFormState: FormState<ReservationActionErrorKeys> = null;

/**
 * Props for the EditReservationForm component.
 */
interface EditReservationFormProps {
  /** The reservation details to pre-fill the form with. */
  reservation: ReservationWithTableDetails;
  /** The server action to call when the form is submitted. */
  formAction: (payload: FormData) => void;
  /** The current state of the form, including validation errors or success messages. */
  formState: FormState<ReservationActionErrorKeys>;
  /** The current locale, used for localizing elements like table descriptions. */
  locale: string;
  /** An array of all tables that can be selected for the reservation. */
  reservableTables: ReservableTable[];
  /** An error message string if fetching the list of reservable tables failed, otherwise null. */
  allTablesError: string | null;
}

/**
 * A client component that renders the form for editing an existing reservation.
 *
 * It handles displaying form fields pre-filled with existing reservation data,
 * manages selection of reservable tables, and displays validation errors or success messages
 * returned from the server action.
 *
 * @param props - The props for the EditReservationForm component.
 * @returns A React element representing the reservation editing form.
 */
function EditReservationForm({
  reservation,
  formAction,
  formState,
  locale,
  reservableTables,
  allTablesError,
}: EditReservationFormProps) {
  const tForm = useTranslations('ReservationForm');
  const tCommon = useTranslations('Common');
  const tEdit = useTranslations('EditReservationPage');
  const baseId = useId();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(reservation.reservation_date + 'T00:00:00Z'),
  );

  const [currentPartySize, setCurrentPartySize] = useState<number>(
    reservation.party_size,
  );

  const suitableTables = reservableTables.filter(
    (table) => table.capacity >= currentPartySize,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="reservationId" value={reservation.id} />

      {/* Date Field */}
      <div className="space-y-2">
        <Label htmlFor={`${baseId}-date`}>{tForm('dateLabel')}</Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
              )}
              id={`${baseId}-date`}
            >
              <CalendarIcon className="h-4 w-4" />

              {selectedDate ? (
                format(selectedDate, 'PPP')
              ) : (
                <span>{tForm('dateLabel')}</span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
              }}
            />
          </PopoverContent>
        </Popover>

        <input
          type="hidden"
          name="reservation_date"
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
        />

        {formState?.fieldErrors?.reservation_date && (
          <p className="text-destructive text-sm">
            {formState.fieldErrors.reservation_date.join(', ')}
          </p>
        )}
      </div>

      {/* Time Field */}
      <div className="space-y-2">
        <Label htmlFor={`${baseId}-time`}>{tForm('timeLabel')}</Label>

        <Input
          id={`${baseId}-time`}
          name="reservation_time"
          type="time"
          defaultValue={reservation.reservation_time}
          required
          aria-describedby={
            formState?.fieldErrors?.reservation_time
              ? `${baseId}-time-error`
              : undefined
          }
        />

        {formState?.fieldErrors?.reservation_time && (
          <p id={`${baseId}-time-error`} className="text-destructive text-sm">
            {formState.fieldErrors.reservation_time.join(', ')}
          </p>
        )}
      </div>

      {/* Party Size Field */}
      <div className="space-y-2">
        <Label htmlFor={`${baseId}-party_size`}>
          {tForm('partySizeLabel')}
        </Label>

        <Input
          id={`${baseId}-party_size`}
          name="party_size"
          type="number"
          defaultValue={reservation.party_size}
          required
          min="1"
          max="20"
          aria-describedby={
            formState?.fieldErrors?.party_size
              ? `${baseId}-party_size-error`
              : undefined
          }
          onChange={(e) => setCurrentPartySize(Number(e.target.value))}
        />

        {formState?.fieldErrors?.party_size && (
          <p
            id={`${baseId}-party_size-error`}
            className="text-destructive text-sm"
          >
            {formState.fieldErrors.party_size.join(', ')}
          </p>
        )}
      </div>

      {/* Table Selection Field */}
      <div className="space-y-2">
        <Label htmlFor={`${baseId}-table_id`}>{tForm('tableLabel')}</Label>

        {allTablesError && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{tCommon('errorTitle')}</AlertTitle>
            <AlertDescription>{allTablesError}</AlertDescription>
          </Alert>
        )}

        {!allTablesError && reservableTables.length === 0 && (
          <p className="text-muted-foreground text-sm">
            {tForm('tableNoTablesAvailable')}
          </p>
        )}

        {!allTablesError && reservableTables.length > 0 && (
          <>
            <Select
              name="table_id"
              defaultValue={reservation.table_id?.toString() || 'unassign'}
            >
              <SelectTrigger id={`${baseId}-table_id`}>
                <SelectValue placeholder={tForm('tablePlaceholder')} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="unassign">
                  {tForm('tablePlaceholder')} (None)
                </SelectItem>

                {suitableTables.map((table) => (
                  <SelectItem key={table.id} value={table.id.toString()}>
                    {table.table_number} (Cap: {table.capacity}
                    {getSimpleLocalizedValue(table.description_i18n, locale)
                      ? `, ${getSimpleLocalizedValue(table.description_i18n, locale)}`
                      : ''}
                    )
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentPartySize > 0 &&
              suitableTables.length === 0 &&
              reservableTables.length > 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  {tForm('errors.tableUnavailableForGuests', {
                    count: currentPartySize,
                  })}
                </p>
              )}
          </>
        )}

        {formState?.fieldErrors?.table_id && (
          <p className="text-destructive text-sm">
            {formState.fieldErrors.table_id.join(', ')}
          </p>
        )}
      </div>

      {/* Customer Notes Field */}
      <div className="space-y-2">
        <Label htmlFor={`${baseId}-customer_notes`}>
          {tForm('notesLabel')}
        </Label>

        <Textarea
          id={`${baseId}-customer_notes`}
          name="customer_notes"
          placeholder={tForm('notesPlaceholder')}
          defaultValue={
            getSimpleLocalizedValue(reservation.customer_notes_i18n, locale) ||
            ''
          }
          aria-describedby={
            formState?.fieldErrors?.customer_notes
              ? `${baseId}-customer_notes-error`
              : undefined
          }
          className="field-sizing-content min-h-fit resize-none"
        />

        {formState?.fieldErrors?.customer_notes && (
          <p
            id={`${baseId}-customer_notes-error`}
            className="text-destructive text-sm"
          >
            {formState.fieldErrors.customer_notes.join(', ')}
          </p>
        )}
      </div>

      {formState?.type === 'error' && !formState.fieldErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{tCommon('errorTitle')}</AlertTitle>
          <AlertDescription>{formState.message}</AlertDescription>
        </Alert>
      )}

      {formState?.type === 'success' && (
        <Alert variant="default">
          <CheckCircle2Icon className="h-4 w-4" />
          <AlertTitle>{tCommon('successTitle')}</AlertTitle>
          <AlertDescription>{formState.message}</AlertDescription>
        </Alert>
      )}

      <SubmitButton text={tEdit('updateButtonText')} />
    </form>
  );
}

/**
 * A submit button component that shows a pending state using `useFormStatus`.
 *
 * @param props - The props for the SubmitButton.
 * @returns A React element representing the submit button.
 */
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <ClockIcon className="h-4 w-4 animate-spin" /> : null}
      {text}
    </Button>
  );
}

/**
 * The main page component for editing an existing reservation.
 *
 * This page fetches the reservation details based on the ID from the URL parameters.
 * It also fetches a list of all reservable tables for the form.
 * It uses `useActionState` to manage the form submission process with the `updateReservationAction` server action.
 * The component handles loading states, error display (e.g., if the reservation is not found or fetching fails),
 * and renders the `EditReservationForm` with the necessary data and action handlers.
 *
 * @returns A React element representing the edit reservation page.
 */
export default function EditReservationPage() {
  const t = useTranslations('EditReservationPage');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const locale = params.locale as string;
  const reservationId = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservation, setReservation] =
    useState<ReservationWithTableDetails | null>(null);

  const [formState, formAction] = useActionState(
    updateReservationAction,
    initialFormState,
  );

  const [reservableTables, setReservableTables] = useState<ReservableTable[]>(
    [],
  );

  const [allTablesError, setAllTablesError] = useState<string | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setIsLoading(false);
      setError(tCommon('genericError'));
      return;
    }

    async function fetchReservation() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getReservationForEditAction(reservationId);
        if (result.success && result.data) {
          setReservation(result.data);
        } else {
          setError(result.message || t('errors.notFound'));
          setReservation(null);
        }
      } catch {
        setError(tCommon('genericError'));
        setReservation(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReservation();
  }, [reservationId, t, tCommon]);

  useEffect(() => {
    async function fetchAllTables() {
      try {
        const result = await getReservableTables();

        if (result.type === 'success') {
          setReservableTables(result.data);
          setAllTablesError(null);
        } else {
          setReservableTables([]);

          setAllTablesError(
            result.messageKey ? tCommon(result.messageKey) : result.message,
          );
        }
      } catch {
        setReservableTables([]);
        setAllTablesError(tCommon('genericError'));
      }
    }

    fetchAllTables();
  }, [tCommon]);

  useEffect(() => {
    if (formState?.type === 'success' && formState.message) {
      toast.success(formState.message);
      router.push('/reservations');
    } else if (formState?.type === 'error' && formState.message) {
      toast.error(formState.message);
    }
  }, [formState, router]);

  if (isLoading) {
    return (
      <div className="px-4 py-16 md:px-8 lg:px-16">
        <p>{tCommon('loading')}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-16 md:px-8 lg:px-16">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{tCommon('errorTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="px-4 py-16 md:px-8 lg:px-16">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{tCommon('errorTitle')}</AlertTitle>
          <AlertDescription>{t('errors.notFound')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 md:px-8 lg:px-16">
      <Card className="mx-auto max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {t('title')}
          </CardTitle>

          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <EditReservationForm
            reservation={reservation}
            formAction={formAction}
            formState={formState}
            locale={locale}
            reservableTables={reservableTables}
            allTablesError={allTablesError}
          />
        </CardContent>
      </Card>
    </div>
  );
}

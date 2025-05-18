'use client';

import { useActionState, useEffect, useId, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createReservation } from '@/app/reservations/actions';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoaderSpinner } from '@/components/ui/loader-spinner';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getReservableTables, ReservableTable } from '@/lib/data/tables';

const initialState: FormState<ReservationActionErrorKeys> = null;

/**
 * SubmitButton component for the reservation form.
 * Displays a loading spinner and disables the button during form submission.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('ReservationForm');

  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? <LoaderSpinner /> : t('submitButtonText')}
    </Button>
  );
}

/**
 * Page component for creating a new reservation.
 *
 * This client component renders a form allowing users to input reservation details
 * including selecting a table. It uses `useActionState` to manage form submission
 * with a server action and `next-intl` for internationalization.
 */
export default function NewReservationPage() {
  const t = useTranslations('ReservationForm');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const [state, formAction] = useActionState(createReservation, initialState);
  const baseId = useId();
  const [availableTables, setAvailableTables] = useState<ReservableTable[]>([]);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const [selectedPartySize, setSelectedPartySize] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function fetchTables() {
      const result = await getReservableTables();

      if (result.type === 'success') {
        setAvailableTables(result.data);
        setTablesError(null);
      } else {
        setAvailableTables([]);
        let errorMessageToShow = result.message;

        if (result.messageKey) {
          errorMessageToShow = t(`errors.${result.messageKey}`);
        } else if (!errorMessageToShow) {
          errorMessageToShow = t('errors.noTablesAvailable');
        }

        setTablesError(errorMessageToShow);
        toast.error(errorMessageToShow);
      }
    }

    fetchTables();
  }, [t, tCommon]);

  useEffect(() => {
    if (state?.type === 'success') {
      toast.success(state.message || t('success.reservationCreated'));
      setSelectedPartySize(null);
      router.push('/reservations');
    } else if (state?.type === 'error') {
      const errorMessage = state.message || tCommon('genericError');
      toast.error(errorMessage);
    }
  }, [state, t, tCommon, router]);

  const getFieldError = (fieldName: string): string | undefined => {
    if (
      state?.type === 'error' &&
      state.fieldErrors &&
      state.fieldErrors[fieldName] &&
      state.fieldErrors[fieldName]?.[0]
    ) {
      return state.fieldErrors[fieldName].join(', ');
    }

    return undefined;
  };

  const handlePartySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setSelectedPartySize(isNaN(size) ? null : size);
    setSelectedTableId(null);
  };

  const filteredTables = selectedPartySize
    ? availableTables.filter((table) => table.capacity >= selectedPartySize)
    : availableTables;

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
          <form action={formAction} className="space-y-6">
            {state?.type === 'error' && !state.fieldErrors && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />

                <AlertTitle>{tCommon('errorTitle')}</AlertTitle>

                <AlertDescription>
                  {state.messageKey
                    ? t(`errors.${state.messageKey}`)
                    : state.message || tCommon('genericError')}
                </AlertDescription>
              </Alert>
            )}

            {state?.type === 'success' && (
              <Alert variant="default">
                <CheckCircle2 className="h-4 w-4" />

                <AlertTitle>
                  {state.message || t('success.reservationCreated')}
                </AlertTitle>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor={`${baseId}-reservation_date`}>
                {t('dateLabel')}
              </Label>

              <Input
                type="date"
                name="reservation_date"
                id={`${baseId}-reservation_date`}
                className="border-input bg-background text-foreground focus:border-primary focus:ring-primary block w-full rounded-md px-3 py-2 shadow-sm focus:ring-1 focus:outline-none sm:text-sm"
                aria-describedby={`${baseId}-reservation_date-error`}
                required
              />

              {getFieldError('reservation_date') && (
                <p
                  className="text-destructive mt-1 text-sm"
                  id={`${baseId}-reservation_date-error`}
                >
                  {getFieldError('reservation_date')}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${baseId}-reservation_time`}>
                {t('timeLabel')}
              </Label>

              <Input
                type="time"
                name="reservation_time"
                id={`${baseId}-reservation_time`}
                placeholder={t('timePlaceholder')}
                aria-describedby={`${baseId}-reservation_time-error`}
                required
              />

              {getFieldError('reservation_time') && (
                <p
                  className="text-destructive mt-1 text-sm"
                  id={`${baseId}-reservation_time-error`}
                >
                  {getFieldError('reservation_time')}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${baseId}-party_size`}>
                {t('partySizeLabel')}
              </Label>

              <Input
                type="number"
                name="party_size"
                id={`${baseId}-party_size`}
                placeholder={t('partySizePlaceholder')}
                min="1"
                aria-describedby={`${baseId}-party_size-error ${baseId}-party_size-note`}
                required
                onChange={handlePartySizeChange}
              />

              {getFieldError('party_size') && (
                <p
                  className="text-destructive mt-1 text-sm"
                  id={`${baseId}-party_size-error`}
                >
                  {getFieldError('party_size')}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${baseId}-table_id`}>{t('tableLabel')}</Label>

              <Select
                name="table_id"
                value={selectedTableId ?? ''}
                onValueChange={setSelectedTableId}
              >
                <SelectTrigger
                  id={`${baseId}-table_id`}
                  aria-describedby={`${baseId}-table_id-error`}
                  className="w-full"
                >
                  <SelectValue placeholder={t('tablePlaceholder')} />
                </SelectTrigger>

                <SelectContent>
                  {tablesError ? (
                    <SelectItem value="error" disabled>
                      {tablesError}
                    </SelectItem>
                  ) : filteredTables.length > 0 ? (
                    filteredTables.map((table) => (
                      <SelectItem key={table.id} value={String(table.id)}>
                        {`${tCommon('table')} ${table.table_number} (${tCommon('capacity')}: ${table.capacity})`}
                        {table.description_i18n?.en &&
                          ` - ${table.description_i18n.en}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-tables" disabled>
                      {selectedPartySize
                        ? t('errors.tableUnavailableForGuests', {
                            count: selectedPartySize,
                          })
                        : t('tableNoTablesAvailable')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {getFieldError('table_id') && (
                <p
                  className="text-destructive mt-1 text-sm"
                  id={`${baseId}-table_id-error`}
                >
                  {getFieldError('table_id')}
                </p>
              )}

              {!selectedPartySize && availableTables.length > 0 && (
                <p
                  id={`${baseId}-party_size-note`}
                  className="text-muted-foreground mt-1 text-sm"
                >
                  {t('selectPartySizeToFilterTables')}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${baseId}-customer_notes`}>
                {t('notesLabel')}
              </Label>

              <Textarea
                name="customer_notes"
                id={`${baseId}-customer_notes`}
                placeholder={t('notesPlaceholder')}
                className="field-sizing-content min-h-fit resize-none"
                aria-describedby={`${baseId}-customer_notes-error`}
              />

              {getFieldError('customer_notes') && (
                <p
                  className="text-destructive mt-1 text-sm"
                  id={`${baseId}-customer_notes-error`}
                >
                  {getFieldError('customer_notes')}
                </p>
              )}
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

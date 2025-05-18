'use client';

import { useId, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSimpleLocalizedValue } from '@/lib/utils/localization';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import type { ReservableTable } from '@/lib/data/tables';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';

/**
 * Props for the ReservationForm component.
 */
interface ReservationFormProps {
  /** The server action to call when the form is submitted. */
  formAction: (payload: FormData) => void;
  /** The current state of the form, including validation errors or success messages. */
  formState: FormState<ReservationActionErrorKeys>;
  /** The initial data for the form, used for edit mode. */
  initialData?: Partial<ReservationWithTableDetails>;
  /** The current locale, used for localizing elements like table descriptions. */
  locale: string;
  /** An array of all tables that can be selected for the reservation. */
  reservableTables: ReservableTable[];
  /** An error message string if fetching the list of reservable tables failed, otherwise null. */
  allTablesError: string | null;
  /** The text to display on the submit button. */
  submitButtonText: string;
  /** The ID of the reservation to edit, if applicable. */
  reservationId?: string;
}

/**
 * A submit button component that shows a pending state using `useFormStatus`.
 */
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? <ClockIcon className="h-4 w-4 animate-spin" /> : null}
      {text}
    </Button>
  );
}

/**
 * A form component for creating or editing reservations.
 */
export function ReservationForm({
  formAction,
  formState,
  initialData = {},
  locale,
  reservableTables,
  allTablesError,
  submitButtonText,
  reservationId,
}: ReservationFormProps) {
  const tForm = useTranslations('ReservationForm');
  const tCommon = useTranslations('Common');
  const baseId = useId();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData.reservation_date
      ? new Date(initialData.reservation_date + 'T00:00:00Z')
      : undefined,
  );

  const [currentPartySize, setCurrentPartySize] = useState<number>(
    initialData.party_size || 0,
  );

  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    initialData.table_id?.toString() || null,
  );

  /**
   * Effect to reset selected table if party size changes and current table is no longer suitable
   */
  useEffect(() => {
    if (selectedTableId && currentPartySize > 0) {
      const tableIsStillSuitable = reservableTables.some(
        (table) =>
          table.id.toString() === selectedTableId &&
          table.capacity >= currentPartySize,
      );

      if (!tableIsStillSuitable) {
        setSelectedTableId(null);
      }
    }
  }, [currentPartySize, selectedTableId, reservableTables]);

  /**
   * Update selectedTableId if initialData.table_id changes (e.g. after successful edit action)
   */
  useEffect(() => {
    setSelectedTableId(initialData.table_id?.toString() || null);
  }, [initialData.table_id]);

  const handlePartySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setCurrentPartySize(isNaN(size) ? 0 : size);
  };

  const suitableTables =
    currentPartySize > 0
      ? reservableTables.filter((table) => table.capacity >= currentPartySize)
      : reservableTables;

  const getFieldError = (fieldName: string): string | undefined => {
    if (formState?.type === 'error' && formState.fieldErrors) {
      const errors = formState.fieldErrors[fieldName];

      if (errors && Array.isArray(errors) && errors.length > 0) {
        return errors.join(', ');
      }
    }

    return undefined;
  };

  return (
    <form action={formAction} className="space-y-6">
      {reservationId && (
        <input type="hidden" name="reservationId" value={reservationId} />
      )}

      {/* General Error Message (not field-specific) */}
      {formState?.type === 'error' && !formState.fieldErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{tCommon('errorTitle')}</AlertTitle>

          <AlertDescription>
            {formState.messageKey
              ? tCommon(`errors.${formState.messageKey as string}`) ||
                formState.message ||
                tCommon('genericError')
              : formState.message || tCommon('genericError')}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {formState?.type === 'success' && (
        <Alert
          variant="default"
          className="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400"
        >
          <CheckCircle2Icon className="h-4 w-4 !text-green-500 dark:!text-green-400" />
          <AlertTitle>{tCommon('successTitle')}</AlertTitle>

          <AlertDescription>
            {formState.messageKey
              ? tCommon(`success.${formState.messageKey as string}`) ||
                formState.message ||
                tForm('success.reservationCreated')
              : formState.message || tForm('success.reservationCreated')}
          </AlertDescription>
        </Alert>
      )}

      {/* Date Field */}
      <div className="space-y-2">
        <Label htmlFor={`${baseId}-reservation_date`}>
          {tForm('dateLabel')}
        </Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
              )}
              id={`${baseId}-date-trigger`}
            >
              <CalendarIcon className="h-4 w-4" />

              {selectedDate ? (
                selectedDate.toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })
              ) : (
                <span>{tForm('datePlaceholder')}</span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              autoFocus
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </PopoverContent>
        </Popover>

        <input
          type="hidden"
          name="reservation_date"
          id={`${baseId}-reservation_date`}
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
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

      {/* Time Field */}
      <div className="space-y-2">
        <Label htmlFor={`${baseId}-reservation_time`}>
          {tForm('timeLabel')}
        </Label>

        <Input
          id={`${baseId}-reservation_time`}
          name="reservation_time"
          type="time"
          defaultValue={initialData.reservation_time || ''}
          required
          aria-describedby={`${baseId}-reservation_time-error`}
        />

        {getFieldError('reservation_time') && (
          <p
            id={`${baseId}-reservation_time-error`}
            className="text-destructive mt-1 text-sm"
          >
            {getFieldError('reservation_time')}
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
          defaultValue={initialData.party_size?.toString() || ''}
          placeholder={tForm('partySizePlaceholder')}
          required
          min="1"
          max="20"
          aria-describedby={`${baseId}-party_size-error ${baseId}-party_size-note`}
          onChange={handlePartySizeChange}
        />

        {getFieldError('party_size') && (
          <p
            id={`${baseId}-party_size-error`}
            className="text-destructive mt-1 text-sm"
          >
            {getFieldError('party_size')}
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

        {!allTablesError &&
          reservableTables.length === 0 &&
          !initialData.id && (
            <p className="text-muted-foreground text-sm">
              {tForm('tableNoTablesAvailable')}
            </p>
          )}

        {!allTablesError && (reservableTables.length > 0 || initialData.id) && (
          <>
            <Select
              name="table_id"
              value={selectedTableId || 'unassign'}
              onValueChange={setSelectedTableId}
              disabled={reservableTables.length === 0 && !initialData.id}
            >
              <SelectTrigger
                id={`${baseId}-table_id`}
                aria-describedby={`${baseId}-table_id-error`}
                className="w-full"
              >
                <SelectValue placeholder={tForm('tablePlaceholder')} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="unassign">
                  {tForm('tableUnassignOption')}
                </SelectItem>

                {suitableTables.map((table) => (
                  <SelectItem key={table.id} value={table.id.toString()}>
                    {tCommon('table')} {table.table_number} (
                    {tCommon('capacity')}: {table.capacity}
                    {getSimpleLocalizedValue(table.description_i18n, locale)
                      ? `, ${getSimpleLocalizedValue(table.description_i18n, locale)}`
                      : ''}
                    )
                  </SelectItem>
                ))}

                {/*
                 * If editing, and current table is not in suitableTables (e.g. party size changed making it unsuitable)
                 * still list it as an option to allow user to re-select it if they revert party size
                 */}
                {initialData.table_id &&
                  !suitableTables.some((t) => t.id === initialData.table_id) &&
                  reservableTables.find((t) => t.id === initialData.table_id) &&
                  (() => {
                    const currentTable = reservableTables.find(
                      (t) => t.id === initialData.table_id,
                    );

                    return currentTable ? (
                      <SelectItem
                        key={currentTable.id}
                        value={currentTable.id.toString()}
                        className="text-muted-foreground italic"
                      >
                        {tCommon('table')} {currentTable.table_number} (
                        {tCommon('capacity')}: {currentTable.capacity}
                        {getSimpleLocalizedValue(
                          currentTable.description_i18n,
                          locale,
                        )
                          ? `, ${getSimpleLocalizedValue(currentTable.description_i18n, locale)}`
                          : ''}
                        ) - {tForm('tableCurrentlySelectedNotSuitable')}
                      </SelectItem>
                    ) : null;
                  })()}
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

            {currentPartySize > 0 &&
              suitableTables.length === 0 &&
              reservableTables.length > 0 &&
              (!initialData.table_id ||
                !reservableTables.some(
                  (t) =>
                    t.id === initialData.table_id &&
                    t.capacity >= currentPartySize,
                )) && (
                <p
                  id={`${baseId}-party_size-note`}
                  className="mt-1 text-sm text-amber-600"
                >
                  {tForm('errors.tableUnavailableForGuests', {
                    count: currentPartySize,
                  })}
                </p>
              )}

            {!currentPartySize &&
              reservableTables.length > 0 &&
              !initialData.id && (
                <p
                  id={`${baseId}-party_size-note`}
                  className="text-muted-foreground mt-1 text-sm"
                >
                  {tForm('selectPartySizeToFilterTables')}
                </p>
              )}
          </>
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
            getSimpleLocalizedValue(initialData.customer_notes_i18n, locale) ||
            ''
          }
          aria-describedby={`${baseId}-customer_notes-error`}
          className="field-sizing-content min-h-fit resize-none"
        />

        {getFieldError('customer_notes') && (
          <p
            id={`${baseId}-customer_notes-error`}
            className="text-destructive mt-1 text-sm"
          >
            {getFieldError('customer_notes')}
          </p>
        )}
      </div>

      <SubmitButton text={submitButtonText} />
    </form>
  );
}

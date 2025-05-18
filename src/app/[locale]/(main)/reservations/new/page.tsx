'use client';

import { useActionState, useEffect, useId } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
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
 * This client component renders a form allowing users to input reservation details.
 * It uses `useActionState` to manage form submission with a server action and
 * `next-intl` for internationalization.
 */
export default function NewReservationPage() {
  const t = useTranslations('ReservationForm');
  const tCommon = useTranslations('Common');
  const [state, formAction] = useActionState(createReservation, initialState);
  const baseId = useId();

  useEffect(() => {
    if (state?.type === 'success') {
      toast.success(state.message || t('success.reservationCreated'));
    } else if (state?.type === 'error') {
      const errorMessage = state.message || t('errors.unknownError');
      toast.error(errorMessage);
    }
  }, [state, t]);

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
                    : state.message}
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
                aria-describedby={`${baseId}-party_size-error`}
                required
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

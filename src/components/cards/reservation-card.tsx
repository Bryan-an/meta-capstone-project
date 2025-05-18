'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSimpleLocalizedValue } from '@/lib/utils/localization';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';
import { useTranslations } from 'next-intl';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Pencil,
  XCircle,
  Info,
  ClockIcon,
  UsersIcon,
  UtensilsIcon,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cancelReservationAction } from '@/app/reservations/actions';
import type { FormState } from '@/types/actions';
import { toast } from 'sonner';
import { useActionState, useEffect } from 'react';
import { parseISO, format as formatDateFns, isBefore } from 'date-fns';
import { enUS, es as esLocale } from 'date-fns/locale';
import { LoaderSpinner } from '../ui/loader-spinner';

/** Type for valid reservation status values, matching DB constraints and i18n keys. */
export type ReservationStatusValue =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no-show';

const initialCancelFormState: FormState = null;

/**
 * Props for the ReservationCard component.
 */
interface ReservationCardProps {
  /** The reservation object containing details to display. */
  reservation: ReservationWithTableDetails;
  /** The current locale for date and number formatting (e.g., 'en', 'es'). */
  locale: string;
}

/**
 * Maps next-intl locale string to date-fns locale object.
 * @param locale - The next-intl locale string (e.g., 'en', 'es').
 * @returns The corresponding date-fns locale object.
 */
const getDateFnsLocale = (locale: string) => {
  switch (locale) {
    case 'es':
      return esLocale;
    case 'en':
    default:
      return enUS;
  }
};

/**
 * Creates a new Date object whose local time components match the UTC components
 * of the input date. This is useful for displaying UTC dates as if they were local
 * using formatters that operate on local date parts.
 * @param date - The original Date object (presumably a UTC instant).
 * @returns A new Date object configured for display.
 */
const createUtcDateForDisplay = (date: Date): Date => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
};

/**
 * Renders a card displaying the details of a single reservation.
 *
 * @param reservation - The reservation data.
 * @param locale - The current locale.
 * @returns A React component representing a reservation card.
 */
export function ReservationCard({ reservation, locale }: ReservationCardProps) {
  const tReservationsPage = useTranslations('ReservationsPage');
  const tStatus = useTranslations('ReservationStatus');

  const [cancelState, cancelFormAction, isCancelPending] = useActionState(
    cancelReservationAction,
    initialCancelFormState,
  );

  useEffect(() => {
    if (cancelState?.type === 'success') {
      toast.success(cancelState.message);
    } else if (cancelState?.type === 'error') {
      toast.error(cancelState.message);
    }
  }, [cancelState]);

  if (!reservation || !reservation.status) return null;

  const dateFnsLocale = getDateFnsLocale(locale);
  const reservationDateTimeString = `${reservation.reservation_date}T${reservation.reservation_time}Z`;
  const reservationDateTime = parseISO(reservationDateTimeString);

  const displayableReservationDateTime =
    createUtcDateForDisplay(reservationDateTime);

  const formattedDate = formatDateFns(
    displayableReservationDateTime,
    'MMMM d, yyyy',
    {
      locale: dateFnsLocale,
    },
  );

  const formattedTime = formatDateFns(displayableReservationDateTime, 'p', {
    locale: dateFnsLocale,
  });

  type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

  const statusToBadgeVariant: Record<ReservationStatusValue, BadgeVariant> = {
    confirmed: 'default',
    pending: 'secondary',
    cancelled: 'destructive',
    completed: 'outline',
    'no-show': 'secondary',
  };

  const currentBadgeVariant =
    statusToBadgeVariant[reservation.status as ReservationStatusValue] ||
    'secondary';

  const canCurrentlyEdit =
    reservation.status === 'pending' || reservation.status === 'confirmed';

  const formattedCreatedAt = (() => {
    const createdAtUtc = parseISO(reservation.created_at);

    const displayableCreatedAt = createUtcDateForDisplay(createdAtUtc);

    return formatDateFns(displayableCreatedAt, 'PP', {
      locale: dateFnsLocale,
    });
  })();

  const canCurrentlyCancel = (): boolean => {
    if (
      reservation.status === 'cancelled' ||
      reservation.status === 'completed' ||
      reservation.status === 'no-show'
    ) {
      return false;
    }
    const now = new Date();

    const startOfCurrentUTCDayEpoch = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );

    const startOfCurrentUTCDayDate = new Date(startOfCurrentUTCDayEpoch);
    return !isBefore(reservationDateTime, startOfCurrentUTCDayDate);
  };

  return (
    <Card key={reservation.id} className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="leading-5">
            {tReservationsPage('reservationOn', { date: formattedDate })}
          </CardTitle>

          <Badge variant={currentBadgeVariant}>
            {tStatus(reservation.status as ReservationStatusValue) ||
              reservation.status}
          </Badge>
        </div>

        <CardDescription className="flex items-center pt-1">
          <ClockIcon className="mr-1.5 h-3.5 w-3.5" />{' '}
          {tReservationsPage('atTime', { time: formattedTime })}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        <p className="flex items-center">
          <UsersIcon className="mr-2 h-4 w-4 min-w-[16px]" />

          <strong className="mr-1 min-w-[100px]">
            {tReservationsPage('partySizeLabel')}:
          </strong>

          {reservation.party_size}
        </p>

        {reservation.restaurant_tables?.table_number && (
          <p className="flex items-start">
            <UtensilsIcon className="mt-1 mr-2 h-4 w-4 min-w-[16px] flex-shrink-0" />

            <strong className="mr-1 min-w-[100px]">
              {tReservationsPage('tableLabel')}:
            </strong>

            <span>
              {reservation.restaurant_tables.table_number}

              {getSimpleLocalizedValue(
                reservation.restaurant_tables.description_i18n,
                locale,
              ) && (
                <span className="text-muted-foreground ml-1 text-xs">
                  (
                  {getSimpleLocalizedValue(
                    reservation.restaurant_tables.description_i18n,
                    locale,
                  )}
                  )
                </span>
              )}
            </span>
          </p>
        )}

        {getSimpleLocalizedValue(reservation.customer_notes_i18n, locale) && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger className="w-full text-left">
                <div className="flex items-start">
                  <Info className="mt-1 mr-2 h-4 w-4 min-w-[16px] flex-shrink-0" />

                  <p className="truncate">
                    <strong className="mr-1 inline-block min-w-[100px]">
                      {tReservationsPage('notesLabel')}:
                    </strong>

                    <span>
                      {getSimpleLocalizedValue(
                        reservation.customer_notes_i18n,
                        locale,
                      )}
                    </span>
                  </p>
                </div>
              </TooltipTrigger>

              <TooltipContent
                side="bottom"
                className="max-w-xs rounded-md p-2 break-words shadow-md"
              >
                <p className="text-sm">
                  {getSimpleLocalizedValue(
                    reservation.customer_notes_i18n,
                    locale,
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
        <p className="text-muted-foreground text-xs">
          {tReservationsPage('bookedOn', {
            date: formattedCreatedAt,
          })}
        </p>

        <div className="flex gap-2">
          {canCurrentlyEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={{
                  pathname: '/reservations/[id]/edit',
                  params: { id: reservation.id },
                }}
              >
                <Pencil className="h-4 w-4" />
                {tReservationsPage('editButton')}
              </Link>
            </Button>
          )}

          {canCurrentlyCancel() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isCancelPending}
                >
                  {isCancelPending ? (
                    <>
                      <LoaderSpinner size="sm" />
                      {tReservationsPage('cancellingButtonLabel')}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      {tReservationsPage('cancelButton')}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {tReservationsPage('cancelDialog.title')}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {tReservationsPage('cancelDialog.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isCancelPending}>
                    {tReservationsPage('cancelDialog.cancelButtonText')}
                  </AlertDialogCancel>

                  <form action={cancelFormAction}>
                    <input
                      type="hidden"
                      name="reservationId"
                      value={reservation.id}
                    />

                    <AlertDialogAction
                      type="submit"
                      disabled={isCancelPending}
                      className={buttonVariants({ variant: 'destructive' })}
                    >
                      {tReservationsPage('cancelDialog.confirmButtonText')}
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

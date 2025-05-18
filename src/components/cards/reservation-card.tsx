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
import type { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Pencil, XCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

/** Type for valid reservation status values, matching DB constraints and i18n keys. */
export type ReservationStatusValue =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no-show';

/**
 * Props for the ReservationCard component.
 */
interface ReservationCardProps {
  /** The reservation object containing details to display. */
  reservation: ReservationWithTableDetails;
  /** The current locale for date and number formatting (e.g., 'en', 'es'). */
  locale: string; // Using string for locale, can be refined if a specific Locale type is available
  /** The main translation function for ReservationsPage namespace. */
  t: ReturnType<typeof useTranslations<'ReservationsPage'>>;
  /** The translation function for ReservationStatus namespace. */
  tStatus: ReturnType<typeof useTranslations<'ReservationStatus'>>;
}

/**
 * Renders a card displaying the details of a single reservation.
 *
 * @param reservation - The reservation data.
 * @param locale - The current locale.
 * @param t - The main translation function.
 * @param tStatus - The translation function for reservation statuses.
 * @returns A React component representing a reservation card.
 */
export function ReservationCard({
  reservation,
  locale,
  t,
  tStatus,
}: ReservationCardProps) {
  if (!reservation || !reservation.status) return null;

  type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

  const statusToBadgeVariant: Record<ReservationStatusValue, BadgeVariant> = {
    confirmed: 'default',
    pending: 'secondary',
    cancelled: 'destructive',
    completed: 'outline',
    'no-show': 'secondary',
  };

  const canEditOrCancel =
    reservation.status === 'pending' || reservation.status === 'confirmed';

  return (
    <Card key={reservation.id} className="flex flex-col">
      <CardHeader>
        <CardTitle className="leading-5">
          {t('reservationOn', {
            date: new Date(
              reservation.reservation_date + 'T00:00:00Z',
            ).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            }),
          })}
        </CardTitle>

        <CardDescription>
          {t('atTime', {
            time: reservation.reservation_time
              ? reservation.reservation_time.substring(0, 5)
              : 'N/A',
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        <p className="flex items-center">
          <strong className="mr-2 min-w-[100px]">{t('partySizeLabel')}:</strong>
          {reservation.party_size}
        </p>

        <p className="flex items-center">
          <strong className="mr-2 min-w-[100px]">{t('statusLabel')}:</strong>

          <Badge
            variant={
              statusToBadgeVariant[
                reservation.status as ReservationStatusValue
              ] || 'secondary'
            }
          >
            {tStatus(reservation.status as ReservationStatusValue) ||
              reservation.status}
          </Badge>
        </p>

        {reservation.restaurant_tables?.table_number && (
          <p className="flex items-start">
            <strong className="mr-2 min-w-[100px]">{t('tableLabel')}:</strong>

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
          <p className="flex items-start">
            <strong className="mr-2 min-w-[100px]">{t('notesLabel')}:</strong>

            <span className="text-sm">
              {getSimpleLocalizedValue(reservation.customer_notes_i18n, locale)}
            </span>
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          {t('bookedOn', {
            date: new Date(reservation.created_at).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          })}
        </p>

        {canEditOrCancel && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={{
                  pathname: '/reservations/[id]/edit',
                  params: { id: reservation.id },
                }}
              >
                <Pencil className="h-4 w-4" />
                {t('editButton')}
              </Link>
            </Button>

            <Button variant="destructive" size="sm">
              <XCircle className="h-4 w-4" />
              {t('cancelButton')}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getUserReservations } from '@/lib/data/reservations';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PlusCircle } from 'lucide-react';
import { getSimpleLocalizedValue } from '@/lib/utils/localization';

/**
 * Renders the page displaying the current user's reservations.
 *
 * This Server Component fetches reservations from Supabase using a dedicated data function
 * and displays them. It handles user authentication, redirecting to login if necessary.
 * Internationalization is handled via `next-intl`.
 *
 * @param params - Object containing the current locale.
 * @returns A React component rendering the reservations page.
 */
export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReservationsPage' });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });
  const supabase = await createClient();

  const tStatus = await getTranslations({
    locale,
    namespace: 'ReservationStatus',
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/reservations`);
  }

  const reservations = await getUserReservations(user.id);

  if (reservations === null) {
    return (
      <div className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>

          <EmptyState
            title={tCommon('errorTitle')}
            description={tCommon('genericError')}
            iconClassName="bg-destructive/10"
            icon={PlusCircle}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            {t('title')}
          </h1>
          <Button asChild>
            <Link href={`/reservations/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('newReservationButton')}
            </Link>
          </Button>
        </div>

        {reservations && reservations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {t('reservationOn', {
                      date: new Date(
                        reservation.reservation_date,
                      ).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
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
                    <strong className="mr-2 min-w-[100px]">
                      {t('partySizeLabel')}:
                    </strong>
                    {reservation.party_size}
                  </p>
                  <p className="flex items-center">
                    <strong className="mr-2 min-w-[100px]">
                      {t('statusLabel')}:
                    </strong>
                    <Badge
                      variant={
                        reservation.status === 'confirmed'
                          ? 'default'
                          : reservation.status === 'pending'
                            ? 'secondary'
                            : reservation.status === 'cancelled'
                              ? 'destructive'
                              : reservation.status === 'completed'
                                ? 'outline'
                                : 'secondary'
                      }
                    >
                      {tStatus(reservation.status) || reservation.status}
                    </Badge>
                  </p>
                  {reservation.restaurant_tables?.table_number && (
                    <p className="flex items-start">
                      <strong className="mr-2 min-w-[100px]">
                        {t('tableLabel')}:
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
                  {getSimpleLocalizedValue(
                    reservation.customer_notes_i18n,
                    locale,
                  ) && (
                    <p className="flex items-start">
                      <strong className="mr-2 min-w-[100px]">
                        {t('notesLabel')}:
                      </strong>
                      <span className="text-sm">
                        {getSimpleLocalizedValue(
                          reservation.customer_notes_i18n,
                          locale,
                        )}
                      </span>
                    </p>
                  )}
                </CardContent>
                <CardFooter className="mt-auto">
                  <p className="text-muted-foreground text-xs">
                    {t('bookedOn', {
                      date: new Date(reservation.created_at).toLocaleDateString(
                        locale,
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        },
                      ),
                    })}
                  </p>
                  {/* TODO: Add Edit/Cancel buttons if applicable and status allows */}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title={t('noReservationsFound')}
              description={t('noReservationsFoundDescription')}
              icon={PlusCircle}
              actionButtonProps={{
                asChild: true,
                children: (
                  <Link href={`/reservations/new`}>
                    {t('newReservationButton')}
                  </Link>
                ),
                size: 'lg',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

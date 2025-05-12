import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getUserReservations } from '@/lib/data/reservations';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { ReservationCard } from '@/components/cards/reservation-card';

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
  const tErrorPage = await getTranslations({ locale, namespace: 'ErrorPage' });
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
            iconClassName="bg-destructive/10 text-destructive"
            icon={AlertTriangle}
            actionButtonProps={{
              asChild: true,
              children: (
                <Link href={`/reservations`}>{tErrorPage('tryAgain')}</Link>
              ),
              size: 'lg',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            {t('title')}
          </h1>

          <Button asChild>
            <Link href={`/reservations/new`}>
              <PlusCircle className="h-4 w-4" />
              {t('newReservationButton')}
            </Link>
          </Button>
        </div>

        {reservations && reservations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                locale={locale}
                t={t}
                tStatus={tStatus}
              />
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

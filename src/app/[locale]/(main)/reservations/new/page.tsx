'use client';

import { useActionState, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { createReservation } from '@/app/reservations/actions';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { getReservableTables, ReservableTable } from '@/lib/data/tables';
import { ReservationForm } from '@/components/forms/reservation-form';

const initialState: FormState<ReservationActionErrorKeys> = null;

/**
 * Page component for creating a new reservation.
 *
 * This client component renders a form allowing users to input reservation details
 * including selecting a table. It uses `useActionState` to manage form submission
 * with a server action and `next-intl` for internationalization.
 */
export default function NewReservationPage() {
  const tPage = useTranslations('NewReservationPage');
  const tCommon = useTranslations('Common');
  const tForm = useTranslations('ReservationForm');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [state, formAction] = useActionState(createReservation, initialState);

  const [reservableTables, setReservableTables] = useState<ReservableTable[]>(
    [],
  );

  const [allTablesError, setAllTablesError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTables() {
      const result = await getReservableTables();

      if (result.type === 'success') {
        setReservableTables(result.data);
        setAllTablesError(null);
      } else {
        setReservableTables([]);

        const errorMessage = result.messageKey
          ? tCommon(`errors.${result.messageKey}`)
          : result.message || tCommon('genericError');

        setAllTablesError(errorMessage);
        toast.error(errorMessage);
      }
    }

    fetchTables();
  }, [tCommon]);

  useEffect(() => {
    if (state?.type === 'success') {
      toast.success(
        state.messageKey
          ? tForm(`success.${state.messageKey as string}`)
          : state.message || tForm('success.reservationCreated'),
      );

      router.push('/reservations');
    } else if (state?.type === 'error' && state.message) {
      if (!state.fieldErrors) {
        toast.error(
          state.messageKey
            ? tCommon(`errors.${state.messageKey as string}`)
            : state.message || tCommon('genericError'),
        );
      }
    }
  }, [state, tCommon, router, tForm]);

  return (
    <div className="px-4 py-16 md:px-8 lg:px-16">
      <Card className="mx-auto max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {tPage('title')}
          </CardTitle>

          <CardDescription>{tPage('description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <ReservationForm
            formAction={formAction}
            formState={state}
            locale={locale}
            reservableTables={reservableTables}
            allTablesError={allTablesError}
            submitButtonText={tForm('submitButtonText')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

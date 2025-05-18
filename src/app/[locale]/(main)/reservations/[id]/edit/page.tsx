'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import {
  getReservationForEditAction,
  updateReservationAction,
} from '@/app/reservations/actions';
import type { ReservationWithTableDetails } from '@/lib/data/reservations';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getReservableTables } from '@/lib/data/tables';
import type { ReservableTable } from '@/lib/data/tables';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/routing';
import { ReservationForm } from '@/components/forms/reservation-form';

const initialFormState: FormState<ReservationActionErrorKeys> = null;

/**
 * The main page component for editing an existing reservation.
 *
 * This page fetches the reservation details based on the ID from the URL parameters.
 * It also fetches a list of all reservable tables for the form.
 * It uses `useActionState` to manage the form submission process with the `updateReservationAction` server action.
 * The component handles loading states, error display (e.g., if the reservation is not found or fetching fails),
 * and renders the `ReservationForm` with the necessary data and action handlers.
 *
 * @returns A React element representing the edit reservation page.
 */
export default function EditReservationPage() {
  const tPage = useTranslations('EditReservationPage');
  const tCommon = useTranslations('Common');
  const tForm = useTranslations('ReservationForm');
  const params = useParams();
  const locale = params.locale as string;
  const reservationId = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservation, setReservation] =
    useState<ReservationWithTableDetails | null>(null);

  const [reservableTables, setReservableTables] = useState<ReservableTable[]>(
    [],
  );

  const [allTablesError, setAllTablesError] = useState<string | null>(null);

  const [formActionState, formAction] = useActionState(
    updateReservationAction,
    initialFormState,
  );

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
          setError(result.message || tPage('errors.notFound'));
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
  }, [reservationId, tPage, tCommon]);

  useEffect(() => {
    async function fetchAllTables() {
      try {
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
        }
      } catch {
        setReservableTables([]);
        setAllTablesError(tCommon('genericError'));
      }
    }

    fetchAllTables();
  }, [tCommon]);

  useEffect(() => {
    if (formActionState?.type === 'success') {
      toast.success(
        formActionState.messageKey
          ? tForm(`success.${formActionState.messageKey}`)
          : formActionState.message || tPage('success.reservationUpdated'),
      );

      router.push('/reservations');
    } else if (formActionState?.type === 'error' && formActionState.message) {
      if (!formActionState.fieldErrors) {
        toast.error(
          formActionState.messageKey
            ? tCommon(`errors.${formActionState.messageKey as string}`)
            : formActionState.message || tCommon('genericError'),
        );
      }
    }
  }, [formActionState, router, tPage, tCommon, tForm]);

  if (isLoading) {
    return (
      <div className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <p>{tCommon('loading')}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{tCommon('errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{tCommon('errorTitle')}</AlertTitle>
            <AlertDescription>{tPage('errors.notFound')}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
            formState={formActionState}
            initialData={reservation} // Pass the fetched reservation as initialData
            locale={locale}
            reservableTables={reservableTables}
            allTablesError={allTablesError}
            submitButtonText={tPage('updateButtonText')} // Use specific update button text
            reservationId={reservation.id.toString()} // Pass reservationId for the hidden input
          />
        </CardContent>
      </Card>
    </div>
  );
}

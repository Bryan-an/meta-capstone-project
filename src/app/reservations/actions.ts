'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { processZodErrors } from '@/lib/utils/validation';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import { revalidatePath } from 'next/cache';
import { getTranslations, getLocale } from 'next-intl/server';

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format

/**
 * Schema for validating new reservation data.
 *
 * @remarks
 * Corresponds to the `reservations` table structure.
 * Internationalization for error messages is handled by returning keys from `ReservationActionErrorKeys` or general Zod error keys like 'requiredField'.
 */
const ReservationSchema = z.object({
  reservation_date: z.string().min(1, { message: 'requiredField' }),
  reservation_time: z
    .string()
    .regex(TIME_REGEX, { message: 'reservationTimeInvalid' }),
  party_size: z.coerce
    .number()
    .int()
    .min(1, { message: 'partySizeInvalid' })
    .max(20, { message: 'partySizeTooLarge' }),
  customer_notes: z.string().optional(),
});

/**
 * Server action to create a new reservation.
 *
 * Validates the input data, checks user authentication, and inserts the reservation
 * into the Supabase database.
 *
 * @param prevState - The previous form state.
 * @param formData - The form data submitted by the user.
 * @returns A {@link FormState} object indicating success or failure.
 */
export async function createReservation(
  prevState: FormState<ReservationActionErrorKeys> | null,
  formData: FormData,
): Promise<FormState<ReservationActionErrorKeys>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentLocale = await getLocale();
  const t = await getTranslations('ReservationForm');

  if (!user) {
    return {
      type: 'error',
      messageKey: 'userNotAuthenticated',
      message: t('errors.userNotAuthenticated'),
    };
  }

  const rawFormData = {
    reservation_date: formData.get('reservation_date'),
    reservation_time: formData.get('reservation_time'),
    party_size: formData.get('party_size'),
    customer_notes: formData.get('customer_notes'),
  };

  const validationResult = ReservationSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    return processZodErrors(validationResult, t);
  }

  const { reservation_date, reservation_time, party_size, customer_notes } =
    validationResult.data;

  const reservationDateTime = new Date(
    `${reservation_date}T${reservation_time}:00`,
  );

  const now = new Date();

  if (reservationDateTime <= now) {
    return {
      type: 'error',
      messageKey: 'reservationTimeNotInFuture',
      message: t('errors.reservationTimeNotInFuture'),
      fieldErrors: {
        reservation_date: [t('errors.reservationTimeNotInFuture')],
        reservation_time: [t('errors.reservationTimeNotInFuture')],
      },
    };
  }

  const customerNotesI18n = customer_notes
    ? { [currentLocale]: customer_notes }
    : null;

  try {
    const { error } = await supabase.from('reservations').insert({
      user_id: user.id,
      reservation_date,
      reservation_time,
      party_size,
      customer_notes_i18n: customerNotesI18n,
      status: 'pending',
    });

    if (error) {
      return {
        type: 'error',
        messageKey: 'databaseError',
        message: error.message || t('errors.databaseError'),
      };
    }

    revalidatePath(`/${currentLocale}/reservations`);

    return {
      type: 'success',
      message: t('success.reservationCreated'),
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);

    return {
      type: 'error',
      messageKey: 'unknownError',
      message:
        t('errors.unknownError') + (errorMessage ? `: ${errorMessage}` : ''),
    };
  }
}

'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { processZodErrors } from '@/lib/utils/validation';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import type { TablesInsert } from '@/types/supabase';
import { revalidatePath } from 'next/cache';
import { getTranslations, getLocale } from 'next-intl/server';

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format

/**
 * Base schema for validating new reservation data.
 *
 * @remarks
 * Corresponds to the `reservations` table structure.
 * Internationalization for error messages is handled by returning keys from `ReservationActionErrorKeys` or general Zod error keys like 'requiredField'.
 */
const BaseReservationSchema = z.object({
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
  table_id: z.string().optional(),
});

/**
 * Schema for validating new reservation data.
 *
 * @remarks
 * Corresponds to the `reservations` table structure.
 * Internationalization for error messages is handled by returning keys from `ReservationActionErrorKeys` or general Zod error keys like 'requiredField'.
 * Includes a refinement to check if party_size exceeds selected table capacity.
 */
const ReservationSchema = BaseReservationSchema.superRefine(
  async (data: z.infer<typeof BaseReservationSchema>, ctx: z.RefinementCtx) => {
    if (data.table_id && data.party_size) {
      const supabase = await createClient();
      const parsedTableId = parseInt(data.table_id, 10);

      if (isNaN(parsedTableId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'table_id_invalid',
          path: ['table_id'],
        });

        return;
      }

      const { data: tableData, error: tableError } = await supabase
        .from('restaurant_tables')
        .select('capacity')
        .eq('id', parsedTableId)
        .single();

      if (tableError || !tableData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'table_id_invalid',
          path: ['table_id'],
        });

        return;
      }

      if (data.party_size > tableData.capacity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'partySizeExceedsTableCapacity',
          path: ['party_size'],
        });
      }
    }
  },
);

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
    table_id: formData.get('table_id'),
  };

  const validationResult = await ReservationSchema.safeParseAsync(rawFormData);

  if (!validationResult.success) {
    return processZodErrors(validationResult, t);
  }

  const {
    reservation_date,
    reservation_time,
    party_size,
    customer_notes,
    table_id,
  } = validationResult.data;

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

  const reservationData: TablesInsert<'reservations'> = {
    user_id: user.id,
    reservation_date,
    reservation_time,
    party_size,
    customer_notes_i18n: customerNotesI18n,
    status: 'pending',
  };

  if (table_id) {
    const parsedTableId = parseInt(table_id, 10);

    if (isNaN(parsedTableId)) {
      return {
        type: 'error',
        messageKey: 'table_id_invalid',
        message: t('errors.table_id_invalid'),
        fieldErrors: {
          table_id: [t('errors.table_id_invalid')],
        },
      };
    }

    reservationData.table_id = parsedTableId;
  }

  try {
    const { error } = await supabase
      .from('reservations')
      .insert(reservationData);

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

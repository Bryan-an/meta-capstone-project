'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { processZodErrors } from '@/lib/utils/validation';
import type { FormState, ReservationActionErrorKeys } from '@/types/actions';
import type { TablesInsert } from '@/types/supabase';
import { revalidatePath } from 'next/cache';
import { getTranslations, getLocale } from 'next-intl/server';
import {
  fetchReservationByIdForUser,
  type ReservationWithTableDetails,
} from '@/lib/data/reservations';

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
 * Schema for validating reservation update data.
 * Includes all fields from BaseReservationSchema plus the reservationId.
 */
const UpdateReservationSchema = BaseReservationSchema.extend({
  reservationId: z.string().min(1, { message: 'requiredField' }),
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

  if (table_id) {
    const parsedTableId = parseInt(table_id, 10);

    if (!isNaN(parsedTableId)) {
      const { data: existingReservation, error: existingReservationError } =
        await supabase
          .from('reservations')
          .select('id')
          .eq('table_id', parsedTableId)
          .eq('reservation_date', reservation_date)
          .eq('reservation_time', reservation_time)
          .in('status', ['pending', 'confirmed'])
          .maybeSingle();

      if (existingReservationError) {
        return {
          type: 'error',
          messageKey: 'databaseError',
          message:
            existingReservationError.message || t('errors.databaseError'),
        };
      }

      if (existingReservation) {
        return {
          type: 'error',
          messageKey: 'tableAlreadyBookedAtTime',
          message: t('errors.tableAlreadyBookedAtTime'),
          fieldErrors: {
            table_id: [t('errors.tableAlreadyBookedAtTime')],
            reservation_date: [t('errors.tableAlreadyBookedAtTime')],
            reservation_time: [t('errors.tableAlreadyBookedAtTime')],
          },
        };
      }
    }
  }

  const [year, month, day] = reservation_date.split('-').map(Number);
  const [hours, minutes] = reservation_time.split(':').map(Number);

  const reservationTimestampUTC = Date.UTC(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0,
  );

  const currentTimestampUTC = Date.now();

  if (reservationTimestampUTC <= currentTimestampUTC) {
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

/**
 * Server action to fetch a specific reservation for editing.
 *
 * Retrieves the reservation details if the user is authenticated and owns the reservation.
 *
 * @param reservationId - The ID of the reservation to fetch.
 * @returns A promise that resolves to an object containing the reservation data if successful, or an error message if not.
 */
export async function getReservationForEditAction(
  reservationId: string,
): Promise<{
  success: boolean;
  data?: ReservationWithTableDetails | null;
  errorKey?:
    | 'userNotAuthenticated'
    | 'genericError'
    | 'notFound'
    | 'cannotEditStatus'
    | 'missingReservationId';
  message?: string;
}> {
  const supabase = await createClient();
  const tEditErrors = await getTranslations('EditReservationPage.errors');
  const tCommon = await getTranslations('Common');

  const tReservationFormErrors = await getTranslations(
    'ReservationForm.errors',
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errorKey: 'userNotAuthenticated',
      message: tReservationFormErrors('userNotAuthenticated'),
    };
  }

  if (!reservationId) {
    return {
      success: false,
      errorKey: 'missingReservationId',
      message: tCommon('genericError'),
    };
  }

  try {
    const reservation = await fetchReservationByIdForUser(
      reservationId,
      user.id,
    );

    if (!reservation) {
      return {
        success: false,
        errorKey: 'notFound',
        message: tEditErrors('notFound'),
      };
    }

    if (
      reservation.status !== 'pending' &&
      reservation.status !== 'confirmed'
    ) {
      return {
        success: false,
        errorKey: 'cannotEditStatus',
        message: tEditErrors('updateFailed'),
      };
    }

    return { success: true, data: reservation };
  } catch {
    return {
      success: false,
      errorKey: 'genericError',
      message: tCommon('genericError'),
    };
  }
}

/**
 * Server action to update an existing reservation.
 *
 * Validates the input data, checks user authentication, ensures the reservation exists and belongs to the user,
 * and updates the reservation in the Supabase database.
 *
 * @param prevState - The previous form state.
 * @param formData - The form data submitted by the user.
 * @returns A {@link FormState} object indicating success or failure.
 */
export async function updateReservationAction(
  prevState: FormState<ReservationActionErrorKeys> | null,
  formData: FormData,
): Promise<FormState<ReservationActionErrorKeys>> {
  const supabase = await createClient();
  const currentLocale = await getLocale();
  const tReservationForm = await getTranslations('ReservationForm');
  const tEditReservationPage = await getTranslations('EditReservationPage');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      type: 'error',
      messageKey: 'userNotAuthenticated',
      message: tReservationForm('errors.userNotAuthenticated'),
    };
  }

  const rawFormData = {
    reservationId: formData.get('reservationId'),
    reservation_date: formData.get('reservation_date'),
    reservation_time: formData.get('reservation_time'),
    party_size: formData.get('party_size'),
    customer_notes: formData.get('customer_notes'),
    table_id: formData.get('table_id'),
  };

  const validationResult =
    await UpdateReservationSchema.safeParseAsync(rawFormData);

  if (!validationResult.success) {
    return processZodErrors(validationResult, tReservationForm);
  }

  const {
    reservationId,
    reservation_date,
    reservation_time,
    party_size,
    customer_notes,
    table_id,
  } = validationResult.data;

  const { data: existingReservationToUpdate, error: fetchError } =
    await supabase
      .from('reservations')
      .select('id, status, user_id, table_id')
      .eq('id', reservationId)
      .eq('user_id', user.id)
      .single();

  if (fetchError || !existingReservationToUpdate) {
    return {
      type: 'error',
      messageKey: 'databaseError',
      message: tEditReservationPage('errors.notFound'),
    };
  }

  if (
    existingReservationToUpdate.status !== 'pending' &&
    existingReservationToUpdate.status !== 'confirmed'
  ) {
    return {
      type: 'error',
      messageKey: 'databaseError',
      message: tEditReservationPage('errors.updateFailed'),
    };
  }

  const [year, month, day] = reservation_date.split('-').map(Number);
  const [hours, minutes] = reservation_time.split(':').map(Number);

  const reservationTimestampUTC = Date.UTC(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0,
  );

  const currentTimestampUTC = Date.now();

  if (reservationTimestampUTC <= currentTimestampUTC) {
    return {
      type: 'error',
      messageKey: 'reservationTimeNotInFuture',
      message: tReservationForm('errors.reservationTimeNotInFuture'),
      fieldErrors: {
        reservation_date: [
          tReservationForm('errors.reservationTimeNotInFuture'),
        ],
        reservation_time: [
          tReservationForm('errors.reservationTimeNotInFuture'),
        ],
      },
    };
  }

  let newTableId: number | null = existingReservationToUpdate.table_id;

  if (table_id && table_id !== String(existingReservationToUpdate.table_id)) {
    const parsedTableId = parseInt(table_id, 10);

    if (isNaN(parsedTableId)) {
      return {
        type: 'error',
        messageKey: 'table_id_invalid',
        message: tReservationForm('errors.table_id_invalid'),
        fieldErrors: {
          table_id: [tReservationForm('errors.table_id_invalid')],
        },
      };
    }

    const { data: newTableData, error: newTableError } = await supabase
      .from('restaurant_tables')
      .select('capacity')
      .eq('id', parsedTableId)
      .single();

    if (newTableError || !newTableData) {
      return {
        type: 'error',
        messageKey: 'table_id_invalid',
        message: tReservationForm('errors.table_id_invalid'),
        fieldErrors: {
          table_id: [tReservationForm('errors.table_id_invalid')],
        },
      };
    }

    if (party_size > newTableData.capacity) {
      return {
        type: 'error',
        messageKey: 'partySizeExceedsTableCapacity',
        message: tReservationForm('errors.partySizeExceedsTableCapacity'),
        fieldErrors: {
          party_size: [
            tReservationForm('errors.partySizeExceedsTableCapacity'),
          ],
        },
      };
    }

    const { data: conflictingReservation, error: conflictError } =
      await supabase
        .from('reservations')
        .select('id')
        .eq('table_id', parsedTableId)
        .eq('reservation_date', reservation_date)
        .eq('reservation_time', reservation_time)
        .in('status', ['pending', 'confirmed'])
        .not('id', 'eq', reservationId)
        .maybeSingle();

    if (conflictError) {
      return {
        type: 'error',
        messageKey: 'databaseError',
        message:
          conflictError.message || tReservationForm('errors.databaseError'),
      };
    }

    if (conflictingReservation) {
      return {
        type: 'error',
        messageKey: 'tableAlreadyBookedAtTime',
        message: tReservationForm('errors.tableAlreadyBookedAtTime'),
        fieldErrors: {
          table_id: [tReservationForm('errors.tableAlreadyBookedAtTime')],
          reservation_date: [
            tReservationForm('errors.tableAlreadyBookedAtTime'),
          ],
          reservation_time: [
            tReservationForm('errors.tableAlreadyBookedAtTime'),
          ],
        },
      };
    }

    newTableId = parsedTableId;
  } else if (table_id === 'unassign') {
    newTableId = null;
  }

  const customerNotesI18n = customer_notes
    ? { [currentLocale]: customer_notes }
    : null;

  const reservationUpdateData: Partial<TablesInsert<'reservations'>> = {
    reservation_date,
    reservation_time,
    party_size,
    customer_notes_i18n: customerNotesI18n,
    table_id: newTableId,
  };

  try {
    const { error: updateError } = await supabase
      .from('reservations')
      .update(reservationUpdateData)
      .eq('id', reservationId)
      .eq('user_id', user.id);

    if (updateError) {
      return {
        type: 'error',
        messageKey: 'databaseError',
        message:
          updateError.message || tReservationForm('errors.databaseError'),
      };
    }

    revalidatePath(`/${currentLocale}/reservations`);
    revalidatePath(`/${currentLocale}/reservations/${reservationId}/edit`);

    return {
      type: 'success',
      message: tEditReservationPage('success.reservationUpdated'),
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);

    return {
      type: 'error',
      messageKey: 'unknownError',
      message:
        tReservationForm('errors.unknownError') +
        (errorMessage ? `: ${errorMessage}` : ''),
    };
  }
}

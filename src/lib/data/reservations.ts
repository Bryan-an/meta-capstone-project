import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

/**
 * Represents a reservation from the Supabase database.
 */
export type ReservationFromSupabase =
  Database['public']['Tables']['reservations']['Row'];

/**
 * Represents a restaurant table from the Supabase database.
 */
export type RestaurantTableFromSupabase =
  Database['public']['Tables']['restaurant_tables']['Row'];

/**
 * Represents a reservation with details about the associated restaurant table.
 */
export interface ReservationWithTableDetails extends ReservationFromSupabase {
  restaurant_tables?: Pick<
    RestaurantTableFromSupabase,
    'table_number' | 'description_i18n' | 'capacity'
  > | null;
}

/**
 * Fetches all reservations for a given user, including details of the assigned table.
 *
 * @param userId - The ID of the user whose reservations are to be fetched.
 * @returns A promise that resolves to an array of reservations with table details, or null if an error occurs or no user ID is provided.
 */
export async function getUserReservations(
  userId: string | undefined,
): Promise<ReservationWithTableDetails[] | null> {
  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reservations')
    .select(
      `
      *,
      restaurant_tables (
        table_number,
        description_i18n
      )
    `,
    )
    .eq('user_id', userId)
    .order('reservation_date', { ascending: false })
    .order('reservation_time', { ascending: false });

  if (error) {
    return null;
  }

  return data as ReservationWithTableDetails[] | null;
}

/**
 * Fetches a specific reservation by its ID for a given user, including details of the assigned table.
 *
 * @param reservationId - The ID of the reservation to fetch.
 * @param userId - The ID of the user who owns the reservation.
 * @returns A promise that resolves to the reservation with table details, or null if not found, an error occurs, or no user/reservation ID is provided.
 */
export async function fetchReservationByIdForUser(
  reservationId: string,
  userId: string,
): Promise<ReservationWithTableDetails | null> {
  if (!reservationId || !userId) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reservations')
    .select(
      `
      id,
      user_id,
      reservation_date,
      reservation_time,
      party_size,
      status,
      customer_notes_i18n,
      internal_notes_i18n,
      table_id,
      created_at,
      updated_at,
      restaurant_tables (
        table_number,
        description_i18n,
        capacity
      )
    `,
    )
    .eq('id', reservationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }

  return data as unknown as ReservationWithTableDetails | null;
}

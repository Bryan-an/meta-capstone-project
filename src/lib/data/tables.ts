import { createClient } from '@/lib/supabase/client';

/**
 * Represents a reservable table with essential details.
 */
export type ReservableTable = {
  id: number;
  table_number: string;
  capacity: number;
  description_i18n: Record<string, string> | null;
};

/**
 * Server action to fetch reservable tables.
 *
 * @returns A promise that resolves to an object with a type ('success' or 'error').
 *          On success, it includes the data array of reservable tables.
 *          On error, it includes an error message (potentially a key for i18n).
 */
export async function getReservableTables(): Promise<
  | {
      type: 'success';
      data: ReservableTable[];
    }
  | { type: 'error'; message: string; messageKey?: string }
> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('id, table_number, capacity, description_i18n')
      .eq('is_reservable', true)
      .order('table_number', { ascending: true });

    if (error) {
      return {
        type: 'error',
        message: error.message,
        messageKey: 'databaseError',
      };
    }

    const typedData = data.map((table) => ({
      ...table,
      id: Number(table.id),
      description_i18n: table.description_i18n as Record<string, string> | null,
    }));

    return { type: 'success', data: typedData };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);

    return {
      type: 'error',
      message: errorMessage,
      messageKey: 'unknownError',
    };
  }
}

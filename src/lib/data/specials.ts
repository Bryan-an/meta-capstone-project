import { createClient } from '@/lib/supabase/server';
import { type Database } from '@/types/supabase';

/**
 * Represents a menu item from the Supabase database.
 */
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];

/**
 * Represents a fetched special from the Supabase database.
 */
export type FetchedSpecial = Pick<
  Database['public']['Tables']['specials']['Row'],
  'id' | 'start_date' | 'end_date'
> & {
  menu_items: MenuItem | null | MenuItem[];
};

/**
 * Fetches the latest specials (joined with menu items) from Supabase.
 *
 * @param limit - The maximum number of specials to fetch.
 * @returns A promise that resolves to an array of specials, or an empty array on error.
 */
export async function getSpecials(limit = 3): Promise<FetchedSpecial[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('specials')
    .select(
      `
      id,
      start_date,
      end_date,
      menu_items ( id, i18n_content, price, image_url, category_id, created_at, updated_at )
    `,
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase error fetching specials:', error.message);
    return [];
  }

  return (Array.isArray(data) ? data : []) as FetchedSpecial[];
}

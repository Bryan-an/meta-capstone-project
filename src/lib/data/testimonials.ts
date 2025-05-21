import { createClient } from '@/lib/supabase/server';
import { type Database } from '@/types/supabase';

/**
 * Represents a testimonial item from the Supabase database.
 */
export type TestimonialItem =
  Database['public']['Tables']['testimonials']['Row'];

/**
 * Fetches the latest testimonials from Supabase.
 *
 * @param limit - The maximum number of testimonials to fetch.
 * @returns A promise that resolves to an array of testimonials, or an empty array on error.
 */
export async function getTestimonials(limit = 4): Promise<TestimonialItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase error fetching testimonials:', error.message);
    return [];
  }

  return (Array.isArray(data) ? data : []) as TestimonialItem[];
}

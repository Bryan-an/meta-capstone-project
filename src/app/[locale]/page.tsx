import { createClient } from '@/lib/supabase/server';
import { type Database } from '@/types/supabase';

// Import the extracted section components
import { HeroSection } from '@/components/sections/hero-section';
import { SpecialsSection } from '@/components/sections/specials-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { AboutSection } from '@/components/sections/about-section';

// --- Types (kept for data fetching) --- //
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type FetchedSpecial = Pick<
  Database['public']['Tables']['specials']['Row'],
  'id' | 'start_date' | 'end_date'
> & {
  menu_items: MenuItem | null | MenuItem[];
};
type TestimonialItem = Database['public']['Tables']['testimonials']['Row'];

/**
 * The main home page component, assembling the sections.
 * Fetches data from Supabase using the server client.
 *
 * @returns The rendered home page.
 */
export default async function HomePage() {
  const supabase = await createClient();

  // --- Data Fetching --- //
  const { data: specialsData, error: specialsError } = await supabase
    .from('specials')
    .select(
      `
      id,
      start_date,
      end_date,
      menu_items ( id, name, description, price, image_url, category_id )
    `,
    )
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: testimonialsData, error: testimonialsError } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  // Basic error logging
  if (specialsError) {
    console.error('Supabase error fetching specials:', specialsError.message);
  }
  if (testimonialsError) {
    console.error(
      'Supabase error fetching testimonials:',
      testimonialsError.message,
    );
  }

  // Type guard and prepare data for props
  const specials = (
    Array.isArray(specialsData) ? specialsData : []
  ) as FetchedSpecial[];
  const testimonials = (
    Array.isArray(testimonialsData) ? testimonialsData : []
  ) as TestimonialItem[];

  // --- Rendering --- //
  return (
    <main>
      <HeroSection />
      <SpecialsSection specials={specials} />
      <TestimonialsSection testimonials={testimonials} />
      <AboutSection />
    </main>
  );
}

// Removed original definitions of HeroSection, SpecialsSection, TestimonialsSection, AboutSection, StarRating

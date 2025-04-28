import { HeroSection } from '@/components/sections/hero-section';
import { SpecialsSection } from '@/components/sections/specials-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { AboutSection } from '@/components/sections/about-section';
import { getSpecials } from '@/lib/data/specials';
import { getTestimonials } from '@/lib/data/testimonials';

/**
 * The main home page component, assembling the sections.
 * Fetches data by calling dedicated data fetching functions.
 *
 * @returns The rendered home page.
 */
export default async function HomePage() {
  const specials = await getSpecials(3);
  const testimonials = await getTestimonials(4);

  return (
    <main>
      <HeroSection />
      <SpecialsSection specials={specials} />
      <TestimonialsSection testimonials={testimonials} />
      <AboutSection />
    </main>
  );
}

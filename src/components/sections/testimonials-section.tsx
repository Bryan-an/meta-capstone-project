import { getTranslations } from 'next-intl/server';
import { MessageSquareText } from 'lucide-react';
import { TestimonialCard } from '@/components/cards/testimonial-card';
import { EmptyState } from '@/components/ui/empty-state';
import { type Database } from '@/types/supabase';

/**
 * Represents the structure of a testimonial item for display within the card.
 * Uses the generated Supabase type for consistency.
 */
type TestimonialItem = Database['public']['Tables']['testimonials']['Row'];

/**
 * Props for the TestimonialsSection component.
 */
interface TestimonialsSectionProps {
  /** The array of testimonials to display. */
  testimonials: TestimonialItem[];
}

/**
 * Testimonials section component.
 * Renders testimonials fetched from Supabase.
 * @param testimonials - Array of testimonials fetched from the database.
 */
export async function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const t = await getTranslations('Testimonials');

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="px-4 py-16 text-center md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <EmptyState
            title={t('title')}
            description={t('noTestimonialsMessage')}
            icon={MessageSquareText}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-primary mb-12 text-center text-3xl font-medium sm:text-4xl">
          {t('title')}
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

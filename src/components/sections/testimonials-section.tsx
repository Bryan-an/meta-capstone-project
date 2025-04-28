import { getTranslations } from 'next-intl/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating'; // Import the extracted StarRating
import { type Database } from '@/types/supabase'; // Import generated types

// --- Types --- //
type TestimonialItem = Database['public']['Tables']['testimonials']['Row'];

interface TestimonialsSectionProps {
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
      <section className="bg-primary-dark px-4 py-16 text-center md:px-8 lg:px-16">
        <div className="container mx-auto">
          <h2 className="text-primary-light font-display mb-4 text-4xl font-medium">
            {t('title')}
          </h2>
          <p className="text-gray-300">No customer testimonials yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-primary-dark px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto">
        <h2 className="text-primary-light font-display mb-12 text-center text-4xl font-medium">
          {t('title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="rounded-lg border-none bg-white p-6 text-center shadow-lg"
            >
              <CardHeader className="mb-2 p-0">
                {/* Pass rating to async StarRating component */}
                <StarRating rating={testimonial.rating ?? 0} />
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-3 p-0">
                <Avatar className="mb-3 h-20 w-20">
                  <AvatarImage
                    src={
                      testimonial.image_url ?? '/images/avatar_placeholder.png'
                    }
                    alt={`${testimonial.customer_name}`}
                    loading="lazy"
                  />
                  <AvatarFallback>
                    {testimonial.customer_name?.charAt(0) ?? ''}
                  </AvatarFallback>
                </Avatar>
                <p className="text-primary-dark text-lg font-semibold">
                  {testimonial.customer_name}
                </p>
                <blockquote className="font-body text-base text-gray-700 italic">
                  {testimonial.quote ?? ''}
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

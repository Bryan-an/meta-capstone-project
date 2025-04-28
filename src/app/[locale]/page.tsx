import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; // Import server client
import { type Database } from '@/types/supabase'; // Import generated types
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/routing'; // Use the localized Link

// --- Types --- //
// Define types for the data we expect from Supabase
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
// Corrected type for the data structure returned by the Supabase join
type FetchedSpecial = Pick<
  Database['public']['Tables']['specials']['Row'],
  'id' | 'start_date' | 'end_date' // Include necessary fields from specials table
> & {
  // Supabase join might return an array even for one-to-one, or null
  menu_items: MenuItem | null | MenuItem[];
};
type TestimonialItem = Database['public']['Tables']['testimonials']['Row'];

// --- Helper Components --- //

/**
 * Renders a star rating based on a numeric value.
 * Uses server-side translations.
 * @param rating - The rating number (e.g., 1-5).
 */
async function StarRating({ rating }: { rating: number }) {
  const t = await getTranslations('TestimonialCard');
  const validRating = Math.max(0, Math.min(5, Math.round(rating ?? 0)));

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={i < validRating ? 'text-yellow-500' : 'text-gray-400'}
      aria-hidden="true"
    >
      ★
    </span>
  ));
  return (
    <div
      className="flex"
      role="img"
      aria-label={`${t('rating')} ${validRating} ${t('outOf5')}`}
    >
      {stars}
    </div>
  );
}

// --- Page Sections --- //

/**
 * Hero section component.
 */
async function HeroSection() {
  // Make async to use getTranslations
  const t = await getTranslations('Hero'); // Use getTranslations
  return (
    <section className="bg-primary-dark px-4 py-16 text-white md:px-8 lg:px-16">
      <div className="container mx-auto grid items-center gap-8 md:grid-cols-2">
        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-primary-light font-display text-6xl font-bold">
            {t('title')}
          </h1>
          <h2 className="font-regular font-display text-4xl text-white">
            {t('subtitle')}
          </h2>
          <p className="text-lg text-gray-200">{t('description')}</p>
          <Button
            asChild
            size="lg"
            className="bg-primary-light font-bold text-black hover:bg-yellow-300"
          >
            <Link href="/reservations">{t('reserveButton')}</Link>
          </Button>
        </div>

        {/* Image Content */}
        <div className="relative mt-8 h-80 overflow-hidden rounded-lg md:mt-0 md:h-96 lg:h-[450px]">
          <Image
            src="/images/restaurant_food.jpg" // Maintain placeholder for hero
            alt={t('imageAlt')}
            fill
            className="object-cover"
            priority // Prioritize loading the hero image
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Highlights/Specials section component.
 * Renders specials data fetched from Supabase.
 * @param specials - Array of special menu items fetched from the database.
 */
async function SpecialsSection({ specials }: { specials: FetchedSpecial[] }) {
  // Make async
  const t = await getTranslations('Specials'); // Use getTranslations

  // Handle case where specials might be fetched but empty
  if (!specials || specials.length === 0) {
    return (
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-primary-dark mb-4 text-4xl font-medium">
            {t('title')}
          </h2>
          <p className="text-gray-600">No specials available this week.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="font-display text-primary-dark text-4xl font-medium">
            {t('title')}
          </h2>
          <Button
            asChild
            className="bg-primary-light font-bold text-black hover:bg-yellow-300"
          >
            <Link href="/menu">{t('menuButton')}</Link>
          </Button>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {specials.map((special) => {
            // Extract the menu item, handling potential array or null
            const menuItem = Array.isArray(special.menu_items)
              ? special.menu_items[0] // Take the first if it's an array
              : special.menu_items;

            // Skip rendering if the joined menu_item is null
            if (!menuItem) return null;
            const item = menuItem; // Alias for easier access

            return (
              <Card
                key={special.id} // Use the special's ID as the key
                className="flex flex-col overflow-hidden rounded-lg border-none bg-gray-100 shadow-md"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image_url ?? '/images/placeholder_food.jpg'}
                    alt={item.name ?? 'Menu item'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <CardHeader className="flex flex-row items-center justify-between px-4 pt-4">
                  <CardTitle className="font-body text-primary-dark text-xl font-bold">
                    {item.name}
                  </CardTitle>
                  <p className="text-secondary-dark text-lg font-semibold">
                    {typeof item.price === 'number'
                      ? `$${item.price.toFixed(2)}`
                      : 'Price unavailable'}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow px-4 py-2">
                  <CardDescription className="text-primary-dark font-body text-base">
                    {item.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="px-4 pb-4">
                  <Button
                    variant="link"
                    asChild
                    className="text-primary-dark hover:text-secondary-dark h-auto p-0 text-lg font-semibold"
                  >
                    <Link href="/order-online">{t('orderLink')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Testimonials section component.
 * Renders testimonials fetched from Supabase.
 * @param testimonials - Array of testimonials fetched from the database.
 */
async function TestimonialsSection({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  // Make async
  const t = await getTranslations('Testimonials'); // Use getTranslations

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

/**
 * About section component.
 */
async function AboutSection() {
  // Make async
  const t = await getTranslations('About'); // Use getTranslations
  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto grid items-center gap-16 md:grid-cols-2">
        {/* Text Content */}
        <div className="space-y-4">
          <h2 className="text-primary-dark font-display text-6xl font-bold">
            {t('title')}
          </h2>
          <h3 className="font-regular font-display text-4xl text-gray-700">
            {t('subtitle')}
          </h3>
          <p className="font-body text-lg text-gray-800">{t('description1')}</p>
          <p className="font-body text-lg text-gray-800">{t('description2')}</p>
        </div>

        {/* Image Content */}
        <div className="relative h-96">
          {/* Use two images stacked or positioned as per Figma */}
          <div className="absolute top-0 right-10 z-10 h-80 w-64 overflow-hidden rounded-lg lg:h-96 lg:w-72">
            <Image
              src="/images/Mario_and_Adrian_A.jpg" // Placeholder
              alt={t('imageAlt1')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
              loading="lazy"
            />
          </div>
          <div className="absolute bottom-0 left-0 h-80 w-64 overflow-hidden rounded-lg lg:h-96 lg:w-72">
            <Image
              src="/images/Mario_and_Adrian_B.jpg" // Placeholder
              alt={t('imageAlt2')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The main home page component, assembling the sections.
 * Fetches data from Supabase using the server client.
 *
 * @returns The rendered home page.
 */
export default async function HomePage() {
  const supabase = await createClient(); // Use the imported server client creator

  // --- Data Fetching --- //

  // Fetch Specials (Join specials and menu_items)
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

  // Fetch Testimonials
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

  // Type guard and pass fetched data (or empty array if error/null)
  const specials = (
    Array.isArray(specialsData) ? specialsData : []
  ) as FetchedSpecial[];
  const testimonials = (
    Array.isArray(testimonialsData) ? testimonialsData : []
  ) as TestimonialItem[];

  return (
    <main>
      <HeroSection />
      <SpecialsSection specials={specials} />
      <TestimonialsSection testimonials={testimonials} />
      <AboutSection />
    </main>
  );
}

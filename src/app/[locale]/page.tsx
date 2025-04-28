import Image from 'next/image';
import { useTranslations } from 'next-intl';

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

// --- Placeholder Data --- //

// TODO: Replace with actual data fetching (e.g., from Supabase)
const specials = [
  {
    id: 1,
    name: 'Greek Salad',
    price: '$12.99',
    description:
      'The famous Greek salad of crispy lettuce, peppers, olives and our Chicago style feta cheese, garnished with crunchy garlic and rosemary croutons.',
    imageUrl: '/images/greek_salad.jpg', // Placeholder image path
  },
  {
    id: 2,
    name: 'Bruchetta',
    price: '$5.99',
    description:
      'Our Bruschetta is made from grilled bread that has been smeared with garlic and seasoned with salt and olive oil.',
    imageUrl: '/images/bruchetta.svg', // Placeholder image path
  },
  {
    id: 3,
    name: 'Lemon Dessert',
    price: '$5.00',
    description:
      "This comes straight from grandma's recipe book, every last ingredient has been sourced and is as authentic as can be imagined.",
    imageUrl: '/images/lemon_dessert.jpg', // Placeholder image path
  },
];

// TODO: Replace with actual data fetching
const testimonials = [
  {
    id: 1,
    name: 'Sarah K.',
    rating: 5,
    quote: 'Absolutely loved the atmosphere and the food! Highly recommend.',
    imageUrl: '/images/customer1.jpg', // Placeholder image path
  },
  {
    id: 2,
    name: 'John D.',
    rating: 4,
    quote: 'Great place for a date night. The Lemon Dessert was fantastic.',
    imageUrl: '/images/customer2.jpg', // Placeholder image path
  },
  {
    id: 3,
    name: 'Maria G.',
    rating: 5,
    quote: 'Authentic Mediterranean flavors! Felt like I was back home.',
    imageUrl: '/images/customer3.jpg', // Placeholder image path
  },
  {
    id: 4,
    name: 'David L.',
    rating: 4,
    quote: 'The Bruschetta was simple but perfect. Excellent service too.',
    imageUrl: '/images/customer4.jpg', // Placeholder image path
  },
];

// --- Helper Components --- //

/**
 * Renders a star rating based on a numeric value.
 * @param rating - The rating number (e.g., 1-5).
 */
function StarRating({ rating }: { rating: number }) {
  const t = useTranslations('TestimonialCard');
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-400'}>
      ★
    </span>
  ));
  return (
    <div
      className="flex"
      aria-label={`${t('rating')} ${rating} ${t('outOf5')}`}
    >
      {stars}
    </div>
  );
}

// --- Page Sections --- //

/**
 * Hero section component.
 */
function HeroSection() {
  const t = useTranslations('Hero');
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
            src="/images/restaurant_food.jpg" // Placeholder image path
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
 */
function SpecialsSection() {
  const t = useTranslations('Specials');
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
          {specials.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col overflow-hidden rounded-lg border-none bg-gray-100 shadow-md"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.name} // Use specific alt text
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <CardHeader className="flex flex-row items-center justify-between px-4 pt-4">
                <CardTitle className="font-body text-primary-dark text-xl font-bold">
                  {item.name}
                </CardTitle>
                <p className="text-secondary-dark text-lg font-semibold">
                  {item.price}
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
                {/* Potential Icon Here - Requires installing an icon library */}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Testimonials section component.
 */
function TestimonialsSection() {
  const t = useTranslations('Testimonials');
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
                <StarRating rating={testimonial.rating} />
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-3 p-0">
                <Avatar className="mb-3 h-20 w-20">
                  <AvatarImage
                    src={testimonial.imageUrl}
                    alt={`${testimonial.name}`}
                  />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-primary-dark text-lg font-semibold">
                  {testimonial.name}
                </p>
                <blockquote className="font-body text-base text-gray-700 italic">
                  {testimonial.quote}
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
function AboutSection() {
  const t = useTranslations('About');
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
            />
          </div>
          <div className="absolute bottom-0 left-0 h-80 w-64 overflow-hidden rounded-lg lg:h-96 lg:w-72">
            <Image
              src="/images/Mario_and_Adrian_B.jpg" // Placeholder
              alt={t('imageAlt2')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The main home page component, assembling the sections.
 *
 * @returns The rendered home page.
 */
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SpecialsSection />
      <TestimonialsSection />
      <AboutSection />
    </main>
  );
}

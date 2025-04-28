import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

/**
 * Hero section component for the home page.
 */
export async function HeroSection() {
  const t = await getTranslations('Hero');
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

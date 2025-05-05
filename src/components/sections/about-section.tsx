import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

/**
 * About section component for the home page.
 */
export async function AboutSection() {
  const t = await getTranslations('About');

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto grid max-w-6xl items-center gap-8 sm:gap-16 md:grid-cols-2">
        {/* Text Content */}
        <div className="space-y-4">
          <h2 className="text-primary text-6xl font-bold">{t('title')}</h2>
          <h3 className="text-4xl text-gray-700">{t('subtitle')}</h3>
          <p className="text-lg text-gray-800">{t('description1')}</p>
          <p className="text-lg text-gray-800">{t('description2')}</p>
        </div>

        {/* Image Content */}
        <div className="h-96">
          <div className="relative h-80 w-full overflow-hidden rounded-lg lg:h-96 lg:w-full">
            <Image
              src="/images/mario-and-adrian-a.webp"
              alt={t('imageAlt1')}
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

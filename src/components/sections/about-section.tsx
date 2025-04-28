import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

/**
 * About section component for the home page.
 */
export async function AboutSection() {
  const t = await getTranslations('About');
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

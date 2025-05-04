import { getTranslations } from 'next-intl/server';

/**
 * Renders a star rating based on a numeric value.
 * Uses server-side translations.
 * @param rating - The rating number (e.g., 1-5).
 */
export async function StarRating({ rating }: { rating: number }) {
  const t = await getTranslations('TestimonialCard');
  const validRating = Math.max(0, Math.min(5, Math.round(rating ?? 0))); // Ensure rating is 0-5

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

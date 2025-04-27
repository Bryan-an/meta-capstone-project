import { useTranslations } from 'next-intl';

/**
 * The main home page component.
 *
 * @remarks
 * This component fetches translations using the `useTranslations` hook with the
 * 'HomePage' namespace.
 * It relies on the locale context being set by the RootLayout.
 * No explicit `setRequestLocale` is needed here as layout handles it.
 *
 * @returns The rendered main page content.
 */
export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <main>
      {/* Consider using semantic headings (h1 only once per page ideally) */}
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      {/* Future page components can be added here */}
    </main>
  );
}

import { useTranslations } from 'next-intl';
// import { setRequestLocale } from 'next-intl/server'; // Remove

// No longer need params if context is set by request.ts
// export default function HomePage({ params: { locale } }: { params: { locale: string }}) {
export default function HomePage() {
  // // Set the locale context **before** using next-intl APIs (REMOVED)
  // try {
  //   setRequestLocale(locale);
  // } catch (error) {
  //   console.error(`[page.tsx] Error calling setRequestLocale for locale ${locale}:`, error);
  // }

  const t = useTranslations('HomePage');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      {/* Add other page components here */}
    </main>
  );
}

import { getTranslations } from 'next-intl/server';
import { SpecialCard } from '@/components/cards/special-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Link } from '@/i18n/routing';
import { type Database } from '@/types/supabase';

/**
 * Type for the menu item data structure.
 */
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

/**
 * Type for the data structure expected by this component.
 */
type FetchedSpecial = Pick<
  Database['public']['Tables']['specials']['Row'],
  'id' | 'start_date' | 'end_date'
> & {
  menu_items: MenuItem | null | MenuItem[];
};

/**
 * Props for the SpecialsSection component.
 */
interface SpecialsSectionProps {
  specials: FetchedSpecial[];
}

/**
 * Highlights/Specials section component.
 * Renders specials data fetched from Supabase.
 * @param specials - Array of special menu items fetched from the database.
 */
export async function SpecialsSection({ specials }: SpecialsSectionProps) {
  const t = await getTranslations('Specials');
  const orderLinkText = t('orderLink'); // Get translated text once

  /**
   * Handle case where specials might be fetched but empty.
   */
  if (!specials || specials.length === 0) {
    return (
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl text-center">
          <EmptyState
            title={t('title')}
            description={t('noSpecialsMessage')}
            className="mt-8"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col items-center justify-between gap-6 sm:mb-12 sm:flex-row">
          <h2 className="text-primary text-center text-3xl font-medium sm:text-start sm:text-4xl">
            {t('title')}
          </h2>

          <Button asChild size="lg">
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

            return (
              <SpecialCard
                key={special.id}
                item={menuItem}
                orderLinkText={orderLinkText}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

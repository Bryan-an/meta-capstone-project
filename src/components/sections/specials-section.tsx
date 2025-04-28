import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { type Database } from '@/types/supabase'; // Import generated types

// --- Types --- //
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
// Type for the data structure expected by this component
type FetchedSpecial = Pick<
  Database['public']['Tables']['specials']['Row'],
  'id' | 'start_date' | 'end_date'
> & {
  menu_items: MenuItem | null | MenuItem[];
};

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

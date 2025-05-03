import Image from 'next/image';
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
import { type Database } from '@/types/supabase';

/**
 * Represents the structure of a menu item for display within the card.
 * Uses the generated Supabase type for consistency.
 */
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

/**
 * Props for the SpecialCard component.
 */
interface SpecialCardProps {
  /** The menu item data to display in the card. */
  item: MenuItem;
  /** The translated text for the 'Order Online' link. */
  orderLinkText: string;
}

/**
 * Renders a card displaying a single special menu item.
 *
 * @param item - The menu item data object.
 * @param orderLinkText - The localized text for the order link.
 */
export function SpecialCard({ item, orderLinkText }: SpecialCardProps) {
  return (
    <Card className="text-card-foreground bg-card flex flex-col overflow-hidden rounded-lg py-0 shadow-md">
      <div className="relative h-48 w-full">
        <Image
          src={item.image_url ?? '/images/placeholder-food.webp'}
          alt={item.name ?? 'Menu item'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardTitle className="text-xl font-bold">{item.name}</CardTitle>

        <p className="text-secondary-foreground text-xl font-semibold">
          {typeof item.price === 'number'
            ? `$${item.price.toFixed(2)}`
            : 'Price unavailable'}
        </p>
      </CardHeader>

      <CardContent className="flex-grow px-4 py-2">
        <CardDescription className="text-muted-foreground text-base">
          {item.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="px-4 pb-6">
        <Button
          variant="link"
          asChild
          className="text-primary hover:text-primary/90 h-auto p-0 text-lg font-semibold"
        >
          <Link href="/order-online">{orderLinkText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

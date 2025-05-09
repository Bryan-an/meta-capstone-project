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

/**
 * Props for the SpecialCard component.
 */
interface SpecialCardProps {
  /** The localized name of the menu item. */
  name: string;
  /** The localized description of the menu item. */
  description: string | null;
  /** The price of the menu item. */
  price: number;
  /** The URL for the menu item's image. */
  imageUrl: string | null;
  /** The translated text for the 'Order Online' link. */
  orderLinkText: string;
}

/**
 * Renders a card displaying a single special menu item.
 *
 * @param name - The localized name of the menu item.
 * @param description - The localized description of the menu item.
 * @param price - The price of the menu item.
 * @param imageUrl - The URL for the menu item's image.
 * @param orderLinkText - The localized text for the order link.
 */
export function SpecialCard({
  name,
  description,
  price,
  imageUrl,
  orderLinkText,
}: SpecialCardProps) {
  return (
    <Card className="bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg py-0 shadow-md">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl ?? '/images/placeholder-food.webp'}
          alt={name ?? 'Menu item'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>

        <p className="text-secondary-foreground text-xl font-semibold">
          {typeof price === 'number'
            ? `$${price.toFixed(2)}`
            : 'Price unavailable'}
        </p>
      </CardHeader>

      <CardContent className="flex-grow px-4 py-2">
        <CardDescription className="text-muted-foreground text-base">
          {description}
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

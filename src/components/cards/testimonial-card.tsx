import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';

/**
 * Props for the TestimonialCard component.
 */
interface TestimonialCardProps {
  id: number;
  rating: number;
  imageUrl: string | null;
  customerName: string;
  quoteText: string;
}

/**
 * Renders a card displaying a single customer testimonial.
 */
export function TestimonialCard({
  id,
  rating,
  imageUrl,
  customerName,
  quoteText,
}: TestimonialCardProps) {
  return (
    <Card
      key={id}
      className="text-card-foreground bg-card rounded-lg p-6 text-center"
    >
      <CardHeader className="mb-2 p-0">
        <StarRating rating={rating} />
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-3 p-0">
        <Avatar className="mb-3 h-20 w-20">
          <AvatarImage
            src={imageUrl ?? '/images/avatar-placeholder.webp'}
            alt={customerName}
            loading="lazy"
            className="object-cover object-center"
          />
          <AvatarFallback>{customerName?.charAt(0) ?? ''}</AvatarFallback>
        </Avatar>

        <p className="text-primary text-lg font-semibold">{customerName}</p>

        <blockquote className="text-muted-foreground text-base italic">
          {quoteText}
        </blockquote>
      </CardContent>
    </Card>
  );
}

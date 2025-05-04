import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { type Database } from '@/types/supabase';

/**
 * Represents the structure of a testimonial item.
 */
type TestimonialItem = Database['public']['Tables']['testimonials']['Row'];

/**
 * Props for the TestimonialCard component.
 */
interface TestimonialCardProps {
  /** The testimonial data object. */
  testimonial: TestimonialItem;
}

/**
 * Renders a card displaying a single customer testimonial.
 *
 * @param testimonial - The testimonial data object.
 */
export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card
      key={testimonial.id}
      className="text-card-foreground bg-card rounded-lg p-6 text-center"
    >
      <CardHeader className="mb-2 p-0">
        <StarRating rating={testimonial.rating ?? 0} />
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-3 p-0">
        <Avatar className="mb-3 h-20 w-20">
          <AvatarImage
            src={testimonial.image_url ?? '/images/avatar-placeholder.webp'}
            alt={`${testimonial.customer_name}`}
            loading="lazy"
            className="object-cover object-center"
          />
          <AvatarFallback>
            {testimonial.customer_name?.charAt(0) ?? ''}
          </AvatarFallback>
        </Avatar>

        <p className="text-primary text-lg font-semibold">
          {testimonial.customer_name}
        </p>

        <blockquote className="text-muted-foreground text-base italic">
          {testimonial.quote ?? ''}
        </blockquote>
      </CardContent>
    </Card>
  );
}

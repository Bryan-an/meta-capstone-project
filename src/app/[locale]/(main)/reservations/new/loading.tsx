import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Renders a skeleton loading UI for the New Reservation page.
 *
 * This component is automatically displayed by Next.js when the corresponding
 * page component (`src/app/[locale]/(main)/reservations/new/page.tsx`) is loading.
 * It mimics the layout of the actual page with skeleton elements.
 */
export default function LoadingNewReservationPage() {
  return (
    <div className="px-4 py-12 md:px-8 lg:px-16">
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-3/4 rounded-md" />
          <Skeleton className="mx-auto h-5 w-1/2 rounded-md" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date Field Skeleton */}
          <div>
            <Skeleton className="mb-1 h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Time Field Skeleton */}
          <div>
            <Skeleton className="mb-1 h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Party Size Field Skeleton */}
          <div>
            <Skeleton className="mb-1 h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Notes Field Skeleton */}
          <div>
            <Skeleton className="mb-1 h-4 w-1/4 rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

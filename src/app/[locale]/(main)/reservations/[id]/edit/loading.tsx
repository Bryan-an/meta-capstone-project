import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A loading skeleton for the Edit Reservation page.
 */
export default function EditReservationLoading() {
  return (
    <div className="px-4 py-16 md:px-8 lg:px-16">
      <Card className="mx-auto max-w-xl">
        <CardHeader className="text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-3/4" />
          <Skeleton className="mx-auto h-4 w-1/2" />
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Date Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Time Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Party Size Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Table Selection Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Customer Notes Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Submit Button Skeleton */}
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

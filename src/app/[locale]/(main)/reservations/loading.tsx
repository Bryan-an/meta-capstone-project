import { Skeleton } from '@/components/ui/skeleton';

/**
 * Renders a skeleton loading UI for the ReservationsPage.
 *
 * This component is automatically displayed by Next.js when the corresponding
 * page component (`src/app/[locale]/(main)/reservations/page.tsx`) is fetching data.
 * It mimics the layout of the actual page with skeleton elements.
 */
export default async function LoadingReservations() {
  return (
    <div className="px-4 py-16 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <Skeleton className="h-10 w-1/2 rounded-md md:w-1/3" />
          <Skeleton className="h-10 w-full rounded-md md:w-[220px]" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-card flex flex-col rounded-lg border p-6 shadow-sm"
            >
              {/* CardHeader Skeleton */}
              <div className="mb-4 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>

              {/* CardContent Skeleton */}
              <div className="flex-grow space-y-3">
                <div className="flex items-center">
                  <Skeleton className="mr-2 h-5 w-[100px] rounded-md" />
                  <Skeleton className="h-5 w-1/4 rounded-md" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="mr-2 h-5 w-[100px] rounded-md" />
                  <Skeleton className="h-8 w-1/3 rounded-md" />
                </div>
                <div className="flex items-start">
                  <Skeleton className="mr-2 h-5 w-[100px] rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-5 w-1/2 rounded-md" />
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                  </div>
                </div>
                <div className="flex items-start">
                  <Skeleton className="mr-2 h-5 w-[100px] rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* CardFooter Skeleton */}
              <div className="mt-auto flex items-center justify-between pt-4">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-[80px] rounded-md" />
                  <Skeleton className="h-9 w-[90px] rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

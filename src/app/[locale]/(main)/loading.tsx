import { Skeleton } from '@/components/ui/skeleton';

/**
 * Custom skeleton loading component for the homepage.
 * Mimics the layout of the main page sections.
 */
export default function Loading() {
  return (
    <div className="space-y-16">
      {/* Hero Section Skeleton */}
      <section className="bg-primary px-4 py-16 text-white md:px-8 lg:px-16">
        <div className="container mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="bg-primary-foreground/20 h-16 w-3/4" />
            <Skeleton className="bg-primary-foreground/20 h-10 w-1/2" />
            <Skeleton className="bg-primary-foreground/20 h-6 w-full" />
            <Skeleton className="bg-primary-foreground/20 h-6 w-5/6" />
            <Skeleton className="bg-secondary/80 h-12 w-40 rounded-md" />
          </div>
          <div className="relative mt-8 h-80 overflow-hidden rounded-lg md:mt-0 md:h-96 lg:h-[450px]">
            <Skeleton className="bg-primary-foreground/20 h-full w-full" />
          </div>
        </div>
      </section>

      {/* Specials Section Skeleton */}
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col items-center justify-between gap-6 sm:mb-12 sm:flex-row">
            <Skeleton className="h-10 w-1/2 sm:w-1/3" />
            <Skeleton className="h-12 w-32 rounded-md" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card text-card-foreground rounded-lg border shadow-sm"
              >
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <div className="flex flex-col space-y-3 p-6">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="mt-2 h-10 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section Skeleton */}
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="mx-auto mb-12 h-10 w-1/2 sm:w-1/3" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="mb-1 h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section Skeleton */}
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="container mx-auto grid max-w-6xl items-center gap-8 sm:gap-16 md:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-lg lg:h-96 lg:w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </section>
    </div>
  );
}

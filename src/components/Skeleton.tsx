export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />
}

/** Same footprint as <BookGrid>, so nothing jumps when the books arrive. */
export function BookGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading books" className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="clay p-3 pb-4">
          <Skeleton className="aspect-[2/3] w-full rounded-[1.2rem]" />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function TileGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-2 gap-5 md:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-40 rounded-[1.75rem]" />
      ))}
    </div>
  )
}

/** Shown while a page's code is being fetched. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="py-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <Skeleton className="mt-8 h-64 w-full rounded-[1.75rem]" />
    </div>
  )
}

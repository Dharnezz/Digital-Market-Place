function SkeletonBlock({ className = '', children }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} aria-hidden="true">
      {children}
    </div>
  )
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-6 w-12" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-4 w-16" />
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <SkeletonBlock className="h-4 w-1/4" />
              <SkeletonBlock className="h-4 w-1/5" />
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LoadingSkeleton({ variant = 'cards' }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading...</span>
      {variant === 'table' ? <TableSkeleton /> : <StatCardsSkeleton />}
    </div>
  )
}
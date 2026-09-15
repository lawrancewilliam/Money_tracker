export function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-white/10 rounded-lg ${className || ''}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 border border-gray-100 dark:border-white/5">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
      <Skeleton className="h-4 w-40 mb-6" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 border border-gray-100 dark:border-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <TransactionRowSkeleton key={i} />
      ))}
    </div>
  );
}

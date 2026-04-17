import { Skeleton } from '@/components/ui/skeleton'

export default function UsercpLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Skeleton className="h-7 w-64 mb-6" />

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-52 shrink-0">
          <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-2 space-y-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'
import { Trophy } from 'lucide-react'

export default function RankingsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Trophy size={24} className="text-[var(--color-game-accent)]" />
        <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)]">Rankings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar skeleton */}
        <aside className="lg:w-48 shrink-0">
          <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-2 space-y-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </aside>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'
import { Newspaper } from 'lucide-react'

export default function NewsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Newspaper size={24} className="text-[var(--color-game-accent)]" />
        <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)]">Notícias</h1>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
            <Skeleton className="h-5 w-3/4 mb-3" />
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}

import { Loader2 } from 'lucide-react'

export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[var(--color-game-accent)]" />
    </div>
  )
}

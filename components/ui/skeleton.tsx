import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-[var(--color-game-border-bright)]/40',
        className
      )}
    />
  )
}

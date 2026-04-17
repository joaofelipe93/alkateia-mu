import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 py-2 text-sm text-[var(--color-game-text)] placeholder:text-[var(--color-game-muted)] transition-colors focus:border-[var(--color-game-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-game-primary)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }

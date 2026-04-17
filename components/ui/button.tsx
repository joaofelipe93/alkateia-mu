'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-game-accent)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-game-primary)] text-white hover:bg-[var(--color-game-primary-hover)] border border-[var(--color-game-primary-hover)]',
        accent:
          'bg-[var(--color-game-accent)] text-[var(--color-game-bg)] hover:bg-[var(--color-game-accent-dim)] font-semibold',
        outline:
          'border border-[var(--color-game-border-bright)] text-[var(--color-game-text)] hover:border-[var(--color-game-primary)] hover:text-[var(--color-game-accent)] bg-transparent',
        ghost:
          'text-[var(--color-game-muted)] hover:text-[var(--color-game-text)] hover:bg-[var(--color-game-surface)] bg-transparent',
        danger:
          'bg-[var(--color-game-error)] text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

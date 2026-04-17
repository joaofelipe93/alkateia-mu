'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  value: string
  className?: string
  size?: number
  label?: string
}

export function CopyButton({ value, className, size = 14, label = 'Copiar' }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API não disponível
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={label}
      className={cn(
        'text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] transition-colors',
        className
      )}
    >
      {copied ? <Check size={size} className="text-[var(--color-game-success)]" /> : <Copy size={size} />}
    </button>
  )
}

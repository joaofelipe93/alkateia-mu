'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  iGrupo: number
  iIndex: number
  size?: number
  className?: string
  alt?: string
}

/**
 * Exibe imagem do item baseado em iGrupo-iIndex.gif.
 * Imagens copiadas de /img/webshop/items/ do projeto PHP original.
 * Fallback: ícone Package quando a imagem não existe.
 */
export function ItemImage({ iGrupo, iIndex, size = 48, className, alt }: Props) {
  const [error, setError] = useState(false)
  const src = `/img/webshop/items/${iGrupo}-${iIndex}.gif`

  if (error) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Package size={size * 0.7} className="text-[var(--color-game-muted)]" />
      </div>
    )
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt ?? `Item ${iGrupo}-${iIndex}`}
      className={cn('object-contain', className)}
      style={{ maxHeight: size, maxWidth: size }}
      onError={() => setError(true)}
    />
  )
}

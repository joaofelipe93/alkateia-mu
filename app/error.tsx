'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle size={48} className="text-[var(--color-game-warning)] mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-[var(--color-game-text)] mb-2">
          Algo deu errado
        </h2>
        <p className="text-sm text-[var(--color-game-muted)] mb-6">
          Ocorreu um erro inesperado. Se o problema persistir, tente novamente mais tarde.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={reset}>Tentar novamente</Button>
          <Button variant="outline" asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

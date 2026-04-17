import Link from 'next/link'
import { Swords, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Swords
              size={64}
              className="text-[var(--color-game-primary)] opacity-30 rotate-45"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-display text-5xl font-bold glow-accent"
                style={{ color: 'var(--color-game-accent)' }}
              >
                404
              </span>
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)] mb-3">
          Página não encontrada
        </h1>

        <p className="text-[var(--color-game-muted)] mb-8 leading-relaxed">
          A página que você procura não existe ou foi movida.
          Verifique o endereço ou volte ao início.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="accent" size="lg" asChild>
            <Link href="/">
              <Home size={16} />
              Voltar ao início
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/news">
              <ArrowLeft size={16} />
              Ver notícias
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { Download, Monitor, HardDrive, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Downloads',
  description: 'Baixe o cliente e patches do servidor AlkateiaMU.',
}

const downloads = [
  {
    name: 'Cliente MU Online — Season 8',
    description: 'Cliente completo do jogo para Windows. Inclui todos os patches necessários.',
    size: '~2.5 GB',
    type: 'Cliente Completo',
    icon: Monitor,
    // href: 'https://link-do-cliente.com', // configurar URL real
  },
  {
    name: 'Patch AlkateiaMU',
    description: 'Patch de atualização para quem já possui o cliente instalado.',
    size: '~150 MB',
    type: 'Atualização',
    icon: HardDrive,
    // href: 'https://link-do-patch.com', // configurar URL real
  },
]

export default function DownloadsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Download size={24} className="text-[var(--color-game-accent)]" />
        <h1 className="font-display text-3xl font-bold text-[var(--color-game-text)]">
          Downloads
        </h1>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 bg-[var(--color-game-primary)]/10 border border-[var(--color-game-primary)]/30 rounded-xl px-5 py-4 mb-8">
        <AlertCircle size={18} className="text-[var(--color-game-accent)] mt-0.5 shrink-0" />
        <div className="text-sm text-[var(--color-game-muted)]">
          <p className="font-medium text-[var(--color-game-text)] mb-1">Requisitos mínimos</p>
          <p>Windows 7/8/10/11 • 4GB RAM • DirectX 9 • 3GB de espaço em disco</p>
        </div>
      </div>

      {/* Downloads */}
      <div className="space-y-4">
        {downloads.map(({ name, description, size, type, icon: Icon }) => (
          <div
            key={name}
            className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <div className="p-3 bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)] rounded-lg self-start">
              <Icon size={24} className="text-[var(--color-game-accent)]" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-semibold text-[var(--color-game-text)]">{name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-game-primary)]/20 text-[var(--color-game-accent)] border border-[var(--color-game-primary)]/30">
                  {type}
                </span>
              </div>
              <p className="text-sm text-[var(--color-game-muted)] mb-2">{description}</p>
              <p className="text-xs text-[var(--color-game-muted)]">Tamanho: {size}</p>
            </div>

            <Button variant="accent" size="md" className="self-start sm:self-center shrink-0">
              <Download size={16} />
              Baixar
            </Button>
          </div>
        ))}
      </div>

      {/* How to install */}
      <div className="mt-10 bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-game-text)] mb-4">
          Como instalar
        </h2>
        <ol className="space-y-3 text-sm text-[var(--color-game-muted)]">
          {[
            'Baixe o cliente completo e extraia em uma pasta de sua preferência.',
            'Execute o arquivo "Main.exe" como administrador.',
            'Configure o servidor para AlkateiaMU (IP e porta já estão configurados no cliente).',
            'Crie sua conta no site e faça login no jogo.',
            'Aproveite!',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-game-primary)]/20 border border-[var(--color-game-primary)]/30 text-[var(--color-game-accent)] text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

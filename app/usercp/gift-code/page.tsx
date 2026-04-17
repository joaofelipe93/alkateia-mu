import { Construction } from 'lucide-react'
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Construction size={40} className="text-[var(--color-game-warning)] mb-4" />
      <h2 className="font-display text-xl font-bold text-[var(--color-game-text)] mb-2">Em breve</h2>
      <p className="text-sm text-[var(--color-game-muted)]">Esta funcionalidade está sendo implementada.</p>
    </div>
  )
}

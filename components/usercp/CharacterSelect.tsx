import type { CharacterData } from '@/lib/db/character'

interface Props {
  characters: CharacterData[]
  name?: string
}

export function CharacterSelect({ characters, name = 'character' }: Props) {
  return (
    <select
      name={name}
      required
      className="flex h-10 w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 py-2 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-game-primary)]"
    >
      <option value="">— Selecione um personagem —</option>
      {characters.map(c => (
        <option key={c.Name} value={c.Name}>
          {c.Name} ({c.className} • Lv {c.cLevel} • {c.ResetCount}R)
        </option>
      ))}
    </select>
  )
}

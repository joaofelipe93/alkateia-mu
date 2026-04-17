'use client'

import { useActionState, useState, useMemo } from 'react'
import Link from 'next/link'
import { ShoppingCart, X, Package, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { ItemImage } from '@/components/shop/ItemImage'
import { buySemiItem, buyFullItem } from '@/lib/actions/webshop'
import { calculateSemiPrice } from '@/lib/game/pricing'
import type { ShopItem } from '@/lib/db/webshop'
import type { CharacterData } from '@/lib/db/character'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }
type Currency = 'WCoinP' | 'WCoinC'

const EXE_OPTIONS = [
  { bit: 1,  label: 'Mana +' },
  { bit: 2,  label: 'HP +' },
  { bit: 4,  label: 'Attack Speed +' },
  { bit: 8,  label: 'Dmg Wizardry +' },
  { bit: 16, label: 'Dmg +' },
  { bit: 32, label: 'Excellent Dmg' },
]

const HARMONY_OPTIONS = [0, 4, 8, 12, 16, 20, 24, 28]
const SOCKET_OPTIONS  = [0xFF, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

interface Props {
  items: ShopItem[]
  characters: CharacterData[]
  selectedGrupo: number | undefined
  categories: readonly { grupo: number; label: string; icon: string }[]
  variant: 'semi' | 'full'
}

interface ItemOptions {
  level: number
  luck: boolean
  skill: boolean
  life: number
  exeOP: number
  setOP: number
  hhOP: number
  op380: boolean
  sockets: number[]
  character: string
  currency: Currency
}

function defaultOptions(): ItemOptions {
  return {
    level: 0, luck: false, skill: false, life: 0,
    exeOP: 0, setOP: 0, hhOP: 0, op380: false,
    sockets: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
    character: '', currency: 'WCoinP',
  }
}

export function SemiShopClient({ items, characters, selectedGrupo, categories, variant }: Props) {
  const action = variant === 'full' ? buyFullItem : buySemiItem
  const [state, formAction, pending] = useActionState(action, initial)
  const [modalItem, setModalItem] = useState<ShopItem | null>(null)
  const [opts, setOpts] = useState<ItemOptions>(defaultOptions())

  const activeCategories = categories.filter(c => items.some(i => i.iGrupo === c.grupo))
  const basePath = `/usercp/webshop/${variant}`

  const totalPrice = useMemo(() => {
    if (!modalItem) return 0
    return calculateSemiPrice({
      basePrice: modalItem.Precio,
      level: opts.level, life: opts.life,
      luck: opts.luck, skill: opts.skill,
      exeOPCount: EXE_OPTIONS.filter(e => (opts.exeOP & e.bit) !== 0).length,
      ancient: opts.setOP > 0,
      op380: opts.op380,
      harmony: opts.hhOP,
      socketCount: opts.sockets.filter(s => s !== 0xFF).length,
    })
  }, [modalItem, opts])

  function openModal(item: ShopItem) {
    setModalItem(item)
    setOpts(defaultOptions())
  }

  function toggleExe(bit: number) {
    setOpts(o => ({ ...o, exeOP: o.exeOP ^ bit }))
  }

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href={basePath} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedGrupo === undefined ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white' : 'bg-[var(--color-game-surface)] border-[var(--color-game-border)] text-[var(--color-game-muted)] hover:border-[var(--color-game-primary)]'}`}>
          Todos
        </Link>
        {activeCategories.map(({ grupo, label }) => (
          <Link key={grupo} href={`${basePath}?grupo=${grupo}`} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedGrupo === grupo ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white' : 'bg-[var(--color-game-surface)] border-[var(--color-game-border)] text-[var(--color-game-muted)] hover:border-[var(--color-game-primary)]'}`}>
            {label}
          </Link>
        ))}
      </div>

      {state.message && <ActionFeedback result={state} />}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-game-muted)] bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl">
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhum item disponível.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div key={`${item.Id ?? ''}-${item.iGrupo}-${item.iIndex}-${i}`} className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-4 hover:border-[var(--color-game-primary)] transition-colors group">
              <div className="w-full aspect-square bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg flex items-center justify-center mb-3">
                <ItemImage iGrupo={item.iGrupo} iIndex={item.iIndex} size={80} alt={item.Name} />
              </div>
              <p className="text-sm font-medium text-[var(--color-game-text)] mb-1 truncate">{item.Name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-[var(--color-game-accent)]">
                  {item.Precio.toLocaleString()}
                </span>
                <Button variant="primary" size="sm" onClick={() => openModal(item)}>
                  <Settings size={12} />
                  Configurar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto" onClick={() => setModalItem(null)}>
          <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border-bright)] rounded-xl p-6 w-full max-w-lg shadow-2xl my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-16 h-16 bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)] rounded-lg flex items-center justify-center shrink-0">
                  <ItemImage iGrupo={modalItem.iGrupo} iIndex={modalItem.iIndex} size={56} alt={modalItem.Name} />
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--color-game-text)] truncate">{modalItem.Name}</h3>
              </div>
              <button onClick={() => setModalItem(null)} className="text-[var(--color-game-muted)] hover:text-[var(--color-game-text)] shrink-0">
                <X size={20} />
              </button>
            </div>

            {state.message && <ActionFeedback result={state} />}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="itemId" value={modalItem.Id} />
              <input type="hidden" name="exeOP"  value={opts.exeOP} />
              <input type="hidden" name="setOP"  value={opts.setOP} />
              <input type="hidden" name="hhOP"   value={opts.hhOP} />
              {opts.sockets.map((s, i) => (
                <input key={i} type="hidden" name={`socket${i + 1}`} value={s} />
              ))}

              <div className="grid grid-cols-2 gap-3">
                {/* Moeda */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1.5">Moeda</label>
                  <div className="flex gap-2">
                    {(['WCoinP', 'WCoinC'] as Currency[]).map(c => (
                      <button key={c} type="button" onClick={() => setOpts(o => ({ ...o, currency: c }))}
                        className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${opts.currency === c ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white' : 'bg-[var(--color-game-bg)] border-[var(--color-game-border)] text-[var(--color-game-muted)]'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="currency" value={opts.currency} />
                </div>

                {/* Nível */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1.5">Nível (máx {modalItem.MaxLevel})</label>
                  <input type="number" name="level" min={0} max={Math.min(13, modalItem.MaxLevel)} value={opts.level}
                    onChange={e => setOpts(o => ({ ...o, level: parseInt(e.target.value) || 0 }))}
                    className="flex h-9 w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-bg)] px-3 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none" />
                </div>
              </div>

              {/* Luck / Skill */}
              <div className="flex gap-4">
                {[
                  { key: 'luck',  label: 'Luck' },
                  { key: 'skill', label: 'Skill' },
                  { key: 'op380', label: 'Op380' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={key} value="1"
                      checked={opts[key as keyof ItemOptions] as boolean}
                      onChange={e => setOpts(o => ({ ...o, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-[var(--color-game-primary)]" />
                    <span className="text-sm text-[var(--color-game-text)]">{label}</span>
                  </label>
                ))}
              </div>

              {/* Life option */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1.5">Life Option</label>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 4, 8, 12, 16, 20, 24, 28].map(v => (
                    <button key={v} type="button" onClick={() => setOpts(o => ({ ...o, life: v }))}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${opts.life === v ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white' : 'bg-[var(--color-game-bg)] border-[var(--color-game-border)] text-[var(--color-game-muted)]'}`}>
                      {v === 0 ? 'Nenhum' : `+${v}`}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="life" value={opts.life} />
              </div>

              {/* Excellent options */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1.5">
                  Excellent (máx {modalItem.MaxOpExe})
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {EXE_OPTIONS.map(({ bit, label }) => {
                    const checked = (opts.exeOP & bit) !== 0
                    const count   = EXE_OPTIONS.filter(e => (opts.exeOP & e.bit) !== 0).length
                    const disabled = !checked && count >= modalItem.MaxOpExe
                    return (
                      <label key={bit} className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <input type="checkbox" checked={checked} disabled={disabled}
                          onChange={() => !disabled && toggleExe(bit)}
                          className="w-3.5 h-3.5 accent-[var(--color-game-primary)]" />
                        <span className="text-xs text-[var(--color-game-text)]">{label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Harmony */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1.5">Harmony</label>
                <div className="flex flex-wrap gap-1.5">
                  {HARMONY_OPTIONS.map(v => (
                    <button key={v} type="button" onClick={() => setOpts(o => ({ ...o, hhOP: v }))}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${opts.hhOP === v ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white' : 'bg-[var(--color-game-bg)] border-[var(--color-game-border)] text-[var(--color-game-muted)]'}`}>
                      {v === 0 ? 'Nenhum' : `+${v}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sockets */}
              {modalItem.MaxSockets > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1.5">
                    Sockets (máx {modalItem.MaxSockets})
                  </label>
                  <div className="flex gap-2">
                    {Array.from({ length: modalItem.MaxSockets }, (_, i) => (
                      <select key={i} value={opts.sockets[i]} onChange={e => {
                        const s = [...opts.sockets]
                        s[i] = parseInt(e.target.value)
                        setOpts(o => ({ ...o, sockets: s }))
                      }} className="flex-1 h-8 rounded border border-[var(--color-game-border)] bg-[var(--color-game-bg)] px-1 text-xs text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none">
                        <option value={0xFF}>—</option>
                        {SOCKET_OPTIONS.slice(1).map(v => (
                          <option key={v} value={v}>S{v + 1}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              )}

              {/* Personagem */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1.5">Personagem (offline)</label>
                <select name="character" required
                  className="flex h-10 w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none">
                  <option value="">— Selecione —</option>
                  {characters.map(c => (
                    <option key={c.Name} value={c.Name}>{c.Name} ({c.className} • Lv {c.cLevel})</option>
                  ))}
                </select>
              </div>

              {/* Preço total */}
              <div className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg px-4 py-3 flex justify-between text-sm">
                <span className="text-[var(--color-game-muted)]">Preço total</span>
                <span className="font-bold text-[var(--color-game-accent)]">
                  {totalPrice.toLocaleString()} {opts.currency}
                </span>
              </div>

              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
                {pending ? 'Comprando...' : (
                  <><ShoppingCart size={16} /> Comprar — {totalPrice.toLocaleString()} {opts.currency}</>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

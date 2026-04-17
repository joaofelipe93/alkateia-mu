'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, X, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { ItemImage } from '@/components/shop/ItemImage'
import { buyBasicItem } from '@/lib/actions/webshop'
import type { ShopItem } from '@/lib/db/webshop'
import type { CharacterData } from '@/lib/db/character'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

type Currency = 'WCoinP' | 'WCoinC'

interface Props {
  items: ShopItem[]
  characters: CharacterData[]
  selectedGrupo: number | undefined
  categories: readonly { grupo: number; label: string; icon: string }[]
}

export function BasicShopClient({ items, characters, selectedGrupo, categories }: Props) {
  const [state, action, pending] = useActionState(buyBasicItem, initial)
  const [modalItem, setModalItem] = useState<ShopItem | null>(null)
  const [currency, setCurrency] = useState<Currency>('WCoinP')

  const activeCategories = categories.filter(c =>
    items.some(i => i.iGrupo === c.grupo)
  )

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/usercp/webshop/basic"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            selectedGrupo === undefined
              ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white'
              : 'bg-[var(--color-game-surface)] border-[var(--color-game-border)] text-[var(--color-game-muted)] hover:border-[var(--color-game-primary)]'
          }`}
        >
          Todos
        </Link>
        {activeCategories.map(({ grupo, label, icon }) => (
          <Link
            key={grupo}
            href={`/usercp/webshop/basic?grupo=${grupo}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedGrupo === grupo
                ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white'
                : 'bg-[var(--color-game-surface)] border-[var(--color-game-border)] text-[var(--color-game-muted)] hover:border-[var(--color-game-primary)]'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Global feedback */}
      {state.message && <ActionFeedback result={state} />}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-game-muted)] bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl">
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhum item disponível nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div
              key={`${item.Id ?? ''}-${item.iGrupo}-${item.iIndex}-${i}`}
              className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-4 hover:border-[var(--color-game-primary)] transition-colors group cursor-pointer"
              onClick={() => setModalItem(item)}
            >
              {/* Item image */}
              <div className="w-full aspect-square bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg flex items-center justify-center mb-3 group-hover:border-[var(--color-game-primary)] transition-colors">
                <ItemImage iGrupo={item.iGrupo} iIndex={item.iIndex} size={80} alt={item.Name} />
              </div>
              <p className="text-sm font-medium text-[var(--color-game-text)] mb-1 truncate">{item.Name}</p>
              <p className="text-xs text-[var(--color-game-muted)] mb-2 truncate">{item.Descripcion || '—'}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--color-game-accent)]">
                  {item.Precio.toLocaleString()}
                </span>
                <Button variant="primary" size="sm" onClick={e => { e.stopPropagation(); setModalItem(item) }}>
                  <ShoppingCart size={13} />
                  Comprar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de compra */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setModalItem(null)}
        >
          <div
            className="bg-[var(--color-game-surface)] border border-[var(--color-game-border-bright)] rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-16 h-16 bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)] rounded-lg flex items-center justify-center shrink-0">
                  <ItemImage iGrupo={modalItem.iGrupo} iIndex={modalItem.iIndex} size={56} alt={modalItem.Name} />
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--color-game-text)] truncate">
                  {modalItem.Name}
                </h3>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="text-[var(--color-game-muted)] hover:text-[var(--color-game-text)] transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {state.message && <ActionFeedback result={state} />}

            <form action={action} className="space-y-4">
              <input type="hidden" name="itemId" value={modalItem.Id} />

              {/* Moeda */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-game-text)] mb-2">Moeda</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['WCoinP', 'WCoinC'] as Currency[]).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                        currency === c
                          ? 'bg-[var(--color-game-primary)] border-[var(--color-game-primary)] text-white'
                          : 'bg-[var(--color-game-bg)] border-[var(--color-game-border)] text-[var(--color-game-muted)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="currency" value={currency} />
              </div>

              {/* Personagem */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">Personagem (offline)</label>
                <select
                  name="character"
                  required
                  className="flex h-10 w-full rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface)] px-3 py-2 text-sm text-[var(--color-game-text)] focus:border-[var(--color-game-primary)] focus:outline-none"
                >
                  <option value="">— Selecione —</option>
                  {characters.map(c => (
                    <option key={c.Name} value={c.Name}>
                      {c.Name} ({c.className} • Lv {c.cLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Resumo */}
              <div className="bg-[var(--color-game-bg)] border border-[var(--color-game-border)] rounded-lg px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-game-muted)]">Item</span>
                  <span className="text-[var(--color-game-text)]">{modalItem.Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-game-muted)]">Preço</span>
                  <span className="font-bold text-[var(--color-game-accent)]">
                    {modalItem.Precio.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full"
                disabled={pending}
              >
                {pending ? 'Comprando...' : `Comprar — ${modalItem.Precio.toLocaleString()} ${currency}`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

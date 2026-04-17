'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/cn'

const LANGUAGES = [
  { code: 'br', label: 'Português', short: 'BR', flag: '🇧🇷' },
  { code: 'en', label: 'English',   short: 'EN', flag: '🇺🇸' },
] as const

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<'br' | 'en'>('br')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = readCookie('NEXT_LOCALE')
    if (saved === 'br' || saved === 'en') setCurrent(saved)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function switchTo(code: 'br' | 'en') {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`
    setCurrent(code)
    setOpen(false)
    window.location.reload()
  }

  const active = LANGUAGES.find(l => l.code === current) ?? LANGUAGES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm text-[var(--color-game-muted)] hover:text-[var(--color-game-accent)] hover:bg-[var(--color-game-surface)] transition-colors"
        aria-label="Trocar idioma"
      >
        <Globe size={14} />
        <span className="font-medium">{active.short}</span>
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded border border-[var(--color-game-border-bright)] bg-[var(--color-game-surface-2)] shadow-xl z-50 overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors',
                current === lang.code
                  ? 'bg-[var(--color-game-surface)] text-[var(--color-game-accent)]'
                  : 'text-[var(--color-game-text)] hover:bg-[var(--color-game-surface)]'
              )}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {current === lang.code && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn, UserPlus, Download, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  username: z.string().min(4).max(10),
  password: z.string().min(4).max(20),
})
type FormData = z.infer<typeof schema>

export function HomeLoginCard() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      })
      if (result?.ok) {
        window.location.href = '/usercp'
        return
      }
      setError('Usuário ou senha inválidos.')
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border-bright)] rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <LogIn size={18} className="text-[var(--color-game-accent)]" />
        <h3 className="font-display font-semibold text-[var(--color-game-text)]">Entrar</h3>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input
            {...register('username')}
            placeholder="Usuário"
            autoComplete="username"
          />
          {errors.username && <p className="mt-1 text-[10px] text-red-400">{errors.username.message}</p>}
        </div>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            autoComplete="current-password"
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-game-muted)] hover:text-[var(--color-game-text)]"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <span className="h-px flex-1 bg-[var(--color-game-border)]" />
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-game-muted)]">ou</span>
        <span className="h-px flex-1 bg-[var(--color-game-border)]" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="accent" size="md" asChild>
          <Link href="/register">
            <UserPlus size={14} />
            Criar Conta
          </Link>
        </Button>
        <Button variant="outline" size="md" asChild>
          <Link href="/downloads">
            <Download size={14} />
            Download
          </Link>
        </Button>
      </div>
    </div>
  )
}

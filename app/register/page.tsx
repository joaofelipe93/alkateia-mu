'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Swords, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerAction, type RegisterState } from '@/lib/actions/register'
import { useState } from 'react'

const initialState: RegisterState = { success: false }

export default function RegisterPage() {
  const t = useTranslations('register')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [state, action, pending] = useActionState(registerAction, initialState)

  if (state.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-success)]/40 rounded-xl p-8 shadow-2xl text-center">
            <CheckCircle size={48} className="text-[var(--color-game-success)] mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[var(--color-game-text)] mb-2">
              Conta criada!
            </h2>
            <p className="text-[var(--color-game-muted)] mb-6">
              Sua conta foi criada com sucesso. Você já pode entrar no servidor.
            </p>
            <Button variant="accent" size="lg" className="w-full" asChild>
              <Link href="/login">Fazer login</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)]">
                <Swords size={28} className="text-[var(--color-game-accent)]" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
              {t('title')}
            </h1>
            <p className="text-sm text-[var(--color-game-muted)] mt-1">{t('subtitle')}</p>
          </div>

          {/* Global error */}
          {state.error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={action} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">
                {t('username')}
                <span className="text-[var(--color-game-muted)] font-normal ml-2 text-xs">(4–10 caracteres)</span>
              </label>
              <Input name="username" placeholder="seuusuario" autoComplete="username" />
              {state.fieldErrors?.username && (
                <p className="mt-1 text-xs text-[var(--color-game-error)]">
                  {state.fieldErrors.username[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">
                {t('email')}
              </label>
              <Input name="email" type="email" placeholder="seu@email.com" autoComplete="email" />
              {state.fieldErrors?.email && (
                <p className="mt-1 text-xs text-[var(--color-game-error)]">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">
                {t('password')}
                <span className="text-[var(--color-game-muted)] font-normal ml-2 text-xs">(4–20 caracteres)</span>
              </label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-game-muted)] hover:text-[var(--color-game-text)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {state.fieldErrors?.password && (
                <p className="mt-1 text-xs text-[var(--color-game-error)]">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">
                {t('confirm_password')}
              </label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-game-muted)] hover:text-[var(--color-game-text)]"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {state.fieldErrors?.confirmPassword && (
                <p className="mt-1 text-xs text-[var(--color-game-error)]">
                  {state.fieldErrors.confirmPassword[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full mt-2"
              disabled={pending}
            >
              {pending ? 'Criando conta...' : t('register_btn')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-game-muted)]">
            {t('have_account')}{' '}
            <Link href="/login" className="text-[var(--color-game-accent)] hover:underline font-medium">
              {t('login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

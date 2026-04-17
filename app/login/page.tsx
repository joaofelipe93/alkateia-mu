'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Swords, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  username: z.string().min(4, 'Mínimo 4 caracteres').max(10, 'Máximo 10 caracteres'),
  password: z.string().min(4, 'Mínimo 4 caracteres').max(20, 'Máximo 20 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/usercp'

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginForm) {
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
        return
      }

      // NextAuth v5 retorna códigos genéricos — mapear para mensagens amigáveis
      const code = result?.error ?? 'unknown'
      if (code === 'CredentialsSignin') {
        setError('Usuário ou senha inválidos.')
      } else if (code.includes('bloqueado') || code.includes('blocked')) {
        setError('IP bloqueado. Tente novamente em alguns minutos.')
      } else if (code.includes('bloqueada') || code.includes('blocked_account')) {
        setError('Conta bloqueada. Entre em contato com o suporte.')
      } else {
        setError('Erro ao fazer login. Verifique seus dados e tente novamente.')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-[var(--color-game-bg)] border border-[var(--color-game-border-bright)]">
                <Swords size={28} className="text-[var(--color-game-accent)]" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">
              {t('login_title')}
            </h1>
            <p className="text-sm text-[var(--color-game-muted)] mt-1">
              {t('login_subtitle')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">
                {t('username')}
              </label>
              <Input
                {...register('username')}
                placeholder={t('username_placeholder')}
                autoComplete="username"
                autoFocus
              />
              {errors.username && (
                <p className="mt-1 text-xs text-[var(--color-game-error)]">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-game-text)] mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password_placeholder')}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-game-muted)] hover:text-[var(--color-game-text)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[var(--color-game-error)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('logging_in') : t('login_btn')}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-[var(--color-game-muted)]">
            {t('no_account')}{' '}
            <Link
              href="/register"
              className="text-[var(--color-game-accent)] hover:underline font-medium"
            >
              {t('create_account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

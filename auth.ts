import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { userExists, validateUser, getUserByUsername, isAccountBlocked } from '@/lib/db/account'
import { canLogin, addFailedLogin, removeFailedLogins } from '@/lib/auth/rate-limit'
import { getAdminLevel } from '@/types/auth'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(4).max(10).regex(/^[a-zA-Z0-9]+$/),
  password: z.string().min(4).max(20),
  ip: z.string().optional(),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          throw new Error('Preencha todos os campos corretamente.')
        }

        const { username, password, ip = '127.0.0.1' } = parsed.data

        const allowed = await canLogin(ip)
        if (!allowed) {
          throw new Error('IP bloqueado. Tente novamente em alguns minutos.')
        }

        if (!(await userExists(username))) {
          await addFailedLogin(username, ip)
          throw new Error('Usuário ou senha inválidos.')
        }

        if (await isAccountBlocked(username)) {
          throw new Error('Conta bloqueada. Entre em contato com o suporte.')
        }

        const valid = await validateUser(username, password)
        if (!valid) {
          await addFailedLogin(username, ip)
          throw new Error('Usuário ou senha inválidos.')
        }

        await removeFailedLogins(ip)

        const user = await getUserByUsername(username)
        if (!user) throw new Error('Erro ao carregar conta.')

        return {
          id: String(user.memb_guid),
          username: user.memb___id,
          email: user.mail_addr,
          adminLevel: getAdminLevel(user.memb___id),
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 1800 },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.adminLevel = user.adminLevel
      }
      return token
    },
    async session({ session, token }) {
      const t = token as { id: string; username: string; adminLevel: number } & typeof token
      session.user.id = t.id
      session.user.username = t.username
      session.user.adminLevel = t.adminLevel
      return session
    },
  },
})

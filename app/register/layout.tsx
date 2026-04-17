import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta no AlkateiaMU e comece a jogar agora.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}

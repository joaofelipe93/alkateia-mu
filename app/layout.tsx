import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AlkateiaMU — Season 8',
    template: '%s — AlkateiaMU',
  },
  description: 'Servidor privado de MU Online Season 8. EXP 200x ~ 350x. Junte-se agora!',
  keywords: ['MU Online', 'Season 8', 'servidor privado', 'AlkateiaMU', 'MMORPG', 'Brasil'],
  authors: [{ name: 'AlkateiaMU' }],
  openGraph: {
    type: 'website',
    siteName: 'AlkateiaMU',
    title: 'AlkateiaMU — Season 8',
    description: 'Servidor privado de MU Online Season 8. EXP 200x ~ 350x.',
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: '#080c14',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark">
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

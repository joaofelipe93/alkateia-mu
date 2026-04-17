import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/usercp', '/admincp']
const adminPaths = ['/admincp']

export default auth(async function proxy(req: NextRequest & { auth?: { user?: { adminLevel?: number } } | null }) {
  const { pathname } = req.nextUrl
  const session = (req as unknown as { auth: { user?: { adminLevel?: number } } | null }).auth

  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAdmin = adminPaths.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdmin && (!session?.user?.adminLevel || session.user.adminLevel < 1)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/usercp/:path*', '/admincp/:path*'],
}

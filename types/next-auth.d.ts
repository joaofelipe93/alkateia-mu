import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      email?: string | null
      adminLevel: number
    }
  }

  interface User {
    id: string
    username: string
    email?: string | null
    adminLevel: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    adminLevel: number
  }
}

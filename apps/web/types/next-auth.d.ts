import type { UserRole } from '@web/lib/db/schema'

declare module 'next-auth' {
  interface User {
    role: UserRole
  }
  interface Session {
    user: {
      id: string
      name: string
      role: UserRole
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole
  }
}

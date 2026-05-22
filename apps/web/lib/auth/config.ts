import bcrypt from 'bcryptjs'
import NextAuth, { type NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { getUserByEmail } from '@web/lib/db/queries/users'
import type { UserRole } from '@web/lib/db/schema'

export async function authorizeCredentials(
  credentials: Partial<Record<string, unknown>>,
): Promise<{ id: string; name: string; role: UserRole } | null> {
  const email = credentials?.email as string | undefined
  const password = credentials?.password as string | undefined

  if (!email || !password) {
    return null
  }

  // Try DB users first
  const dbUser = await getUserByEmail(email)
  if (dbUser) {
    const passwordValid = await bcrypt.compare(password, dbUser.passwordHash)
    if (!passwordValid) return null
    return {
      id: dbUser.id,
      name: dbUser.name,
      role: dbUser.role,
    }
  }

  // Fall back to env-var credentials (backwards compat during migration)
  if (!process.env.ADMIN_PASSWORD_HASH) {
    return null
  }

  const hash = Buffer.from(process.env.ADMIN_PASSWORD_HASH, 'base64').toString(
    'utf8',
  )

  // Always run bcrypt regardless of email match to prevent timing-based enumeration
  const passwordValid = await bcrypt.compare(password, hash)

  if (email !== process.env.ADMIN_USERNAME || !passwordValid) {
    return null
  }

  return { id: 'admin', name: email, role: 'admin' }
}

export function resolveAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeCredentials,
    }),
  ],
  secret: resolveAuthSecret(),
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    session({ session, token }) {
      if (token.role) {
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

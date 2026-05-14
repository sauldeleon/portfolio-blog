import bcrypt from 'bcryptjs'
import NextAuth, { type NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export async function authorizeCredentials(
  credentials: Partial<Record<string, unknown>>,
): Promise<{ id: string; name: string } | null> {
  const username = credentials?.username as string | undefined
  const password = credentials?.password as string | undefined

  if (!username || !password || !process.env.ADMIN_PASSWORD_HASH) {
    return null
  }

  const hash = Buffer.from(process.env.ADMIN_PASSWORD_HASH, 'base64').toString(
    'utf8',
  )

  // Always run bcrypt regardless of username match to prevent timing-based enumeration
  const passwordValid = await bcrypt.compare(password, hash)

  if (username !== process.env.ADMIN_USERNAME || !passwordValid) {
    return null
  }

  return { id: 'admin', name: username }
}

export function resolveAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeCredentials,
    }),
  ],
  secret: resolveAuthSecret(),
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

import bcrypt from 'bcryptjs'
import NextAuth, { type NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export async function authorizeCredentials(
  credentials: Partial<Record<string, unknown>>,
): Promise<{ id: string; name: string } | null> {
  const username = credentials?.username as string | undefined
  const password = credentials?.password as string | undefined

  if (
    !username ||
    !password ||
    username !== process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD_HASH
  ) {
    return null
  }

  const hash = Buffer.from(process.env.ADMIN_PASSWORD_HASH, 'base64').toString(
    'utf8',
  )
  const valid = await bcrypt.compare(password, hash)
  return valid ? { id: 'admin', name: username } : null
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
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

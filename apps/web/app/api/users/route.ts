import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@web/lib/auth/config'
import {
  createUser,
  getUserByEmail,
  listUsers,
} from '@web/lib/db/queries/users'
import type { UserRole } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await listUsers()
  return NextResponse.json({ data: users })
}

const createUserSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8),
  role: z.enum(['admin', 'editor', 'user']).default('editor'),
  name: z.string().min(1).max(128),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    logger.error(err, 'POST /api/users: invalid JSON')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { email, password, role, name } = parsed.data

  const existing = await getUserByEmail(email)
  if (existing) {
    return NextResponse.json(
      { error: `Email '${email}' is already taken` },
      { status: 409 },
    )
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await createUser({
      email,
      passwordHash,
      role: role as UserRole,
      name,
    })
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    logger.error(err, 'POST /api/users: failed to create user')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

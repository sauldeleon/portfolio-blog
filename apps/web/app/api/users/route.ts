import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { parseAdminRequest, requireAdminAuth } from '@web/lib/api/parseRequest'
import {
  createUser,
  getUserByEmail,
  listUsers,
} from '@web/lib/db/queries/users'
import type { UserRole } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'

export async function GET() {
  const authResult = await requireAdminAuth()
  if (!authResult.ok) return authResult.response

  const users = await listUsers()
  logger.debug({ count: users.length }, 'GET /api/users')
  return NextResponse.json({ data: users })
}

const createUserSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8),
  role: z.enum(['admin', 'editor', 'user']).default('editor'),
  name: z.string().min(1).max(128),
})

export async function POST(request: Request) {
  const result = await parseAdminRequest(request, createUserSchema)
  if (!result.ok) return result.response

  const { email, password, role, name } = result.data
  logger.debug({ email, role }, 'POST /api/users')

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
    logger.info({ id: user.id, email, role }, 'POST /api/users: created')
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    logger.error(err, 'POST /api/users: failed to create user')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

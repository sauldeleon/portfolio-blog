import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { parseAdminRequest, requireAdminAuth } from '@web/lib/api/parseRequest'
import {
  countAdmins,
  deleteUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from '@web/lib/db/queries/users'
import type { UserRole } from '@web/lib/db/schema'
import { logger } from '@web/lib/logger'

const patchUserSchema = z.object({
  email: z.string().email().max(254).optional(),
  name: z.string().min(1).max(128).optional(),
  role: z.enum(['admin', 'editor', 'user']).optional(),
  password: z.string().min(8).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await parseAdminRequest(request, patchUserSchema)
  if (!result.ok) return result.response

  const { id } = await params
  const { email, role, name, password } = result.data
  logger.debug({ id, email, role }, 'PATCH /api/users/[id]')

  if (email !== undefined) {
    const existing = await getUserByEmail(email)
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: `Email '${email}' is already taken` },
        { status: 409 },
      )
    }
  }

  if (role && role !== 'admin') {
    const target = await getUserById(id)
    if (target?.role === 'admin') {
      const adminCount = await countAdmins()
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin user.' },
          { status: 422 },
        )
      }
    }
  }

  const updateData: Parameters<typeof updateUser>[1] = {}
  if (email !== undefined) updateData.email = email
  if (role !== undefined) updateData.role = role as UserRole
  if (name !== undefined) updateData.name = name
  if (password !== undefined)
    updateData.passwordHash = await bcrypt.hash(password, 10)

  let updated
  try {
    updated = await updateUser(id, updateData)
  } catch (err) {
    logger.error(err, 'PATCH /api/users/[id]: failed to update user')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  logger.info({ id }, 'PATCH /api/users/[id]: updated')
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminAuth()
  if (!authResult.ok) return authResult.response

  const { id } = await params
  logger.debug({ id }, 'DELETE /api/users/[id]')

  const target = await getUserById(id)
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (target.role === 'admin') {
    const adminCount = await countAdmins()
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin user.' },
        { status: 422 },
      )
    }
  }

  try {
    await deleteUser(id)
  } catch (err) {
    logger.error(err, 'DELETE /api/users/[id]: failed to delete user')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }

  logger.info({ id }, 'DELETE /api/users/[id]: deleted')
  return new NextResponse(null, { status: 204 })
}

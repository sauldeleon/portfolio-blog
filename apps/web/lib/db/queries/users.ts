import { asc, eq } from 'drizzle-orm'
import { ulid } from 'ulid'

import { db } from '../index'
import { type UserRole, users } from '../schema'

export type UserRecord = {
  id: string
  email: string
  role: UserRole
  name: string
  createdAt: Date
  updatedAt: Date
}

export type UserWithHash = UserRecord & { passwordHash: string }

export async function getUserByEmail(
  email: string,
): Promise<UserWithHash | null> {
  const rows = await db.select().from(users).where(eq(users.email, email))
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role as UserRole,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const rows = await db.select().from(users).where(eq(users.id, id))
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function listUsers(): Promise<UserRecord[]> {
  const rows = await db.select().from(users).orderBy(asc(users.createdAt))
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}

export async function createUser(data: {
  email: string
  passwordHash: string
  role: UserRole
  name: string
}): Promise<UserRecord> {
  const id = ulid()
  const [row] = await db
    .insert(users)
    .values({
      id,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      name: data.name,
    })
    .returning()
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function updateUser(
  id: string,
  data: Partial<{
    email: string
    passwordHash: string
    role: UserRole
    name: string
  }>,
): Promise<UserRecord | null> {
  const rows = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}

export async function countAdmins(): Promise<number> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'admin'))
  return rows.length
}

import { NextResponse } from 'next/server'
import { type ZodSchema } from 'zod'

import { auth } from '@web/lib/auth/config'

type Session = NonNullable<Awaited<ReturnType<typeof auth>>>

type AuthOk = { ok: true; session: Session }
type Err = { ok: false; response: NextResponse }
type ParseOk<T> = { ok: true; data: T; session: Session }

export async function requireAuth(): Promise<AuthOk | Err> {
  const session = await auth()
  if (!session)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  return { ok: true, session }
}

export async function requireAdminAuth(): Promise<AuthOk | Err> {
  const session = await auth()
  if (!session || session.user.role !== 'admin')
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  return { ok: true, session }
}

export async function parseAuthRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<ParseOk<T> | Err> {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult
  return parseBody(request, schema, authResult.session)
}

export async function parseAdminRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<ParseOk<T> | Err> {
  const authResult = await requireAdminAuth()
  if (!authResult.ok) return authResult
  return parseBody(request, schema, authResult.session)
}

async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
  session: Session,
): Promise<ParseOk<T> | Err> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
    }
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return {
      ok: false,
      response: NextResponse.json(
        { error: parsed.error.issues },
        { status: 400 },
      ),
    }

  return { ok: true, data: parsed.data, session }
}

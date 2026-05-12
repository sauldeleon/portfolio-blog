import { NextResponse } from 'next/server'

import { auth } from '@web/lib/auth/config'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true })
}

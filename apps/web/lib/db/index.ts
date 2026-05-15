/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

import * as schema from './schema'

// Lazy init — avoids creating Pool at module evaluation time (build fails without DATABASE_URL)
let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!_db) {
    _db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL! }), {
      schema,
    })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getDb() as any)[prop]
  },
})

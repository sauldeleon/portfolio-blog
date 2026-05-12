import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: './apps/web/.env.local' })

export default defineConfig({
  schema: './apps/web/lib/db/schema.ts',
  out: './apps/web/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use unpooled URL for migrations — pgBouncer doesn't support DDL
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
})

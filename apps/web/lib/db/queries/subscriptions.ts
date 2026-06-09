import { eq } from 'drizzle-orm'
import { ulid } from 'ulid'

import { db } from '../index'
import { type Locale, type SubscriptionStatus, subscriptions } from '../schema'

export type SubscriptionRecord = {
  id: string
  email: string
  name: string
  status: SubscriptionStatus
  token: string
  locale: Locale
  createdAt: Date
  confirmedAt: Date | null
}

function mapRow(row: typeof subscriptions.$inferSelect): SubscriptionRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status as SubscriptionStatus,
    token: row.token,
    locale: row.locale as Locale,
    createdAt: row.createdAt,
    confirmedAt: row.confirmedAt ?? null,
  }
}

export async function getSubscriptionByEmail(
  email: string,
): Promise<SubscriptionRecord | null> {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.email, email))
  const row = rows[0]
  return row ? mapRow(row) : null
}

export async function getSubscriptionByToken(
  token: string,
): Promise<SubscriptionRecord | null> {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.token, token))
  const row = rows[0]
  return row ? mapRow(row) : null
}

export async function createSubscription(data: {
  email: string
  name: string
  locale: Locale
}): Promise<SubscriptionRecord> {
  const id = ulid()
  const token = crypto.randomUUID()
  const [row] = await db
    .insert(subscriptions)
    .values({
      id,
      email: data.email,
      name: data.name,
      locale: data.locale,
      token,
      status: 'pending',
    })
    .returning()
  return mapRow(row)
}

export async function confirmSubscription(
  token: string,
): Promise<SubscriptionRecord | null> {
  const rows = await db
    .update(subscriptions)
    .set({ status: 'active', confirmedAt: new Date() })
    .where(eq(subscriptions.token, token))
    .returning()
  const row = rows[0]
  return row ? mapRow(row) : null
}

export async function getActiveSubscribers(): Promise<SubscriptionRecord[]> {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'))
  return rows.map(mapRow)
}

export async function unsubscribeByToken(
  token: string,
): Promise<SubscriptionRecord | null> {
  const rows = await db
    .update(subscriptions)
    .set({ status: 'unsubscribed' })
    .where(eq(subscriptions.token, token))
    .returning()
  const row = rows[0]
  return row ? mapRow(row) : null
}

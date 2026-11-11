import { createHmac, timingSafeEqual } from 'node:crypto'

/** How long the "manage subscription" link in an email stays usable. */
export const MANAGE_LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000

export interface ManageLinkParams {
  token: string
  /** Expiry as a Unix timestamp in seconds. */
  expires: string
  signature: string
}

export type ManageLinkStatus = 'valid' | 'expired' | 'invalid'

function getSecret(): string | null {
  return process.env.SUBSCRIPTION_LINK_SECRET || null
}

function sign(secret: string, token: string, expires: string): string {
  return createHmac('sha256', secret)
    .update(`${token}.${expires}`)
    .digest('base64url')
}

/**
 * Signs a manage link for one email. The unsubscribe link stays permanent;
 * only this one expires, so old emails can no longer change anything.
 * Returns null when no secret is configured.
 */
export function createManageLinkParams(
  token: string,
  now: number = Date.now(),
): ManageLinkParams | null {
  const secret = getSecret()
  if (!secret) return null
  const expires = String(Math.floor((now + MANAGE_LINK_TTL_MS) / 1000))
  return { token, expires, signature: sign(secret, token, expires) }
}

export function buildManageUrl(
  siteUrl: string,
  locale: string,
  params: ManageLinkParams,
): string {
  const qs = new URLSearchParams({
    token: params.token,
    expires: params.expires,
    signature: params.signature,
  })
  return `${siteUrl}/${locale}/subscribe/manage?${qs.toString()}`
}

export function verifyManageLink(
  params: Partial<ManageLinkParams>,
  now: number = Date.now(),
): ManageLinkStatus {
  const secret = getSecret()
  const { token, expires, signature } = params
  if (!secret || !token || !expires || !signature) return 'invalid'
  if (!/^\d+$/.test(expires)) return 'invalid'

  const expected = Buffer.from(sign(secret, token, expires))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return 'invalid'
  }
  return Number(expires) * 1000 < now ? 'expired' : 'valid'
}

import axios from 'axios'

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (process.env.NODE_ENV !== 'production') return true

  try {
    const res = await axios.post<{ success: boolean }>(
      TURNSTILE_VERIFY_URL,
      new URLSearchParams({ secret, response: token }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
    return res.data.success === true
  } catch {
    return false
  }
}

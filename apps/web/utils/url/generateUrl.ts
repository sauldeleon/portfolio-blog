export function getSiteUrl(): string {
  if (process.env.BASE_URL) return process.env.BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return ''
}

export function publicUrl(path: string) {
  return `${getSiteUrl()}${path}`
}

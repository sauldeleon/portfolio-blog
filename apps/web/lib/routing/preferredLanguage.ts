import { fallbackLng, languages } from '@web/i18n/languages'

/**
 * Language to send a visitor of `/` to: the one they picked (cookie), else the
 * best supported match of their Accept-Language header, else the fallback.
 */
export function preferredLanguage(
  cookieLanguage: string | undefined,
  acceptLanguage: string | null,
): string {
  if (cookieLanguage && languages.includes(cookieLanguage)) {
    return cookieLanguage
  }

  const ranked = (acceptLanguage ?? '')
    .split(',')
    .map((entry) => {
      const [tag, ...params] = entry.trim().split(';')
      const q = params.find((p) => p.trim().startsWith('q='))
      return {
        lng: tag.split('-')[0].toLowerCase(),
        q: q ? Number(q.trim().slice(2)) : 1,
      }
    })
    .filter(({ lng, q }) => lng && q > 0)
    .sort((a, b) => b.q - a.q)

  return ranked.find(({ lng }) => languages.includes(lng))?.lng ?? fallbackLng
}

import { LANGUAGE_COOKIE } from '@web/i18n/languages'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/** Persists the picked language in a cookie so the server can honour it on `/`. */
export function rememberLanguage(lng: string) {
  document.cookie = `${LANGUAGE_COOKIE}=${lng}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
}

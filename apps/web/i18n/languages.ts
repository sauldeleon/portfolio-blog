// Kept apart from settings.ts, which bundles the translation JSON, so that
// edge/proxy code can read the language list without pulling it in.
export const fallbackLng = 'en'
export const languages = [fallbackLng, 'es']

/**
 * Cookie that mirrors the language the visitor picked (also kept in
 * localStorage), so the server can redirect `/` to it.
 */
export const LANGUAGE_COOKIE = 'webLng'

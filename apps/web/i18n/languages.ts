// Kept apart from settings.ts, which bundles the translation JSON, so that
// edge/proxy code can read the language list without pulling it in.
export const fallbackLng = 'en'
export const languages = [fallbackLng, 'es']

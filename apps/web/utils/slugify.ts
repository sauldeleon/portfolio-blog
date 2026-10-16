export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** What slugify() produces: letters and digits joined by single hyphens. */
export const POST_SLUG_PATTERN = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u
export const MAX_POST_SLUG_LENGTH = 200

export function isPostSlug(slug: string): boolean {
  return slug.length <= MAX_POST_SLUG_LENGTH && POST_SLUG_PATTERN.test(slug)
}

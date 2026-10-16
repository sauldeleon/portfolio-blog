import { languages } from '@web/i18n/languages'
import { isPostSlug } from '@web/utils/slugify'

const POST_NUMBER = /^[0-9]{1,9}$/

/**
 * Whether a `/[lng]/blog/...` URL has a shape the blog can serve.
 *
 * Blog post pages are ISR with dynamicParams on: every distinct URL that
 * reaches them (even one that only 404s or redirects) is rendered and written
 * to the ISR cache. Bots requesting made-up URLs can then burn through the
 * Vercel ISR write quota, so the proxy answers impossible shapes with a 404
 * before they reach the cache. Paths outside `/[lng]/blog` are not judged.
 */
export function isServeableBlogPath(pathname: string): boolean {
  let decoded: string
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return false
  }

  const [lng, section, postNumber, slug, ...rest] = decoded
    .split('/')
    .filter(Boolean)
  if (section !== 'blog') return true
  if (!languages.includes(lng)) return false
  if (rest.length > 0) return false
  if (postNumber === undefined) return true
  if (!POST_NUMBER.test(postNumber)) return false
  if (slug === undefined) return true
  return isPostSlug(slug)
}

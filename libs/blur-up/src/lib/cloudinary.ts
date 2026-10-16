/** A ~32px wide, heavily compressed and blurred copy: well under 1 KB. */
export const BLUR_PLACEHOLDER_TRANSFORM = 'w_32,q_auto:low,e_blur:1000,f_auto'

/** The same placeholder, as `getCldImageUrl()` options for a public ID. */
export const BLUR_PLACEHOLDER_OPTIONS = {
  width: 32,
  quality: 'auto:low',
  effects: [{ blur: '1000' }],
}

/**
 * Insert Cloudinary delivery transforms into an upload URL so the browser gets
 * an appropriately sized, auto-format (webp/avif), auto-quality image — the same
 * optimisation `next/image` would do, but handled by Cloudinary's CDN and safe
 * to use in plain `<img>` tags. Non-Cloudinary (or already-transformed) URLs are
 * returned untouched.
 *
 * @example
 * cloudinaryTransform('https://res.cloudinary.com/x/image/upload/v1/a.jpg', 'f_auto,q_auto,w_640')
 * // → 'https://res.cloudinary.com/x/image/upload/f_auto,q_auto,w_640/v1/a.jpg'
 */
export function cloudinaryTransform(url: string, transform: string): string {
  const marker = '/image/upload/'
  const at = url.indexOf(marker)
  if (at === -1) return url
  const rest = url.slice(at + marker.length)
  // Leave URLs that already carry a transform segment (contains `_`) as-is.
  const firstSegment = rest.split('/')[0]
  if (/[a-z]_/.test(firstSegment)) return url
  return `${url.slice(0, at + marker.length)}${transform}/${rest}`
}

/**
 * The blurred placeholder of a Cloudinary upload URL, or `undefined` for images
 * hosted elsewhere (there is nothing cheap to blur for those).
 */
export function blurPlaceholderUrl(url: string): string | undefined {
  const placeholder = cloudinaryTransform(url, BLUR_PLACEHOLDER_TRANSFORM)
  return placeholder === url ? undefined : placeholder
}

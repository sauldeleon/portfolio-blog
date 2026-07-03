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

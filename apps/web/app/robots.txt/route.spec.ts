/**
 * @jest-environment node
 */
import { GET } from './route'

describe('GET /robots.txt', () => {
  it('returns robots.txt content with Content-Signal', async () => {
    const response = GET()
    const text = await response.text()

    expect(response.headers.get('Content-Type')).toBe(
      'text/plain; charset=utf-8',
    )
    expect(text).toContain('User-agent: *')
    expect(text).toContain(
      'Content-Signal: ai-train=no, search=yes, ai-input=no',
    )
    expect(text).toContain('Disallow: /admin/')
    expect(text).toContain('Allow: /')
    expect(text).toContain('Sitemap: https://test.url/sitemap.xml')
    expect(text).toContain('Host: https://test.url')
  })
})

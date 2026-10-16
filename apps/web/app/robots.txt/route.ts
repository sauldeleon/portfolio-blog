import { NextResponse } from 'next/server'

import { publicUrl } from '@web/utils/url/generateUrl'

/**
 * Commercial SEO crawlers that request huge numbers of URLs. Every distinct
 * blog URL they hit can be rendered and written to the ISR cache, which eats
 * the Vercel ISR write quota without bringing any readers.
 */
const BLOCKED_CRAWLERS = [
  'AhrefsBot',
  'SemrushBot',
  'DataForSeoBot',
  'MJ12bot',
  'DotBot',
  'BLEXBot',
  'PetalBot',
  'Bytespider',
]

export function GET(): NextResponse {
  const content = [
    ...BLOCKED_CRAWLERS.flatMap((bot) => [
      `User-agent: ${bot}`,
      'Disallow: /',
      '',
    ]),
    'User-agent: *',
    'Content-Signal: ai-train=no, search=yes, ai-input=no',
    'Disallow: /admin/',
    'Disallow: /*/subscribe/',
    'Allow: /',
    '',
    `Sitemap: ${publicUrl('/sitemap.xml')}`,
    `Host: ${publicUrl('')}`,
  ].join('\n')

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

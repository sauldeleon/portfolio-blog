import { NextResponse } from 'next/server'

import { publicUrl } from '@web/utils/url/generateUrl'

export function GET(): NextResponse {
  const content = [
    'User-agent: *',
    'Content-Signal: ai-train=no, search=yes, ai-input=no',
    'Allow: /',
    '',
    `Sitemap: ${publicUrl('/sitemap.xml')}`,
    `Host: ${publicUrl('')}`,
  ].join('\n')

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

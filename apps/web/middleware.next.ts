import acceptLanguage from 'accept-language'
import { NextRequest, NextResponse } from 'next/server'

import { fallbackLng, languages } from './i18n/settings'

acceptLanguage.languages(languages)

export const config = {
  // matcher: '/:lng*'
  matcher: [
    '/((?!api|sitemap.xml|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
}

export function middleware(req: NextRequest) {
  let lng: string | null = null
  if (!lng) {
    lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  }
  if (!lng) {
    lng = fallbackLng
  }

  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}`, req.url)
    )
  }

  return NextResponse.next()
}

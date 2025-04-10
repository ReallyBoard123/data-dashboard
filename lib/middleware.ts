import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

// List of supported locales
export const supportedLocales = ['en', 'de']
export const defaultLocale = 'en'

// Helper function to get locale from request
function getLocaleFromRequest(request: NextRequest): string {
  // Negotiator expects a plain object, but request.headers is a Headers instance
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // Use negotiator and intl-localematcher to get the best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  return matchLocale(languages, supportedLocales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname already starts with a locale
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If it doesn't have a locale, redirect to the default locale
  if (!pathnameHasLocale) {
    // Get the locale from the request or use default
    const locale = getLocaleFromRequest(request)
    
    // Clone the URL and add the locale prefix
    const newUrl = new URL(request.nextUrl)
    
    if (pathname === '/') {
      newUrl.pathname = `/${locale}`
    } else {
      newUrl.pathname = `/${locale}${pathname}`
    }
    
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Match all pathnames except for:
  // - /api routes
  // - /_next routes
  // - /public files (images, fonts, etc.)
  // - /*.extension files (favicon.ico, etc.)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
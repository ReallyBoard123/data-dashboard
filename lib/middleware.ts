
// middleware.ts
import { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// Supported locales
export const locales = ['en', 'de'];
export const defaultLocale = 'en';

// Get the preferred locale from request headers
function getLocale(request: NextRequest) {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator to get preferred locale from Accept-Language header
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  // Get pathname
  const pathname = request.nextUrl.pathname;

  // Check if pathname is missing locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If no locale in pathname, redirect to locale path
  if (pathnameIsMissingLocale) {
    // Get preferred locale
    const locale = getLocale(request);

    // Create new URL with locale
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    
    // Preserve search params
    request.nextUrl.search && (newUrl.search = request.nextUrl.search);
    
    // Redirect to URL with locale
    return Response.redirect(newUrl);
  }
}
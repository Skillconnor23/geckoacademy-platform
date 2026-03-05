import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, localeCookieName } from './lib/i18n/config';
import { signToken, verifyToken } from '@/lib/auth/session';
import { assertRateLimit } from '@/lib/security/rate-limit';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeCookie: { name: localeCookieName, sameSite: 'lax' as const }
});

const protectedRoutePrefixes = [
  '/dashboard',
  '/onboarding',
  '/classroom',
  '/teacher',
  '/admin',
  '/students',
  '/learning'
];
const legacyMarketingPaths = ['/home', '/landing', '/marketing', '/site'];

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com",
    "form-action 'self'",
  ].join('; ');
}

function setSecurityHeaders(res: NextResponse, nonce: string) {
  res.headers.set('Content-Security-Policy', buildCsp(nonce));
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
}

function hasValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (!origin) return false;
  const expected = process.env.BASE_URL ? new URL(process.env.BASE_URL).host : request.headers.get('host');
  try {
    return new URL(origin).host === expected;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const pathWithoutLocale = pathname.replace(/^\/(en|mn)/, '') || '/';
  const isProtectedRoute = protectedRoutePrefixes.some((p) => pathWithoutLocale.startsWith(p));

  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const csrfExempt = pathname.startsWith('/api/stripe/webhook');
    if (!csrfExempt && !hasValidOrigin(request)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
  }

  if (legacyMarketingPaths.includes(pathWithoutLocale) || legacyMarketingPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/academy', request.url));
  }

  if (isProtectedRoute && !sessionCookie) {
    const localeSegment = pathname.startsWith('/en') ? '/en' : pathname.startsWith('/mn') ? '/mn' : '';
    const signInPath = localeSegment ? `${localeSegment}/sign-in` : '/sign-in';
    return NextResponse.redirect(new URL(signInPath, request.url));
  }

  const rlPaths = ['/sign-in', '/sign-up', '/join/'];
  if (request.method === 'POST' && rlPaths.some((p) => pathWithoutLocale.includes(p))) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';
    const rl = await assertRateLimit({ key: `proxy:${pathWithoutLocale}:${ip}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      );
    }
  }

  const nonce = crypto.randomUUID().replace(/-/g, '');

  let res = intlMiddleware(request);

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  res.headers.set('x-nonce', nonce);
  setSecurityHeaders(res, nonce);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)'
  ]
};

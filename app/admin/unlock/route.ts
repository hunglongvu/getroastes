import { type NextRequest, NextResponse } from 'next/server';
import { validateToken, makeCookieValue } from '@/lib/admin-bypass';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!validateToken(token)) {
    // 404 — don't reveal that this endpoint exists
    return new Response('Not Found', { status: 404 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  console.log(`[ADMIN_BYPASS] unlock endpoint activated ip=${ip}`);

  const response = NextResponse.redirect(new URL('/?admin=unlocked', request.url));
  response.cookies.set('admin_bypass', makeCookieValue(token!), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}

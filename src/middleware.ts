import { NextResponse, type NextRequest } from 'next/server';

import { refreshTokenIfExpired } from './api/withAuth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // all other routes are protected under auth
  if (!token && !request.nextUrl.pathname.startsWith('/auth/sign-in')) {
    return Response.redirect(new URL(`/auth/sign-in?goto=${request.nextUrl.pathname}`, request.url));
  }

  if (request.nextUrl.pathname.startsWith('/auth/sign-in')) {
    return NextResponse.next();
  }

  // refresh token and set cookie
  const response = NextResponse.next();
  try {
    const { token: newToken } = await refreshTokenIfExpired();
    if (newToken) {
      response.cookies.set('token', newToken, {
        expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg$).*)'],
};

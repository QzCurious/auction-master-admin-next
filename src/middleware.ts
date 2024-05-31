import { NextResponse, type NextRequest } from 'next/server';

import { refreshTokenIfExpired } from './api/withAuth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // all other routes are protected under auth
  if (!token) {
    return Response.redirect(new URL(`/auth/sign-in?goto=${request.nextUrl.pathname}`, request.url));
  }

  // refresh token and set cookie
  const response = NextResponse.next();
  const { token: newToken, data } = await refreshTokenIfExpired();

  if (!newToken) {
    console.log('middleware: refresh token error', data);
    return Response.redirect(new URL(`/auth/sign-in?goto=${request.nextUrl.pathname}`, request.url));
  }

  if (token !== newToken) {
    response.cookies.set('token', newToken, {
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|auth/sign-in|_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg$).*)'],
};

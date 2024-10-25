import { NextResponse, type NextRequest } from 'next/server';
import { getJwt } from '@/domain/auth/getJwt';

import { AdminRefreshToken } from './api/AdminRefreshToken';
import { CookieConfigs } from './domain/auth/CookieConfigs';

export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE && request.nextUrl.pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // refresh token and set cookie
  const response = NextResponse.next();

  const jwt = await getJwt();
  if (!jwt) {
    console.log('middleware: token not found');
    return logout(request);
  }

  // jwt still valid
  if (jwt.exp * 1000 - 30 * 1000 > Date.now()) {
    return response;
  }

  const res = await AdminRefreshToken();

  if (res.error) {
    console.log('middleware: refresh token failed');
    return logout(request);
  }

  console.log('middleware: token refreshed');
  response.cookies.set(CookieConfigs.token.name, res.data.token, CookieConfigs.token.opts());

  return response;
}

export const config = {
  matcher: ['/((?!api|auth/sign-in|_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg$).*)'],
};

function logout(request: NextRequest) {
  const goto = request.nextUrl.pathname + request.nextUrl.search;
  const response = NextResponse.redirect(new URL(`/auth/sign-in?goto=${goto}`, request.url));
  response.cookies.delete(CookieConfigs.token.name);
  response.cookies.delete(CookieConfigs.refreshToken.name);
  return response;
}

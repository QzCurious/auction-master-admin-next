import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from '@/domain/auth/getToken';

import { CookieConfigs } from './domain/auth/CookieConfigs';

export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE && request.nextUrl.pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // refresh token and set cookie
  const response = NextResponse.next();
  const token = cookies().get(CookieConfigs.token.name)?.value;
  const { token: newToken, res } = await getToken();

  if (!newToken) {
    console.log('middleware: refresh token error', res);
    response.cookies.delete(CookieConfigs.token.name);
    response.cookies.delete(CookieConfigs.refreshToken.name);
    const goto = request.nextUrl.pathname === '/' ? '/dashboard' : request.nextUrl.pathname + request.nextUrl.search;
    return Response.redirect(new URL(`/auth/sign-in?goto=${goto}`, request.url));
  }

  if (token !== newToken) {
    console.log('middleware: new token set');
    response.cookies.set(CookieConfigs.token.name, newToken, CookieConfigs.token.opts());
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|auth/sign-in|_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg$).*)'],
};

import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from '@/api/getToken';

import { cookieConfigs } from './static';

export async function middleware(request: NextRequest) {
  // refresh token and set cookie
  const response = NextResponse.next();
  const token = cookies().get(cookieConfigs.token.name)?.value;
  const { token: newToken, res } = await getToken();

  if (!newToken) {
    console.log('middleware: refresh token error', res);
    response.cookies.delete(cookieConfigs.token.name);
    response.cookies.delete(cookieConfigs.refreshToken.name);
    const goto = request.nextUrl.pathname === '/' ? '/dashboard' : request.nextUrl.pathname;
    return Response.redirect(new URL(`/auth/sign-in?goto=${goto}`, request.url));
  }

  if (token !== newToken) {
    console.log('middleware: new token set');
    response.cookies.set(cookieConfigs.token.name, newToken, cookieConfigs.token.opts);
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|auth/sign-in|_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg$).*)'],
};

import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from '@/api/getToken';

export async function middleware(request: NextRequest) {
  // refresh token and set cookie
  const response = NextResponse.next();
  const token = cookies().get('token')?.value;
  const { token: newToken, res } = await getToken();

  if (!newToken) {
    console.log('middleware: refresh token error', res);
    const goto = request.nextUrl.pathname === '/' ? '/dashboard' : request.nextUrl.pathname;
    return Response.redirect(new URL(`/auth/sign-in?goto=${goto}`, request.url));
  }

  if (token !== newToken) {
    console.log('middleware: new token set');
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

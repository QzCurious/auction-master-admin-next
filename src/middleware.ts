import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token && !request.nextUrl.pathname.startsWith('/auth/sign-in')) {
    return Response.redirect(new URL(`/auth/sign-in?goto=${request.nextUrl.pathname}`, request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg$).*)'],
};

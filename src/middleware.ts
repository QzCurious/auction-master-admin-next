import { NextResponse, type NextRequest } from 'next/server';

import { refreshMiddleware } from './server/next/refreshMiddleware';
import { transport } from './server/transport';

export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE && request.nextUrl.pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  return refreshMiddleware(request, transport);
}

export const config = {
  matcher: [
    '/((?!api|auth/sign-in|auth/refresh|robots.txt|_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg$).*)',
  ],
};

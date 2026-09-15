import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { AdminRefreshToken } from '@/api/endpoints/AdminRefreshToken';
import { invalidSessionError } from '@/api/errors';
import { createApiSession, ensureFreshToken } from '@/api/session';
import { returnPathHeader, signInDestination } from '@/domain/auth/navigation';
import { type KyInstance } from 'ky';

import { clearTokens, readTokens, writeTokens } from './cookies';

export async function refreshMiddleware(request: NextRequest, transport: KyInstance) {
  const forwarded = new Headers(request.headers);
  // Overwrite browser-provided internal metadata.
  forwarded.set(returnPathHeader, request.nextUrl.pathname + request.nextUrl.search);
  const forwardedCookies = new RequestCookies(forwarded);
  let response = NextResponse.next({ request: { headers: forwarded } });
  const session = createApiSession({
    readTokens: () => readTokens(request.cookies),
    refreshTokens: (tokens) => AdminRefreshToken(transport, tokens),
    persistTokens: (tokens) => {
      forwardedCookies.set('admin-token', tokens.accessToken);
      forwardedCookies.set('admin-refresh-token', tokens.refreshToken);
      response = NextResponse.next({ request: { headers: forwarded } });
      writeTokens(response.cookies, tokens);
    },
  });
  try {
    await ensureFreshToken(session);
    await session.persistTokens();
    return response;
  } catch (error) {
    if (error === invalidSessionError) {
      const redirect = NextResponse.redirect(
        new URL(signInDestination(request.nextUrl.pathname + request.nextUrl.search), request.url)
      );
      clearTokens(redirect.cookies);
      return redirect;
    }
    // Do not delete a valid browser session on transient upstream failures.
    return new NextResponse('Authentication service is temporarily unavailable. Please retry.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

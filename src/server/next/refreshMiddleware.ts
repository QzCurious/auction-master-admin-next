import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { refreshTokens } from '@/api/endpoints/refreshTokens';
import { ApiFailure } from '@/api/errors';
import { createApiSession, ensureFreshToken } from '@/api/session';
import { type ApiTransport } from '@/api/transport';

import { clearTokens, readTokens, writeTokens } from './cookies';
import { returnPathHeader, signInDestination } from './navigation';

export async function refreshMiddleware(request: NextRequest, transport: ApiTransport) {
  const forwarded = new Headers(request.headers);
  // Overwrite browser-provided internal metadata.
  forwarded.set(returnPathHeader, request.nextUrl.pathname + request.nextUrl.search);
  const forwardedCookies = new RequestCookies(forwarded);
  let response = NextResponse.next({ request: { headers: forwarded } });
  const session = createApiSession({
    transport,
    readTokens: () => readTokens(request.cookies),
    refreshTokens: (tokens) => refreshTokens(transport, tokens),
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
    if (error instanceof ApiFailure && ['unauthenticated', 'expired', 'forbidden'].includes(error.kind)) {
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

import { NextResponse, type NextRequest } from 'next/server';
import { ApiFailure } from '@/api/errors';
import { refreshRejectedToken } from '@/api/session';
import { clearTokens } from '@/server/next/cookies';
import {
  afterRefreshDestination,
  refreshAttemptParam,
  safeReturnPath,
  signInDestination,
} from '@/server/next/navigation';
import { withApiSession } from '@/server/next/withApiSession';

export async function GET(request: NextRequest) {
  const response = await refresh(request);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

async function refresh(request: NextRequest) {
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get('goto'));
  if (new URL(returnPath, request.url).searchParams.has(refreshAttemptParam)) {
    return NextResponse.redirect(new URL(signInDestination(returnPath), request.url));
  }
  try {
    await withApiSession(async (_api, session) => {
      const tokens = await session.readTokens();
      await refreshRejectedToken(session, tokens.accessToken);
    });
    return NextResponse.redirect(new URL(afterRefreshDestination(returnPath), request.url));
  } catch (error) {
    if (error instanceof ApiFailure && ['unauthenticated', 'expired', 'forbidden'].includes(error.kind)) {
      const response = NextResponse.redirect(new URL(signInDestination(returnPath), request.url));
      clearTokens(response.cookies);
      return response;
    }
    return new NextResponse('Authentication service is temporarily unavailable. Please retry.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

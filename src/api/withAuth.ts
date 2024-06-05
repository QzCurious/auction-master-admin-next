import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

import { type apiClient, type ApiClientResponse } from './apiClient';
import { type JwtPayload } from './JwtPayload';
import { sessionRefresh } from './session-refresh';

// token
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiYWNjb3VudCI6ImFkbWluIiwicm9sZSI6WyJzdXBlciJdLCJwZXJtaXNzaW9ucyI6W3siaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzIn0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcm9sZXMvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcm9sZXMifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9yb2xlcy86cm9sZSJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzLzpyb2xlIn0seyJpZCI6MCwibWV0aG9kIjoiUE9TVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzL2FjY291bnQvOmFjY291bnQifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9yb2xlcy9hY2NvdW50LzphY2NvdW50In0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9wZXJtaXNzaW9ucyJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2NvbmZpZ3MifSx7ImlkIjowLCJtZXRob2QiOiJQQVRDSCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2FkbWlucy86aWQvcGFzc3dvcmQifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zIn0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zIn0seyJpZCI6MCwibWV0aG9kIjoiUEFUQ0giLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9hZG1pbnMvOmlkIn0seyJpZCI6MCwibWV0aG9kIjoiREVMRVRFIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zLzppZCJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2FkbWlucy9hY2NvdW50LzphY2NvdW50In1dLCJleHAiOjE3MTY1MjQ4MDMsImlhdCI6MTcxNjUyNDIwMywibmJmIjoxNzE2NTI0MjAzfQ.IEyMSckwr9kqstucrXkveguF-eJDNEv--dt_rRuA22w
// refresh token
// c897dfd4-b666-4cc3-9216-964a990c83ba

export function withAuth(_apiClient: typeof apiClient) {
  const middleware = async function <Data, ErrorCode extends string = never>(
    input: string,
    init?: RequestInit
  ): Promise<ApiClientResponse<Data, ErrorCode | '1001' | '1003'>> {
    const refresh = await tryRefreshToken();

    if (refresh.token === null) {
      console.log('Auth: failed to refresh token');
      return (
        refresh.res ?? {
          data: null,
          error: '1003',
          status: {
            code: '1003',
            message: 'Failed to refresh token',
            dateTime: Date.now().toString(),
            traceCode: 'mocked response',
          },
        }
      );
    }

    const res = await _apiClient<Data, ErrorCode>(input, {
      ...init,
      headers: {
        Authorization: refresh.token ? `Bearer ${refresh.token}` : '',
        ...init?.headers,
      },
    });

    // Retry 1001 Permission denied
    if (res.error === '1001') {
      const { token } = await tryRefreshToken({ force: true });
      const tryAgainRes = await _apiClient<Data, ErrorCode>(input, {
        ...init,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          ...init?.headers,
        },
      });
      return tryAgainRes;
    }

    return res;
  };
  return middleware;
}

let sessionRefreshing: ReturnType<typeof sessionRefresh> | null = null;
export async function tryRefreshToken({ force }: { force?: boolean } = { force: false }) {
  // no token
  const token = cookies().get('token');
  if (!token?.value) {
    return { token: null, res: null } as const;
  }

  const jwt = jwtDecode<JwtPayload>(token.value);

  // jwt still valid
  if (!force && jwt.exp * 1000 > Date.now() - 30 * 1000) {
    return { token: token.value, res: null } as const;
  }

  const refreshToken = cookies().get('refreshToken');
  if (!refreshToken?.value) {
    throw new Error('BUG: Token expired without refresh token');
  }

  if (!sessionRefreshing) {
    sessionRefreshing = sessionRefresh({ token: token.value, refreshToken: refreshToken.value });
  }

  const res = await sessionRefreshing;
  sessionRefreshing = null;

  // 1003 refresh token expired
  if (!res.data) {
    if (process.env.DEV) {
      console.log('Refresh token expired', res);
    }
    return { token: null, res } as const;
  }

  if (process.env.DEV) {
    console.log('Token renewed');
  }
  return { token: res.data.token, res } as const;
}

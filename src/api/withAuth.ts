import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

import { type apiClient, type ApiClientResponse } from './apiClient';
import { type JwtPayload } from './JwtPayload';
import { logout } from './logout';
import { sessionRefresh } from './session-refresh';

// token
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiYWNjb3VudCI6ImFkbWluIiwicm9sZSI6WyJzdXBlciJdLCJwZXJtaXNzaW9ucyI6W3siaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzIn0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcm9sZXMvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcm9sZXMifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9yb2xlcy86cm9sZSJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzLzpyb2xlIn0seyJpZCI6MCwibWV0aG9kIjoiUE9TVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzL2FjY291bnQvOmFjY291bnQifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9yb2xlcy9hY2NvdW50LzphY2NvdW50In0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9wZXJtaXNzaW9ucyJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2NvbmZpZ3MifSx7ImlkIjowLCJtZXRob2QiOiJQQVRDSCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2FkbWlucy86aWQvcGFzc3dvcmQifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zIn0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zIn0seyJpZCI6MCwibWV0aG9kIjoiUEFUQ0giLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9hZG1pbnMvOmlkIn0seyJpZCI6MCwibWV0aG9kIjoiREVMRVRFIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zLzppZCJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2FkbWlucy9hY2NvdW50LzphY2NvdW50In1dLCJleHAiOjE3MTY1MjQ4MDMsImlhdCI6MTcxNjUyNDIwMywibmJmIjoxNzE2NTI0MjAzfQ.IEyMSckwr9kqstucrXkveguF-eJDNEv--dt_rRuA22w
// refresh token
// c897dfd4-b666-4cc3-9216-964a990c83ba

interface OptsGeneric {
  refreshToken?: boolean;
}
export function withAuth<Opts extends OptsGeneric = OptsGeneric>(_apiClient: typeof apiClient, opts?: Opts) {
  const middleware = async function <Data, ErrorCode extends string = never>(
    input: string,
    init?: RequestInit
  ): Promise<ApiClientResponse<Data, ErrorCode | '1003'>> {
    'use server';
    let token = cookies().get('token')?.value;
    if (opts?.refreshToken ?? true) {
      const refreshTokenRes = await refreshTokenIfExpired();
      if (!refreshTokenRes.token) {
        return {
          data: null,
          status: {
            code: '1003',
            message: 'frontend mock error: ' + refreshTokenRes.data,
            dateTime: '',
            traceCode: '',
          },
        } as any;
      }
      token = refreshTokenRes.token;
    }

    if (!token) {
      return {
        data: null,
        status: {
          code: '1003',
          message: 'frontend mock error: NO_TOKEN',
          dateTime: '',
          traceCode: '',
        },
      } as any;
    }

    return _apiClient(input, {
      ...init,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        ...init?.headers,
      },
    });
  };
  return middleware;
}

let sessionRefreshing: ReturnType<typeof sessionRefresh> | null = null;
export async function refreshTokenIfExpired() {
  'use server';
  // no token
  const token = cookies().get('token');
  if (!token?.value) {
    return { token: null, data: 'NO_TOKEN' } as const;
  }

  const jwt = jwtDecode<JwtPayload>(token.value);

  // no jwt
  if (!jwt) return { token: null, data: 'NO_JWT' } as const;

  // jwt still valid
  if (jwt.exp * 1000 > Date.now() - 30 * 1000) {
    return { token: token.value, data: 'NOT_EXPIRED' } as const;
  }

  const refreshToken = cookies().get('refreshToken');
  if (!refreshToken?.value) {
    if (process.env.DEV) {
      console.log('BUG: Token expired without refresh token');
    }
    return { token: null, data: 'NO_REFRESH_TOKEN' } as const;
  }

  if (!sessionRefreshing) {
    sessionRefreshing = sessionRefresh({ token: token.value, refreshToken: refreshToken.value });
  }

  const res = await sessionRefreshing;
  sessionRefreshing = null;

  // refresh token expired
  if (!res.data) {
    await logout();
    if (process.env.DEV) {
      console.log('Refresh token expired', res);
    }
    return { token: null, data: 'REFRESH_TOKEN_EXPIRED' } as const;
  }

  if (process.env.DEV) {
    console.log('Token renewed');
  }
  return { token: res.data.token, data: 'REFRESHED' } as const;
}

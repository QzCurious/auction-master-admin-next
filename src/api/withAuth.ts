import { getToken } from '../domain/auth/getToken';
import { type apiClient, type ApiClientResponse } from './apiClient';

export function withAuth(_apiClient: typeof apiClient) {
  const middleware = async function <Data, ErrorCode extends string = never>(
    input: string,
    init?: RequestInit
  ): Promise<ApiClientResponse<Data, ErrorCode | '1001' | '1003'>> {
    const refresh = await getToken();

    if (refresh.token === null) {
      if (refresh.res) {
        return refresh.res;
      }

      console.log('Auth: No token');
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
        Authorization: `Bearer ${refresh.token}`,
        ...init?.headers,
      },
    });

    if (res.error === '1003') {
      console.log('1003 bug token might not yet expired');
      console.log(refresh.token);
    }

    // Retry 1001 Permission denied
    if (res.error === '1001') {
      const refresh = await getToken({ force: true });
      if (refresh.token === null) {
        if (refresh.res) {
          return refresh.res;
        }

        console.log('Auth: No token');
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

      const tryAgainRes = await _apiClient<Data, ErrorCode>(input, {
        ...init,
        headers: {
          Authorization: `Bearer ${refresh.token}`,
          ...init?.headers,
        },
      });

      if (tryAgainRes.error === '1003') {
        console.log('force refresh token bug get 1003', refresh.token);
      }

      return tryAgainRes;
    }

    return res;
  };
  return middleware;
}

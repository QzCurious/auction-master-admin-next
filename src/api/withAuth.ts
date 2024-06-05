import { type apiClient, type ApiClientResponse } from './apiClient';
import { getToken } from './getToken';

// token
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiYWNjb3VudCI6ImFkbWluIiwicm9sZSI6WyJzdXBlciJdLCJwZXJtaXNzaW9ucyI6W3siaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzIn0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcm9sZXMvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcm9sZXMifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9yb2xlcy86cm9sZSJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzLzpyb2xlIn0seyJpZCI6MCwibWV0aG9kIjoiUE9TVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL3JvbGVzL2FjY291bnQvOmFjY291bnQifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9yb2xlcy9hY2NvdW50LzphY2NvdW50In0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvcGVybWlzc2lvbnMifSx7ImlkIjowLCJtZXRob2QiOiJERUxFVEUiLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9wZXJtaXNzaW9ucyJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2NvbmZpZ3MifSx7ImlkIjowLCJtZXRob2QiOiJQQVRDSCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2FkbWlucy86aWQvcGFzc3dvcmQifSx7ImlkIjowLCJtZXRob2QiOiJQT1NUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zIn0seyJpZCI6MCwibWV0aG9kIjoiR0VUIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zIn0seyJpZCI6MCwibWV0aG9kIjoiUEFUQ0giLCJ1cmwiOiIvYXVjdGlvbi1tYXN0ZXIvYmFja2VuZC9hZG1pbnMvOmlkIn0seyJpZCI6MCwibWV0aG9kIjoiREVMRVRFIiwidXJsIjoiL2F1Y3Rpb24tbWFzdGVyL2JhY2tlbmQvYWRtaW5zLzppZCJ9LHsiaWQiOjAsIm1ldGhvZCI6IkdFVCIsInVybCI6Ii9hdWN0aW9uLW1hc3Rlci9iYWNrZW5kL2FkbWlucy9hY2NvdW50LzphY2NvdW50In1dLCJleHAiOjE3MTY1MjQ4MDMsImlhdCI6MTcxNjUyNDIwMywibmJmIjoxNzE2NTI0MjAzfQ.IEyMSckwr9kqstucrXkveguF-eJDNEv--dt_rRuA22w
// refresh token
// c897dfd4-b666-4cc3-9216-964a990c83ba

export function withAuth(_apiClient: typeof apiClient) {
  const middleware = async function <Data, ErrorCode extends string = never>(
    input: string,
    init?: RequestInit
  ): Promise<ApiClientResponse<Data, ErrorCode | '1001' | '1003'>> {
    const refresh = await getToken();

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
      const { token } = await getToken({ force: true });
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

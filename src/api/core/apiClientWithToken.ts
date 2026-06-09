import { cookies } from 'next/headers';
import { CookieConfigs } from '@/domain/auth/CookieConfigs';
import { HTTPError } from 'ky';

import { AdminRefreshToken } from '../AdminRefreshToken';
import { apiClientBase } from './apiClientBase';
import { type FailedResponseJson } from './static';

const apiClientWithToken = apiClientBase.extend({
  retry: {
    limit: 1,
    statusCodes: [401],
  },
  hooks: {
    beforeRequest: [
      async (request, options) => {
        if (request.headers.get('Authorization')) return;

        const token = cookies().get(CookieConfigs.token.name)?.value;
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    beforeRetry: [
      async ({ request, options, error, retryCount }) => {
        if (retryCount > 1) return;

        if (!(error instanceof HTTPError)) {
          return;
        }

        const res = (await error.response.clone().json()) as FailedResponseJson;
        if (res.status.code !== '1003') return;

        const token = cookies().get(CookieConfigs.token.name)?.value;
        const refreshToken = cookies().get(CookieConfigs.refreshToken.name)?.value;
        if (!token || !refreshToken) return;

        const refreshTokenRes = await AdminRefreshToken();
        if (refreshTokenRes.data) {
          console.log('apiClientWithToken: token refreshed');
          request.headers.set('Authorization', `Bearer ${refreshTokenRes.data.token}`);
        }
      },
    ],
  },
});

export { apiClientWithToken };

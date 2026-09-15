import { cookies } from 'next/headers';
import { CookieConfigs } from '@/domain/auth/CookieConfigs';

import { apiClientBase } from './apiClientBase';

/** Compatibility client until PR 2. Middleware owns proactive refresh for these callers. */
export const apiClientWithToken = apiClientBase.extend({
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        if (request.headers.has('Authorization')) return;
        const token = cookies().get(CookieConfigs.token.name)?.value;
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
  },
});

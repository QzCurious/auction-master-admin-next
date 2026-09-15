import 'server-only';

import { apiClientBase } from '@/server/apiClientBase';

/** Shared configuration only; never store user credentials here. */
export const api = apiClientBase.extend({ retry: 0, redirect: 'error' });

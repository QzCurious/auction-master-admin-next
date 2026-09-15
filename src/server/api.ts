import 'server-only';

import { apiClientBase } from '@/api/core/apiClientBase';

/** Shared configuration only; never store user credentials here. */
export const api = apiClientBase.extend({ retry: 0, redirect: 'error' });
